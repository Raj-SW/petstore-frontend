# Loading Skeleton Standardisation — Design Spec
**Date:** 2026-07-07  
**Status:** Approved  
**Scope:** Frontend (`petstore-frontend`)

---

## Problem

Three different loading patterns exist across the app with no consistency:

| Pattern | Pages | Problem |
|---|---|---|
| Custom shimmer skeleton (`.ps-skeleton`, `.gal-skeleton`, `.fp-skeleton`) | PetShop, Gallery, FeaturedProducts | Duplicated CSS, same animation 3×, not shared |
| Plain text string (`"Loading tips…"`, `"Loading…"`) | PetCareTips, MySubscriptions | No visual feedback, causes height collapse |
| Spinner (`<LoadingSpinner />`, `<FaSpinner>`) | ProfessionalList, MyOrders, AdminDashboard | Replaces grid → page shrinks → CLS |

The height collapse (CLS) happens because spinners/text render **outside** the grid wrapper, so the grid collapses to zero height during loading then jumps to full height on data arrival.

---

## Solution

**`react-loading-skeleton`** + a single `<SkeletonCard />` wrapper component, themed with VitalPaws brand colors, rendered **inside** the existing grid/list wrapper on every page.

---

## Dependency

```
npm install react-loading-skeleton
```

One new dependency. No other packages needed.

---

## Brand Theme

Added once in `src/main.jsx`, wraps the entire app:

```jsx
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Inside root render:
<SkeletonTheme baseColor="#e8ede9" highlightColor="#FAF5F1">
  {/* existing providers */}
</SkeletonTheme>
```

- `baseColor`: `#e8ede9` — light forest tint (not grey)
- `highlightColor`: `#FAF5F1` — cream (the sweep flash, matches site cream)

---

## Component

**File:** `src/Components/HelperComponents/SkeletonCard/SkeletonCard.jsx`

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"card" \| "row"` | `"card"` | Card = grid pages, Row = list pages |
| `count` | `number` | `6` | How many skeletons to render |

### `variant="card"` shape

Matches product / tip / gallery card layout:
- Full-width image block at 16:9 ratio
- Title line at 70% width
- Subtitle line at 100% width  
- Meta line at 40% width
- 8px border-radius, matching real cards

### `variant="row"` shape

Matches orders / subscriptions / professional list row layout:
- 48px circle avatar (left)
- Title line at 60% width (right of avatar)
- Subtitle line at 40% width (right of avatar)

### Usage

```jsx
// Grid page (6 card skeletons)
{isLoading && <SkeletonCard variant="card" count={6} />}

// List page (4 row skeletons)
{isLoading && <SkeletonCard variant="row" count={4} />}
```

---

## Pages Modified

| Page | File | Old pattern | New pattern | Count |
|---|---|---|---|---|
| PetShopPage | `Pages/PetShopPage/PetShopPage.jsx` | 8× `.ps-skeleton` | `<SkeletonCard variant="card" count={8} />` | 8 |
| GalleryPage | `Pages/Gallery/GalleryPage.jsx` | 6× `.gal-skeleton` | `<SkeletonCard variant="card" count={6} />` | 6 |
| PetCareTipsPage | `Pages/PetCareTips/PetCareTipsPage.jsx` | `"Loading tips…"` text | `<SkeletonCard variant="card" count={6} />` | 6 |
| FeaturedProductSection | `Pages/HomePage/HomePageSections/FeaturedProductSection.jsx` | 3× `.fp-skeleton` | `<SkeletonCard variant="card" count={3} />` | 3 |
| MyOrdersPage | `Pages/MyOrders/MyOrdersPage.jsx` | `<FaSpinner>` + text | `<SkeletonCard variant="row" count={4} />` | 4 |
| MySubscriptions | `Pages/Subscriptions/MySubscriptions.jsx` | `"Loading…"` text | `<SkeletonCard variant="row" count={3} />` | 3 |
| ProfessionalList | `Components/HelperComponents/ProfessionalList/ProfessionalList.jsx` | `<LoadingSpinner />` | `<SkeletonCard variant="row" count={4} />` | 4 |

---

## CLS Fix (Height Collapse)

The skeleton is rendered **inside the same grid/flex wrapper** as the real content, not in a centred overlay. This means:

- During loading: grid exists, contains N skeleton cards → full height preserved
- After loading: grid exists, contains N real cards → same height, no jump

Example pattern:
```jsx
<div className="ps-grid">
  {isLoading
    ? <SkeletonCard variant="card" count={8} />
    : products.map(p => <ProductCard key={p._id} product={p} />)
  }
</div>
```

---

## Cleanup

Remove the following now-unused CSS from page stylesheets:
- `.ps-skeleton` + `@keyframes ps-shimmer` from `PetShopPage.css`
- `.gal-skeleton` + `@keyframes gal-shimmer` from `Gallery.css`
- `.fp-skeleton` + `@keyframes fp-shimmer` from `FeaturedProductSection` styles

---

## Out of Scope

- `AdminDashboard` — uses `<LoadingSpinner />` for a stats dashboard; skeleton doesn't add clarity there, leave as-is
- Mutation/submit loading states (`placing`, `processing`, `cancellingId`) — button-level states, not page-level; separate concern
- Admin pages generally — low public traffic, not worth skeleton treatment now
