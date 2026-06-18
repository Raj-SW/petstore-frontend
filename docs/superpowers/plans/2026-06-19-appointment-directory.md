# Appointment Page → Professional Directory (P2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/appointments` into a professional **directory + profiles**, removing slot booking and the appointments dashboard.

**Architecture:** `/appointments` keeps category tabs (Vet/Groomer/Trainer/Pet Taxi) and a searchable/sortable grid of professional cards whose action is "View profile" → a new `/appointments/professional/:id` detail page (bio, qualifications, services, availability, contact → `/contact`). Frontend-only; the existing professionals API (`getProfessionalsByRole`, `getProfessionalById`) is reused unchanged. Booking (`ProfessionalCalendar`), the dashboard tab (`AppointmentCalendar`), and `AppointmentList` are removed.

**Tech Stack:** React + Vite, react-router-dom, framer-motion, Vitest + Testing Library.

**Repo:** frontend (`Raj-SW/petstore-frontend`), branch `feature/feedback-engagement-2026-06-14`.

**Spec:** `frontend/docs/superpowers/specs/2026-06-18-appointment-directory-design.md`

**Note:** `professionalsApi.getProfessionalById(id)` already exists — no api change needed. Professional objects are flattened: `{ _id, name, email, phone, specialization, specialties, qualifications, experience, bio, services, availability, image, rating }`.

---

## File structure

| File | Responsibility |
|---|---|
| `src/Pages/AppointmentPage/ProfessionalDetailPage.jsx` (+`.css`) | **new** profile page |
| `src/Pages/AppointmentPage/ProfessionalDetailPage.test.jsx` | profile page tests |
| `src/main.jsx` | route `/appointments/professional/:id` |
| `src/Components/HelperComponents/ProfessionalCard/ProfessionalCard.jsx` | button → "View profile" |
| `src/Components/HelperComponents/ProfessionalList/ProfessionalList.jsx` | drop booking; "View profile" navigates to detail |
| `src/Pages/AppointmentPage/AppointmentPage.jsx` | remove dashboard tab + booking; intro band |
| `src/Pages/AppointmentPage/AppointmentPage.test.jsx` | directory tests |
| booking components | delete if unreferenced (Task 6) |

---

### Task 1: Professional detail page (TDD)

**Files:**
- Create: `src/Pages/AppointmentPage/ProfessionalDetailPage.jsx`, `ProfessionalDetailPage.css`
- Test: `src/Pages/AppointmentPage/ProfessionalDetailPage.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/Pages/AppointmentPage/ProfessionalDetailPage.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../../Services/api/professionalsApi", () => ({
  default: { getProfessionalById: vi.fn() },
}));

import professionalsApi from "../../Services/api/professionalsApi";
import ProfessionalDetailPage from "./ProfessionalDetailPage";

const renderAt = (id) =>
  render(
    <MemoryRouter initialEntries={[`/appointments/professional/${id}`]}>
      <Routes>
        <Route path="/appointments/professional/:id" element={<ProfessionalDetailPage />} />
        <Route path="/contact" element={<div>Contact Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("ProfessionalDetailPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the professional's profile, a service, and a Get in touch link", async () => {
    professionalsApi.getProfessionalById.mockResolvedValue({
      _id: "p1", name: "Dr. Jo Alexander", role: "veterinarian",
      specialization: "Small animals", experience: 6, bio: "Caring vet with a gentle touch.",
      qualifications: ["DVM"], services: [{ name: "Wellness exam", description: "Full checkup" }],
      availability: "Mon–Fri", email: "jo@example.com", phone: "+230 5000 0000",
    });
    renderAt("p1");
    await waitFor(() => expect(screen.getByText("Dr. Jo Alexander")).toBeInTheDocument());
    expect(screen.getByText(/caring vet/i)).toBeInTheDocument();
    expect(screen.getByText("Wellness exam")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get in touch/i })).toHaveAttribute("href", "/contact");
  });

  it("shows a not-found state when the professional can't be loaded", async () => {
    professionalsApi.getProfessionalById.mockRejectedValue(new Error("404"));
    renderAt("missing");
    await waitFor(() => expect(screen.getByText(/not found/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run (from `frontend/`): `npx vitest run src/Pages/AppointmentPage/ProfessionalDetailPage.test.jsx`
Expected: FAIL — cannot resolve `./ProfessionalDetailPage`.

- [ ] **Step 3: Write `ProfessionalDetailPage.jsx`**

```jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiArrowLeft, FiAward, FiClock, FiCheckCircle } from "react-icons/fi";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import professionalsApi from "../../Services/api/professionalsApi";
import "./ProfessionalDetailPage.css";

