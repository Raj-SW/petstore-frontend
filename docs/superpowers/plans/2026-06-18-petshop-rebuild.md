# Petstore / Shop Page Rebuild (P4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the top of the Pet Shop page around an admin-managed advert banner and elevate the whole page to the VitalPaws design system, keeping all existing product/filter/sort/pagination logic intact.

**Architecture:** Add an additive `shop` advert placement on the backend (enum + validator). On the frontend, a self-contained `ShopBanner` component fetches `shop` adverts and renders a rotating banner (or a branded fallback when none exist). `PetShopPage` is recomposed (breadcrumb strip → ShopBanner → intro band with the existing SearchBar → restyled category strip → existing body) with CSS polish throughout. AdminAdverts gains a `Pet Shop banner` option.

**Tech Stack:** React + Vite, framer-motion (AnimatePresence rotation), Vitest + Testing Library (frontend), Jest + supertest + MongoMemoryReplSet (backend), Mongoose, Joi.

**Repos:** backend (`Raj-SW/petstore-backend`) for Task 1; frontend (`Raj-SW/petstore-frontend`) for Tasks 2–6. Both on branch `feature/feedback-engagement-2026-06-14`.

**Spec:** `frontend/docs/superpowers/specs/2026-06-18-petshop-rebuild-design.md`

---

## File structure

| File | Responsibility |
|---|---|
| `backend/src/models/advert.model.js` | add `shop` to `PLACEMENTS` + enum message |
| `backend/src/validators/advert.validator.js` | allow `shop`; link optional for `shop` |
| `backend/tests/adverts.controller.test.js` | accept a `shop` advert (no link), surface via `?placement=shop` |
| `frontend/src/Components/Shop/ShopBanner.jsx` | fetch `shop` adverts; rotating banner + branded fallback |
| `frontend/src/Components/Shop/ShopBanner.css` | banner styling (brand tokens) |
| `frontend/src/Components/Shop/ShopBanner.test.jsx` | smoke test (advert title/CTA; fallback) |
| `frontend/src/Pages/PetShopPage/PetShopPage.jsx` | recompose top section; keep all handlers |
| `frontend/src/Pages/PetShopPage/PetShopPage.css` | design-system polish throughout |
| `frontend/src/Pages/Admin/Adverts/AdminAdverts.jsx` | `Pet Shop banner` option + hint + label + link-optional |

---

## Task 1: Backend — add `shop` advert placement (TDD)

**Files:**
- Modify: `backend/src/models/advert.model.js:3` and `:32`
- Modify: `backend/src/validators/advert.validator.js:10` and `:22-23`
- Test: `backend/tests/adverts.controller.test.js`

- [ ] **Step 1: Write the failing test**

