# Services Rebuild & Navbar Dropdown — Design Spec
**Date:** 2026-05-30

---

## Scope

Two parallel workstreams:
1. **Navbar Services dropdown** — replace the plain `Services` link with a rich hover/click dropdown showing 3 service pathways.
2. **ServicePage full reconstruction** — delete the Bootstrap placeholder, replace with a polished hub page covering all 7 VitalPaws services, with scroll-animated sections.

Additionally, fix all pending API endpoint mismatches (Groups A–E from api_layer memory).

---

## 1. Navbar Services Dropdown

### Desktop (≥ 992px)
- The "Services" nav item becomes a trigger (click-to-open, not hover — consistent with user-menu pattern).
- Dropdown appears below the nav item via `AnimatePresence` + `motion.div` (same as `nav-user-menu`).
- Three rows, each with: thumbnail image (from `NavigationBarAssets/Services/`), title, one-line description.

| Row | Label | Desc | Route |
|---|---|---|---|
| img1.webp | All Services | Explore everything we offer | `/services` |
| img2.webp | Book Appointment | Vets, groomers, trainers & more | `/appointments` |
| img3.webp | Import & Export | International pet travel assistance | `/import-export-service` |

- Click-outside closes via existing `mousedown` listener pattern.
- Active state: highlight row whose route matches `location.pathname`.

### Mobile (< 992px)
- In the slide menu, "Services" row gets a `▶` chevron.
- Tap to expand sub-items inline (accordion, no full-page nav).
- Sub-items are the same 3 routes.

---

## 2. ServicePage Full Reconstruction

**Design language:** Custom CSS variables, no Bootstrap, Framer Motion `useInView` for stagger animations. Responsive at 1200/992/575px breakpoints.

### Sections

#### A. Hero
- Full-width, `min-height: 65vh`.
- Background: `petFamily.png` (dark forest-green overlay `rgba(0,28,16,0.72)`).
- Animated entry: headline slides up, subtitle fades in 0.2s later.
- Content:
  - Deco: `─ ❧ ─` (gold paw icon + lines)
  - Headline: `OUR SERVICES` (Bebas Neue, 7rem, gold)
  - Subtitle: `Complete care for` + *happy pets* (script font)
  - Scroll-down indicator arrow

#### B. Services Grid
- Section title: `WHAT WE OFFER` (Bebas Neue, gold)
- 7 cards in a CSS Grid:
  - Desktop (≥1200px): 3-col, rows auto-sized
  - Tablet (768–1199px): 2-col
  - Mobile (<768px): 1-col
- Each card:
  - Top: service image (200px tall object-cover)
  - Body: icon badge (gold circle), title (Playfair Display), 2-line description, CTA button
  - Hover: card lifts (`translateY(-6px)`), shadow deepens
  - Framer Motion stagger: `delay = index * 0.08`

| # | Service | Image | Route |
|---|---|---|---|
| 1 | Veterinary Care | veterinary-service.png | /appointments?tab=veterinarians |
| 2 | Grooming | grooming-service.png | /appointments?tab=groomers |
| 3 | Pet Training | training-sevice.png | /appointments?tab=trainers |
| 4 | Boarding | boarding-service.png | /appointments?tab=veterinarians |
| 5 | Pet Taxi | dogHug.png | /appointments?tab=petTaxi |
| 6 | Adoption & Rescue | adoption-service.png | /services (this page) |
| 7 | Import & Export | catflying.png | /import-export-service |

#### C. Why VitalPaws
- 2-col layout (image left, stats right) on desktop; stacked on mobile.
- Image: `catKiss.png` (rounded-2xl, shadow).
- Stats grid (2×2): 4 animated counters — 4.2M rehomed, 6.8M adopted, 500+ professionals, 98% satisfaction.
- Short paragraph about the platform ethos.

#### D. CTA Banner
- Dark forest-green background.
- Headline: `Ready to give your pet the best care?`
- Two buttons: "Book Appointment" (gold pill) + "Explore Pet Store" (cream outline pill).

---

## 3. API Fixes (Groups A–E)

Applied without UI changes:
- **A** — `usersApi.js`: fix endpoint paths + remove dead methods; `AdminUsers.jsx`: fix `ROLE_OPTIONS`.
- **B** — `ordersApi.js`: fix `getMyOrders`, `updateOrderStatus`, `cancelOrder`, remove dead.
- **C** — `productsApi.js`: `updateProduct` PUT → PATCH, remove dead.
- **D** — `authApi.js`: `resetPassword` POST → PATCH.
- **E** — `professionalsApi.js`: remove `getProfessionalStats`.

---

## Responsiveness Breakpoints

| Breakpoint | Services Grid | Hero |
|---|---|---|
| ≥1200px | 3-col | 7rem headline |
| 768–1199px | 2-col | 5rem headline |
| <768px | 1-col | 3.5rem headline |

---

## Animation Summary

| Element | Animation | Trigger |
|---|---|---|
| Hero headline | `y: 40→0, opacity: 0→1` | mount, 0.1s delay |
| Hero subtitle | `y: 20→0, opacity: 0→1` | mount, 0.3s delay |
| Service cards | `y: 40→0, opacity: 0→1`, stagger 0.08s | scroll useInView |
| Stats counters | `scale: 0.85→1` | scroll useInView |
| Nav dropdown | `opacity: 0→1, y: -8→0` | click trigger |
