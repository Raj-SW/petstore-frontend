# Appointment Page → Professional Directory (P2) — Design Spec

**Date:** 2026-06-18
**Status:** Approved (design)
**Sub-project:** Design-sync **P2** of the 2026-06-14 UI/UX batch. Re-scoped during brainstorming.
**Repo:** frontend (`Raj-SW/petstore-frontend`) — **frontend-only**, no backend changes.

## Summary

Rebuild `/appointments` from a booking manager into a polished, responsive **"Meet our professionals" directory**. Customers browse veterinarians, groomers, trainers, and pet-taxi providers by category, search/sort them, open a **dedicated professional profile page** (bio, specialization, qualifications, experience, services, availability, contact), and get in touch via the site Contact page. **Slot booking and the appointments dashboard are removed.**

## Decisions (locked during brainstorming)

1. **Drill-down = dedicated route** `/appointments/professional/:id`.
2. **Booking removed entirely** — no calendar, no slot picker, no "Book Appointment".
3. **Frontend-only** — reuse the existing professionals API; no backend changes.
4. **No ratings/reviews** on profiles (the product review system doesn't cover professionals, and we're not adding one).
5. **Contact** = show email/phone + a "Get in touch" button routing to `/contact`.
6. **Dashboard tab removed** — with booking gone, the logged-in "my appointments" view has no purpose.

## Non-goals

- No backend changes (the appointment routes/models/admin stay as-is, just unused by this page).
- No reviews, ratings, or slot booking.
- **No shared-SearchBar reuse/redesign.** The existing shared `SearchBar` is hard-wired to navigate to `/petshop` (no `onSearch` callback), so using it here would send users away from the directory; generalizing it is a separate, deferred/taste-gated decision (per the design-sync overview). This page keeps a clean, on-brand **local** search field that filters the list in place.

## Architecture

### Data (existing, unchanged)

Professionals are Users with a professional role; each carries `professionalInfo`: `specialization`, `qualifications`, `experience`, `availability`, `bio`, `services[]` (`{ name, description }`), plus `name`, `email`, `phoneNumber`, `profileImage`.

- Listing: `GET /api/professionals/role/:role` (`professionalsApi.getProfessionalsByRole`).
- Detail: `GET /api/professionals/:id` (`getProfessional` controller) — **add** a `getProfessional(id)` method to `professionalsApi` (the only api change).

### `/appointments` — directory page (rebuilt `AppointmentPage`)

- Header/intro band (on-brand: forest/amber/ivory) with breadcrumb + heading "Meet our professionals" + subtitle.
- **Category tabs:** Veterinarians · Groomers · Trainers · Pet Taxi (the `dashboard` tab is removed; default tab = `veterinarians`). Tab state stays in the URL (`?tab=`) as today.
- A clean, on-brand **local search field** that filters the listed professionals in place (keep the existing list-filtering logic; just restyle the input) + the existing sort control.
- Responsive grid of **professional cards** — avatar/photo, name, role badge, specialization, a short bio snippet, experience — each with a **"View profile"** action that navigates to `/appointments/professional/:id`. No "Book" button.
- Loading / empty / error states.

### `/appointments/professional/:id` — professional detail page (new)

New `ProfessionalDetailPage` (route in `main.jsx`):

- Breadcrumb: Home / Appointments / {name}.
- Two-column (responsive → single column): left = photo/avatar + name + role badge + specialization + experience + a **contact card** (email, phone, "Get in touch" → `/contact`); right = **bio**, **qualifications**, **services** list (name + description), and **availability** rendered read-only.
- Framer-motion entrance animations; fully responsive.
- Fetches via `professionalsApi.getProfessional(id)`; loading/not-found states.

### Removed (frontend only)

- The `dashboard` tab and its `AppointmentCalendar` panel; the `ProfessionalCalendar` slot-booking flow; `AppointmentList`; and all "Book Appointment" affordances. `AppointmentPage` stops importing them. The now-unreferenced booking components (`AppointmentCalendar`, `ProfessionalCalendar`, `AppointmentList`) are deleted if nothing else imports them (verify with a grep before deleting; otherwise leave them orphaned).

## Component changes

- `ProfessionalList` → reworked into the directory grid: drop the booking/`ProfessionalCalendar` state, change the card action to "View profile" → `navigate(\`/appointments/professional/${id}\`)`, restyle the existing local search input + cards to the design system. (Keep its search/sort/pagination logic.)

## Data flow

1. Customer opens `/appointments` → picks a category tab → the grid lists that role's professionals (search/sort).
2. Clicks "View profile" → `/appointments/professional/:id` → full profile.
3. Clicks "Get in touch" → `/contact`.

## Error handling

- List fetch error → existing retry/error state.
- Detail: invalid/missing id → a friendly "Professional not found" view with a link back to `/appointments`.

## Testing (Vitest)

- `AppointmentPage`: renders the category tabs and professional cards with a **"View profile"** action and **no "Book"** button (api mocked).
- `ProfessionalDetailPage`: renders a professional's name, bio, a service, and a "Get in touch" link to `/contact` (api mocked); shows the not-found state when the api rejects.

## Files

| File | Change |
|---|---|
| `frontend/src/Services/api/professionalsApi.js` | add `getProfessional(id)` |
| `frontend/src/Pages/AppointmentPage/AppointmentPage.jsx` (+`.css`) | remove dashboard tab + booking; intro band; cards → View profile |
| `frontend/src/Components/HelperComponents/ProfessionalList/ProfessionalList.jsx` (+`.css`) | directory grid; "View profile"; restyle local search; drop booking |
| `frontend/src/Pages/AppointmentPage/ProfessionalDetailPage.jsx` (+`.css`) | **new** profile page |
| `frontend/src/Pages/AppointmentPage/ProfessionalDetailPage.test.jsx`, `AppointmentPage.test.jsx` | **new** tests |
| `frontend/src/main.jsx` | add route `/appointments/professional/:id` |
| `frontend/src/Pages/AppointmentPage/AppointmentCalendar/*`, `AppointmentList/*`, `ProfessionalCalendar` | delete if unreferenced after the rebuild |

## Open questions (none blocking)

- Whether to also drop the "Appointments" nav label/wording (it still fits a directory; leave as-is unless you want "Our Team" / "Professionals").