In `backend/tests/adverts.controller.test.js`, add this test inside the top-level `describe` block (place it near the other create tests; reuse whatever admin-auth/token helper the file already defines — match the existing tests' style for auth headers and the admin token variable):

```javascript
  it('accepts a shop-placement advert without a link and lists it by placement', async () => {
    const res = await request(app)
      .post('/api/adverts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Mega Pet Sale', image: 'https://cdn.example.com/shop.jpg', placement: 'shop' });
    expect(res.status).toBe(201);
    expect(res.body.data.placement).toBe('shop');

    const list = await request(app).get('/api/adverts?placement=shop');
    expect(list.status).toBe(200);
    expect(list.body.data.some((a) => a.title === 'Mega Pet Sale')).toBe(true);
  });
```

> If the file's admin token variable is named differently (e.g. `token`, `adminJwt`), use that exact name — open the file's `beforeEach`/`beforeAll` to confirm before writing.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx cross-env NODE_ENV=test jest --runInBand --forceExit tests/adverts.controller.test.js`
Expected: FAIL — the new test errors with a 400/validation failure ("Placement must be banner, sponsored, hero, or promo"), because `shop` is not yet allowed.

- [ ] **Step 3: Add `shop` to the model**

In `backend/src/models/advert.model.js`, line 3:

```javascript
const PLACEMENTS = ['banner', 'sponsored', 'hero', 'promo', 'shop'];
```

And update the enum message on line 32:

```javascript
      enum: { values: PLACEMENTS, message: 'Placement must be banner, sponsored, hero, promo, or shop' },
```

(The `link` required-validator on lines 22-25 lists only `banner`/`sponsored`, so `shop` is already link-optional — no change there. `image` is already optional at the model level.)

- [ ] **Step 4: Allow `shop` in the validator**

In `backend/src/validators/advert.validator.js`, update the `placement` field (line 10) to include `shop`:

```javascript
  placement: Joi.string().valid('banner', 'sponsored', 'hero', 'promo', 'shop').messages({
    'any.only': 'Placement must be banner, sponsored, hero, promo, or shop',
```

And update the `link` conditional (lines 22-23) so `shop` joins the link-optional group:

```javascript
    link: Joi.string().trim().when('placement', {
      is: Joi.valid('hero', 'promo', 'shop'),
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx cross-env NODE_ENV=test jest --runInBand --forceExit tests/adverts.controller.test.js`
Expected: PASS — all tests in the file green (re-run once if the suite's `beforeEach` signup/login flakes; this repo's auth helper occasionally returns null under load).

- [ ] **Step 6: Commit (inside `backend/`)**

```bash
cd backend
git add src/models/advert.model.js src/validators/advert.validator.js tests/adverts.controller.test.js
git commit -m "feat: add shop advert placement for the petshop banner"
```

---

## Task 2: Frontend — `ShopBanner` component (TDD)

**Files:**
- Create: `frontend/src/Components/Shop/ShopBanner.jsx`
- Create: `frontend/src/Components/Shop/ShopBanner.css`
- Test: `frontend/src/Components/Shop/ShopBanner.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/Components/Shop/ShopBanner.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../../Services/api/advertsApi", () => ({
  default: { getAdverts: vi.fn() },
}));

import advertsApi from "../../Services/api/advertsApi";
import ShopBanner from "./ShopBanner";

describe("ShopBanner", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders an advert's title and a Shop now CTA", async () => {
    advertsApi.getAdverts.mockResolvedValue({
      data: [{ _id: "a1", title: "Mega Pet Sale", image: "https://cdn.x/s.jpg", link: "/petshop" }],
    });
    render(<ShopBanner />);
    await waitFor(() => expect(screen.getByText("Mega Pet Sale")).toBeInTheDocument());
    expect(screen.getByText(/shop now/i)).toBeInTheDocument();
  });

  it("renders the branded fallback when there are no shop adverts", async () => {
    advertsApi.getAdverts.mockResolvedValue({ data: [] });
    render(<ShopBanner />);
    await waitFor(() => expect(screen.getByText(/beloved pet/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/Components/Shop/ShopBanner.test.jsx`
Expected: FAIL — cannot resolve `./ShopBanner`.

- [ ] **Step 3: Write `ShopBanner.jsx`**

Create `frontend/src/Components/Shop/ShopBanner.jsx`:

```jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import advertsApi from "../../Services/api/advertsApi";
import petshopBanner from "../../assets/PetShopPageAssets/PetshopBannerBackgroundImg.png";
import "./ShopBanner.css";

const INTERVAL = 6000;

// Branded default shown when no `shop` adverts are active.
const FALLBACK = {
  id: "fallback",
  title: "Everything for your beloved pet",
  subtitle: "Curated essentials, premium nutrition, and unique finds — all in one place.",
  image: petshopBanner,
  link: null,
  fallback: true,
};

const slideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const ShopBanner = () => {
  const [slides, setSlides] = useState([FALLBACK]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    advertsApi
      .getAdverts("shop")
      .then((res) => {
        const ads = res?.data || [];
        if (ads.length) {
          setSlides(ads.map((a) => ({
            id: a._id,
            title: a.title,
            subtitle: "",
            image: a.image,
            link: a.link,
          })));
          setActive(0);
        }
      })
      .catch(() => {}); // keep the fallback on failure
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = setTimeout(() => setActive((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearTimeout(id);
  }, [active, slides.length]);

  const slide = slides[active] || slides[0];
  if (!slide) return null;

  const external = typeof slide.link === "string" && slide.link.startsWith("http");
  const cta = slide.link ? (
    <span className="shb-cta">
      Shop now <FiArrowRight size={15} aria-hidden="true" />
    </span>
  ) : null;

  const inner = (
    <>
      <div className="shb-overlay" />
      <div className="shb-content">
        <h1 className="shb-title">{slide.title}</h1>
        {slide.subtitle && <p className="shb-subtitle">{slide.subtitle}</p>}
        {cta}
      </div>
    </>
  );

  return (
    <section className="shb-wrap">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id ?? active}
          className="shb-slide"
          style={{ backgroundImage: slide.image ? `url(${slide.image})` : undefined }}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {slide.link ? (
            <a
              className="shb-link"
              href={slide.link}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              {inner}
            </a>
          ) : (
            <div className="shb-link shb-link--static">{inner}</div>
          )}
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <div className="shb-dots">
          {slides.map((s, i) => (
            <button
              key={s.id ?? i}
              type="button"
              className={`shb-dot${i === active ? " shb-dot--active" : ""}`}
              aria-label={`Go to banner ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ShopBanner;
```

- [ ] **Step 4: Write `ShopBanner.css`**

Create `frontend/src/Components/Shop/ShopBanner.css`:

```css
.shb-wrap {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.shb-slide {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  min-height: 260px;
  background-color: var(--color-primary-forest, #001c10);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
}

.shb-link {
  display: block;
  width: 100%;
  text-decoration: none;
  color: inherit;
}

.shb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 28, 16, 0.78) 0%, rgba(0, 28, 16, 0.35) 60%, rgba(0, 28, 16, 0.15) 100%);
}

.shb-content {
  position: relative;
  padding: 2.4rem 2.6rem;
  max-width: 620px;
}

.shb-title {
  font-family: var(--font-display, 'Bebas Neue', sans-serif);
  color: #f6ece3;
  font-size: clamp(1.8rem, 4vw, 3rem);
  line-height: 1.05;
  letter-spacing: 0.01em;
  margin: 0;
}

.shb-subtitle {
  font-family: var(--font-body);
  color: rgba(246, 236, 227, 0.86);
  font-size: 1rem;
  margin: 0.8rem 0 0;
  max-width: 460px;
}

.shb-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 1.4rem;
  background: var(--color-accent-gold, #d99a2b);
  color: #2a1a05;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.7rem 1.5rem;
  border-radius: 50px;
  transition: transform 0.18s ease, background 0.18s ease;
}

.shb-link:hover .shb-cta {
  transform: translateY(-2px);
  background: #BA7517;
}

.shb-dots {
  display: flex;
  justify-content: center;
  gap: 7px;
  margin-top: 0.9rem;
}

.shb-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(0, 28, 16, 0.22);
  cursor: pointer;
  transition: width 0.2s ease, background 0.2s ease;
}

.shb-dot--active {
  width: 22px;
  border-radius: 5px;
  background: var(--color-accent-gold, #d99a2b);
}

@media (max-width: 640px) {
  .shb-slide { min-height: 200px; }
  .shb-content { padding: 1.6rem 1.5rem; }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/Components/Shop/ShopBanner.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit (inside `frontend/`)**

```bash
cd frontend
git add src/Components/Shop/
git commit -m "feat: ShopBanner advert component with rotation + branded fallback"
```

---

## Task 3: Recompose the PetShopPage top section

**Files:**
- Modify: `frontend/src/Pages/PetShopPage/PetShopPage.jsx` (imports + the returned JSX `ps-hero` section)

Keep every handler, state hook, and the entire body (`ps-body` onward) exactly as-is. Only the imports and the top section (the `ps-hero` `<section>` through the category strip) change.

- [ ] **Step 1: Add the ShopBanner import**

In `frontend/src/Pages/PetShopPage/PetShopPage.jsx`, add after the `SearchBar` import (line 9):

```jsx
import ShopBanner from "../../Components/Shop/ShopBanner";
```

The `petshopBanner` import (line 12) is no longer used by this file (it moved into ShopBanner). Remove line 12:

```jsx
import petshopBanner from "@/assets/PetShopPageAssets/PetshopBannerBackgroundImg.png";
```

- [ ] **Step 2: Replace the hero section**

Replace the entire `{/* ── Hero ── */}` `<section className="ps-hero" …> … </section>` block (lines 208-246) with this breadcrumb strip + banner + intro band:

```jsx
      {/* ── Breadcrumb strip ── */}
      <div className="ps-crumb-strip">
        <div className="ps-crumb-inner">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Pet Shop", path: "/petshop" },
            ]}
          />
        </div>
      </div>

      {/* ── Advert banner (admin-managed, with branded fallback) ── */}
      <ShopBanner />

      {/* ── Intro band: heading + prominent search ── */}
      <section className="ps-intro">
        <motion.h1
          className="ps-intro-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Pet Shop
        </motion.h1>
        <motion.p
          className="ps-intro-subtitle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Find food, toys, accessories and more — everything your companion needs.
        </motion.p>
        <motion.div
          className="ps-intro-search"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <SearchBar showInPages={["/petshop"]} />
        </motion.div>
      </section>
```

Leave the `{/* ── Category quick-filter strip ── */}` block and everything below it unchanged.

- [ ] **Step 3: Build to verify it compiles**

Run: `npm run build`
Expected: clean build (no unused-import or unresolved-module errors). If the linter flags the now-unused `motion`/`AnimatePresence`, note they are still used elsewhere in the file (grid + drawer) so no import change is needed.

- [ ] **Step 4: Commit (inside `frontend/`)**

```bash
cd frontend
git add src/Pages/PetShopPage/PetShopPage.jsx
git commit -m "feat: petshop top section — breadcrumb strip, advert banner, intro+search"
```

---

## Task 4: Visual polish CSS (chips, intro, toolbar, grid, pagination)

**Files:**
- Modify: `frontend/src/Pages/PetShopPage/PetShopPage.css`

The old `.ps-hero*` rules are now unused (the markup is gone). Replace them with the new strip/intro rules and polish the rest.

- [ ] **Step 1: Replace the hero CSS block with breadcrumb-strip + intro styles**

In `frontend/src/Pages/PetShopPage/PetShopPage.css`, delete the `.ps-hero`, `.ps-hero-overlay`, `.ps-hero-inner`, `.ps-hero-title`, `.ps-hero-accent`, and `.ps-hero-subtitle` rules (the block starting at line 7), and insert in their place:

```css
.ps-crumb-strip {
  background: var(--color-ivory, #f6ece3);
  border-bottom: 1px solid rgba(0, 28, 16, 0.06);
  padding: 0.9rem 1.25rem;
}

.ps-crumb-inner {
  max-width: 1280px;
  margin: 0 auto;
}

.ps-intro {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  padding: 1.8rem 1.25rem 0.5rem;
}

.ps-intro-title {
  font-family: var(--font-display, 'Bebas Neue', sans-serif);
  color: var(--color-primary-forest, #001c10);
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1;
  letter-spacing: 0.02em;
  margin: 0;
}

.ps-intro-subtitle {
  font-family: var(--font-body);
  color: #5b6b5f;
  font-size: 1rem;
  margin: 0.6rem auto 1.3rem;
  max-width: 520px;
}

.ps-intro-search {
  display: flex;
  justify-content: center;
}
```

- [ ] **Step 2: Polish the category chips**

Replace the `.ps-cat-chip`, `.ps-cat-chip:hover`, and `.ps-cat-chip--active` rules with:

```css
.ps-cat-chip {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a574d;
  background: #fff;
  border: 1px solid rgba(0, 28, 16, 0.12);
  border-radius: 50px;
  padding: 0.5rem 1.15rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}

.ps-cat-chip:hover {
  border-color: var(--color-accent-gold, #d99a2b);
  color: var(--color-accent-gold, #d99a2b);
}

.ps-cat-chip--active {
  background: var(--color-primary-forest, #001c10);
  border-color: var(--color-primary-forest, #001c10);
  color: #f6ece3;
}
```

- [ ] **Step 3: Polish the toolbar + result count**

Find the `.ps-section-title` and `.ps-result-count` rules and replace them with:

```css
.ps-section-title {
  font-family: var(--font-display, 'Bebas Neue', sans-serif);
  color: var(--color-primary-forest, #001c10);
  font-size: 1.7rem;
  letter-spacing: 0.01em;
  margin: 0;
}

.ps-result-count {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: #8a958c;
  margin-left: 0.6rem;
}
```

- [ ] **Step 4: Polish the pagination buttons**

Find the `.ps-page-btn` and `.ps-page-btn--active` rules and replace them with:

```css
.ps-page-btn {
  min-width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(0, 28, 16, 0.12);
  background: #fff;
  font-family: var(--font-body);
  font-weight: 600;
  color: #4a574d;
  cursor: pointer;
  transition: all 0.18s ease;
}

.ps-page-btn:hover:not(:disabled) {
  border-color: var(--color-accent-gold, #d99a2b);
  color: var(--color-accent-gold, #d99a2b);
}

.ps-page-btn--active {
  background: var(--color-accent-gold, #d99a2b);
  border-color: var(--color-accent-gold, #d99a2b);
  color: #2a1a05;
}
```

> If any of the class names in Steps 3-4 don't exist verbatim, open `PetShopPage.css`, find the nearest equivalent rule for that element, and update it in place rather than adding a duplicate.

- [ ] **Step 5: Build to verify**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 6: Commit (inside `frontend/`)**

```bash
cd frontend
git add src/Pages/PetShopPage/PetShopPage.css
git commit -m "style: petshop design-system polish — chips, intro, toolbar, pagination"
```

---

## Task 5: AdminAdverts — add the `Pet Shop banner` option

**Files:**
- Modify: `frontend/src/Pages/Admin/Adverts/AdminAdverts.jsx` (lines ~79, ~138-140, ~224, ~228, ~261)

- [ ] **Step 1: Add `shop` to the link-optional check**

On line 79, include `shop`:

```jsx
    const linkOptional = form.placement === "hero" || form.placement === "promo" || form.placement === "shop";
```

- [ ] **Step 2: Add the placement option**

In the placement `<select>` (after the `promo` option, line 224), add:

```jsx
                  <option value="shop">Pet Shop page banner</option>
```

- [ ] **Step 3: Treat `shop` like hero/promo for the image label**

On line 228, the image label drops "(optional)" for image-led placements. Include `shop`:

```jsx
                <label>Image{["hero", "promo", "shop"].includes(form.placement) ? "" : " (optional)"}</label>
```

- [ ] **Step 4: Add a size hint for `shop`**

After the `promo` hint block (line 261), add:

```jsx
                {form.placement === "shop" && (
                  <p className="aa-hint">Shown at the top of the Pet Shop page. Recommended ~1600 × 500 px (wide banner). Keep key content left-aligned.</p>
                )}
```

- [ ] **Step 5: Show a readable label in the table**

In the Placement column `render` (lines 138-140), replace the binary label with a map so `shop` (and hero/promo) read correctly:

```jsx
        <span className={`aa-placement ${value}`}>
          {{ banner: "Banner", sponsored: "Sponsored card", hero: "Homepage hero", promo: "Homepage promo", shop: "Pet Shop banner" }[value] || value}
        </span>
```

- [ ] **Step 6: Build to verify**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 7: Commit (inside `frontend/`)**

```bash
cd frontend
git add src/Pages/Admin/Adverts/AdminAdverts.jsx
git commit -m "feat: admin adverts — Pet Shop banner placement option"
```

---

## Task 6: Final verification

- [ ] **Step 1: Frontend tests + build**

Run (from `frontend/`):
```bash
npx vitest run src/Components/Shop/ShopBanner.test.jsx
npm run build
```
Expected: ShopBanner 2/2 pass; build clean.

- [ ] **Step 2: Backend advert suite**

Run (from `backend/`):
```bash
npx cross-env NODE_ENV=test jest --runInBand --forceExit tests/adverts.controller.test.js tests/advert.model.test.js
```
Expected: all pass (re-run once if the auth `beforeEach` flakes).

- [ ] **Step 3: Manual smoke (browser)**

- `/petshop`: with no `shop` advert, the banner shows the branded fallback ("Everything for your beloved pet"); heading "Pet Shop" + search are prominent; category chips, sidebar filters, sort, per-page, pagination, and the mobile filter drawer all still work.
- Admin → Adverts: create a `Pet Shop page banner` advert (image + title + optional link) → it appears at the top of `/petshop`; add a second → the banner auto-rotates with dot indicators; "Shop now" navigates to the link.
- Mobile width: banner, intro/search, and chips remain readable; drawer opens.

---

## Self-Review

**Spec coverage:**
- New `shop` placement (model + validator + no migration) → Task 1 ✅
- `ShopBanner` fetch + rotation + branded fallback + CTA-only-when-link → Task 2 ✅
- Recompose top: breadcrumb strip → banner → intro+search, keep body/logic → Task 3 ✅
- Polish throughout (chips, intro, toolbar, grid spacing, pagination) → Task 4 ✅
- AdminAdverts `shop` option + hint + label + link-optional → Task 5 ✅
- Tests (backend accept `shop`; Vitest ShopBanner advert + fallback) → Tasks 1, 2 ✅
- Keep existing SearchBar reused as-is → Task 3 (renders `<SearchBar>`), no redesign ✅

**Placeholder scan:** No TBD/TODO. Each code step shows the literal code. The two "if the name differs" notes (Task 1 admin token, Task 4 class names) are grounded-adaptation instructions for existing files, with a concrete default — not missing logic.

**Type/name consistency:** `advertsApi.getAdverts('shop')` (Task 2) matches the existing service signature and the backend `?placement=shop` (Task 1). `ShopBanner` default export imported in Task 3. Slide object keys (`id/title/subtitle/image/link`) are consistent within Task 2. CSS classes used in Task 3 JSX (`ps-crumb-strip`, `ps-crumb-inner`, `ps-intro`, `ps-intro-title`, `ps-intro-subtitle`, `ps-intro-search`) are all defined in Task 4 Step 1. Brand tokens (`--color-primary-forest`, `--color-accent-gold`, `--font-display`, `--font-body`) match the existing `PetShopPage.css` usage.