const ROLE_LABELS = {
  veterinarian: "Veterinarian", groomer: "Groomer", trainer: "Trainer", petTaxi: "Pet Taxi",
};

const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Pro")}&background=74B49B&color=fff&size=256`;

const ProfessionalDetailPage = () => {
  const { id } = useParams();
  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    professionalsApi
      .getProfessionalById(id)
      .then((data) => { if (active) setPro(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="pd-page"><div className="pd-loading">Loading…</div></div>;
  }

  if (error || !pro) {
    return (
      <div className="pd-page">
        <div className="pd-notfound">
          <h1>Professional not found</h1>
          <p>We couldn’t load this profile.</p>
          <Link to="/appointments" className="pd-back-link"><FiArrowLeft /> Back to professionals</Link>
        </div>
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[pro.role] || "Professional";
  const specialty = pro.specialization
    || (Array.isArray(pro.specialties) ? pro.specialties.join(", ") : "");
  const qualifications = pro.qualifications || [];
  const services = pro.services || [];

  return (
    <div className="pd-page">
      <div className="pd-crumb">
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Appointments", path: "/appointments" },
            { label: pro.name, path: null },
          ]}
        />
      </div>

      <motion.div
        className="pd-grid"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Left — identity + contact */}
        <aside className="pd-aside">
          <img src={pro.image || avatarUrl(pro.name)} alt={pro.name} className="pd-avatar" />
          <span className="pd-role">{roleLabel}</span>
          <h1 className="pd-name">{pro.name}</h1>
          {specialty && <p className="pd-specialty">{specialty}</p>}
          {pro.experience != null && (
            <p className="pd-experience"><FiClock /> {pro.experience} years experience</p>
          )}

          <div className="pd-contact">
            {pro.email && <a className="pd-contact-line" href={`mailto:${pro.email}`}><FiMail /> {pro.email}</a>}
            {pro.phone && <a className="pd-contact-line" href={`tel:${pro.phone}`}><FiPhone /> {pro.phone}</a>}
            <Link to="/contact" className="pd-cta">Get in touch</Link>
          </div>
        </aside>

        {/* Right — details */}
        <div className="pd-main">
          {pro.bio && (
            <section className="pd-section">
              <h2 className="pd-section-title">About</h2>
              <p className="pd-bio">{pro.bio}</p>
            </section>
          )}

          {qualifications.length > 0 && (
            <section className="pd-section">
              <h2 className="pd-section-title"><FiAward /> Qualifications</h2>
              <ul className="pd-quals">
                {qualifications.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </section>
          )}

          {services.length > 0 && (
            <section className="pd-section">
              <h2 className="pd-section-title">Services</h2>
              <div className="pd-services">
                {services.map((s, i) => (
                  <div key={i} className="pd-service">
                    <p className="pd-service-name"><FiCheckCircle /> {s.name}</p>
                    {s.description && <p className="pd-service-desc">{s.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {pro.availability && (
            <section className="pd-section">
              <h2 className="pd-section-title"><FiClock /> Availability</h2>
              <p className="pd-availability">
                {typeof pro.availability === "string" ? pro.availability : JSON.stringify(pro.availability)}
              </p>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfessionalDetailPage;
```

- [ ] **Step 4: Write `ProfessionalDetailPage.css`**

```css
.pd-page { max-width: 1100px; margin: 0 auto; padding: 1.5rem 5% 4rem; }
.pd-crumb { margin-bottom: 1.4rem; }
.pd-loading, .pd-notfound { padding: 4rem 0; text-align: center; color: #5b6b5f; }
.pd-notfound h1 { font-family: var(--font-display, 'Bebas Neue', sans-serif); color: var(--color-primary-forest, #001c10); }
.pd-back-link, .pd-cta {
  display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
}
.pd-back-link { color: var(--color-accent-gold, #d99a2b); font-weight: 600; margin-top: 1rem; }

.pd-grid {
  display: grid; grid-template-columns: 320px 1fr; gap: 2.5rem; align-items: start;
}

.pd-aside {
  background: #fff; border: 1px solid rgba(0, 28, 16, 0.08); border-radius: 20px;
  padding: 1.8rem; text-align: center; position: sticky; top: 96px;
}
.pd-avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 1rem; display: block; }
.pd-role {
  display: inline-block; background: var(--color-bg-warm-ivory, #f6ece3);
  color: var(--color-primary-forest, #001c10); font-weight: 600; font-size: 0.78rem;
  padding: 0.3rem 0.9rem; border-radius: 50px; margin-bottom: 0.6rem;
}
.pd-name { font-family: var(--font-display, 'Bebas Neue', sans-serif); font-size: 1.8rem; color: var(--color-primary-forest, #001c10); margin: 0; }
.pd-specialty { color: #5b6b5f; margin: 0.3rem 0 0; }
.pd-experience { display: inline-flex; align-items: center; gap: 6px; color: #8a958c; font-size: 0.9rem; margin: 0.8rem 0; }
.pd-contact { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
.pd-contact-line { display: inline-flex; align-items: center; gap: 8px; color: #4a574d; text-decoration: none; font-size: 0.9rem; justify-content: center; }
.pd-contact-line:hover { color: var(--color-accent-gold, #d99a2b); }
.pd-cta {
  justify-content: center; margin-top: 0.6rem; background: var(--color-primary-forest, #001c10);
  color: #f6ece3; font-weight: 600; padding: 0.7rem 1.4rem; border-radius: 50px; transition: background 0.18s ease;
}
.pd-cta:hover { background: var(--color-accent-gold, #d99a2b); color: var(--color-primary-forest, #001c10); }

.pd-main { display: flex; flex-direction: column; gap: 1.6rem; }
.pd-section { background: #fff; border: 1px solid rgba(0, 28, 16, 0.08); border-radius: 16px; padding: 1.4rem 1.6rem; }
.pd-section-title { display: flex; align-items: center; gap: 8px; font-family: var(--font-display, 'Bebas Neue', sans-serif); color: var(--color-primary-forest, #001c10); font-size: 1.3rem; margin: 0 0 0.7rem; }
.pd-bio { color: #4a574d; line-height: 1.7; margin: 0; }
.pd-quals { margin: 0; padding-left: 1.2rem; color: #4a574d; line-height: 1.8; }
.pd-services { display: flex; flex-direction: column; gap: 0.9rem; }
.pd-service-name { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--color-primary-forest, #001c10); margin: 0; }
.pd-service-name svg { color: var(--color-accent-gold, #d99a2b); }
.pd-service-desc { margin: 0.2rem 0 0 1.5rem; color: #5b6b5f; font-size: 0.92rem; }
.pd-availability { color: #4a574d; margin: 0; }

@media (max-width: 860px) {
  .pd-grid { grid-template-columns: 1fr; }
  .pd-aside { position: static; }
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run src/Pages/AppointmentPage/ProfessionalDetailPage.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
cd frontend
git add src/Pages/AppointmentPage/ProfessionalDetailPage.jsx src/Pages/AppointmentPage/ProfessionalDetailPage.css src/Pages/AppointmentPage/ProfessionalDetailPage.test.jsx
git commit -m "feat: professional detail page (profile, services, contact)"
```

---

### Task 2: Route the detail page

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Import + add the route**

In `src/main.jsx`, add the import near the other page imports:

```jsx
import ProfessionalDetailPage from "./Pages/AppointmentPage/ProfessionalDetailPage.jsx";
```

Add a sibling route right after the existing `{ path: "appointments", element: <AppointmentPage /> }` entry (the public one, ~line 85):

```jsx
      {
        path: "appointments/professional/:id",
        element: <ProfessionalDetailPage />,
      },
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/main.jsx
git commit -m "feat: route /appointments/professional/:id"
```

---

### Task 3: Card → "View profile"; list navigates to the detail page

**Files:**
- Modify: `src/Components/HelperComponents/ProfessionalCard/ProfessionalCard.jsx`
- Modify: `src/Components/HelperComponents/ProfessionalList/ProfessionalList.jsx`

- [ ] **Step 1: Relabel the card button**

In `ProfessionalCard.jsx`, change the footer button text from `Book Appointment` to `View profile` (keep the `onBook` prop name):

```jsx
        <Button onClick={onBook} className="book-appointment-btn rounded-5">
          View profile
        </Button>
```

- [ ] **Step 2: Make the list navigate instead of opening the calendar**

In `ProfessionalList.jsx`:

(a) Remove the booking import:

```jsx
import ProfessionalCalendar from "@/Components/HelperComponents/ProfessionalCalendar/ProfessionalCalendar";
```

(b) Add `useNavigate` to the existing react-router import (or add a new import line):

```jsx
import { useNavigate } from "react-router-dom";
```
and inside the component: `const navigate = useNavigate();`

(c) Replace the `handleBook` callback body so it navigates to the detail page:

```jsx
  const handleBook = useCallback(
    (professional) => {
      navigate(`/appointments/professional/${professional._id || professional.id}`);
    },
    [navigate]
  );
```

(d) Remove the now-unused booking state and the calendar render branch: delete the `showCalendar` / `selectedProfessional` `useState` declarations, the `handleBackToList` callback, and the `if (showCalendar && selectedProfessional) { return <ProfessionalCalendar … />; }` block near the top of the render. (Grep the file for `showCalendar`, `selectedProfessional`, `ProfessionalCalendar`, `handleBackToList` and remove each occurrence.)

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: clean build (no unused-import/undefined errors). If `onProfessionalSelect` becomes unused, leave the prop in the signature (harmless) — other callers may pass it.

- [ ] **Step 4: Commit**

```bash
cd frontend
git add src/Components/HelperComponents/ProfessionalCard/ProfessionalCard.jsx src/Components/HelperComponents/ProfessionalList/ProfessionalList.jsx
git commit -m "feat: professional cards open the profile page (no booking)"
```

---

### Task 4: Rebuild the directory page (remove dashboard + booking) (TDD)

**Files:**
- Modify: `src/Pages/AppointmentPage/AppointmentPage.jsx`
- Test: `src/Pages/AppointmentPage/AppointmentPage.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/Pages/AppointmentPage/AppointmentPage.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1" } }) }));
vi.mock("@/Components/HelperComponents/ProfessionalList/ProfessionalList", () => ({
  default: ({ role }) => <div data-testid="prolist">{role}</div>,
}));

import AppointmentPage from "./AppointmentPage";

describe("AppointmentPage (directory)", () => {
  it("shows category tabs and no dashboard or booking", () => {
    render(<MemoryRouter><AppointmentPage /></MemoryRouter>);
    expect(screen.getByText("Veterinarians")).toBeInTheDocument();
    expect(screen.getByText("Groomers")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText(/Book Appointment/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/Pages/AppointmentPage/AppointmentPage.test.jsx`
Expected: FAIL — "Dashboard" tab still present (and/or AppointmentCalendar import errors under the mock).

- [ ] **Step 3: Remove the dashboard tab + booking from `AppointmentPage.jsx`**

(a) Remove the `AppointmentCalendar` import:

```jsx
import AppointmentCalendar from "./AppointmentCalendar/appointmentCalendar";
```

(b) Drop the `dashboard` entry from `TABS`:

```jsx
const TABS = [
  { key: "veterinarians", label: "Veterinarians", icon: FaStethoscope },
  { key: "groomers",      label: "Groomers",      icon: FaCut },
  { key: "trainers",      label: "Trainers",      icon: FaDog },
  { key: "petTaxi",       label: "Pet Taxi",      icon: FaTaxi },
];
```

(c) In `renderPanel`, remove the `dashboard` case:

```jsx
  const renderPanel = () => {
    switch (activeTab) {
      case "veterinarians": return <ProfessionalList role="veterinarian" />;
      case "groomers":      return <ProfessionalList role="groomer" />;
      case "trainers":      return <ProfessionalList role="trainer" />;
      case "petTaxi":       return <ProfessionalList role="petTaxi" />;
      default:              return <ProfessionalList role="veterinarian" />;
    }
  };
```

(d) The two `useEffect`s and the `visibleTabs` line reference `dashboard`/`authOnly`. Simplify: `const visibleTabs = TABS;` and remove the `if (!user && activeTab === "dashboard")` / `urlTab === "dashboard"` guards (the dashboard tab no longer exists). Keep the URL-sync effect that sets `activeTab` from `?tab=` for valid tabs.

(e) Update the sidebar header copy to suit a directory (optional but on-spec): change the title to `Meet our professionals` and subtitle to `Browse our certified pet-care team`.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/Pages/AppointmentPage/AppointmentPage.test.jsx`
Expected: PASS.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 6: Commit**

```bash
cd frontend
git add src/Pages/AppointmentPage/AppointmentPage.jsx src/Pages/AppointmentPage/AppointmentPage.test.jsx
git commit -m "feat: appointments directory — remove dashboard + booking tab"
```

---

### Task 5: Delete the now-unreferenced booking components

**Files:**
- Delete: `src/Pages/AppointmentPage/AppointmentCalendar/`, `src/Pages/AppointmentPage/AppointmentList/`, `src/Components/HelperComponents/ProfessionalCalendar/`

- [ ] **Step 1: Confirm nothing else imports them**

Run:
```bash
grep -rn "AppointmentCalendar\|AppointmentList\|ProfessionalCalendar" src --include=*.jsx | grep -v "Pages/AppointmentPage/AppointmentCalendar/\|Pages/AppointmentPage/AppointmentList/\|Components/HelperComponents/ProfessionalCalendar/"
```
Expected: no output (no remaining importers). If anything prints, **do not delete** that component — leave it and note the orphan.

- [ ] **Step 2: Delete the unreferenced folders**

```bash
rm -rf src/Pages/AppointmentPage/AppointmentCalendar src/Pages/AppointmentPage/AppointmentList src/Components/HelperComponents/ProfessionalCalendar
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 4: Commit**

```bash
cd frontend
git add -A
git commit -m "chore: remove unused appointment booking components"
```

---

### Task 6: Final verification

- [ ] **Step 1: Tests + build**

Run (from `frontend/`):
```bash
npx vitest run src/Pages/AppointmentPage/
npm run build
```
Expected: directory + detail tests pass; clean build.

- [ ] **Step 2: Browser smoke**

- `/appointments`: category tabs (Vet/Groomer/Trainer/Pet Taxi), search + sort, professional cards with **"View profile"** (no Book), no Dashboard tab.
- Click "View profile" → `/appointments/professional/:id` shows the profile (bio, qualifications, services, availability, email/phone) and a **"Get in touch"** button that goes to `/contact`.
- A bad id → "Professional not found" with a link back.
- Responsive: profile collapses to one column on narrow widths.

---

## Self-Review

**Spec coverage:**
- Dedicated detail route `/appointments/professional/:id` → Tasks 1–2 ✅
- Directory: category tabs + local search/sort + "View profile" cards → Tasks 3–4 ✅
- Detail content: bio, qualifications, services, availability, contact → `/contact` → Task 1 ✅
- Booking removed; dashboard removed → Tasks 3–5 ✅
- Frontend-only, no api change (`getProfessionalById` already exists) → noted ✅
- No ratings/reviews on the profile → Task 1 (profile renders none) ✅
- On-brand local search (no shared-SearchBar reuse) → Task 3 keeps the existing list search, restyled ✅
- Tests (directory has no Book/Dashboard; detail renders profile + not-found) → Tasks 1, 4 ✅

**Placeholder scan:** No TBD/TODO. Task 3 (d) and Task 5 (1) use grep-first removal against the live files — concrete, deterministic instructions, not missing logic.

**Type/name consistency:** `professionalsApi.getProfessionalById(id)` is the real existing method, used in Task 1 and matched by the Task 1 test mock. The detail route path `/appointments/professional/:id` is identical in Task 2 (route), Task 3 (navigate), and Task 1 (Link targets `/appointments`/`/contact`). `onBook` prop name is preserved in Task 3 across `ProfessionalCard` and `ProfessionalList`. Flattened professional fields (`name`, `specialization`/`specialties`, `qualifications`, `experience`, `bio`, `services`, `availability`, `email`, `phone`, `image`) match what `ProfessionalList` already reads.
