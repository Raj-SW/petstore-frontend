# Loading Skeleton Standardisation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 3 duplicated shimmer CSS blocks + 2 text-only loading strings + 2 spinner-as-page-replacement patterns with a single `<SkeletonCard />` component using `react-loading-skeleton`, themed with VitalPaws brand colors, rendered inside existing grid/list wrappers to eliminate height collapse (CLS).

**Architecture:** One new component (`SkeletonCard`) renders N card or row skeletons as an array of React elements — no extra wrapper div — so they slot directly into the parent grid/flex container and preserve layout height during loading. `SkeletonTheme` is added once in `main.jsx`, globally applying brand colors.

**Tech Stack:** React 18, react-loading-skeleton, Vite, Jest + React Testing Library

## Global Constraints

- Branch: `fix/perf-seo-cleanup`
- Brand base color: `#e8ede9` (light forest tint)
- Brand highlight color: `#FAF5F1` (cream sweep flash)
- `SkeletonCard` must NOT render a wrapping div — return array so items slot into parent grid
- Do NOT touch AdminDashboard loading state (out of scope per spec)
- Do NOT add new npm packages beyond `react-loading-skeleton`

---

### Task 1: Install dependency + wire SkeletonTheme in main.jsx

**Files:**
- Modify: `src/main.jsx` (line 310 — the `root.render(...)` block)

**Interfaces:**
- Produces: `SkeletonTheme` wrapping the full app; all subsequent tasks inherit brand colors automatically

- [ ] **Step 1: Install react-loading-skeleton**

```bash
cd "C:/Users/Raj/OneDrive/Documents/Pet Project/frontend"
npm install react-loading-skeleton
```

Expected: package added to `package.json`, no peer-dep warnings.

- [ ] **Step 2: Add SkeletonTheme import to main.jsx**

At the top of `src/main.jsx`, after the existing imports, add:

```jsx
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
```

- [ ] **Step 3: Wrap root.render with SkeletonTheme**

Replace the existing `root.render(...)` block (currently lines 310–322):

```jsx
// BEFORE:
root.render(
  <GlobalToastProvider>
    <AuthProvider>
      <CurrencyProvider>
        <CartContext>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </CartContext>
      </CurrencyProvider>
    </AuthProvider>
  </GlobalToastProvider>
);

// AFTER:
root.render(
  <SkeletonTheme baseColor="#e8ede9" highlightColor="#FAF5F1">
    <GlobalToastProvider>
      <AuthProvider>
        <CurrencyProvider>
          <CartContext>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </CartContext>
        </CurrencyProvider>
      </AuthProvider>
    </GlobalToastProvider>
  </SkeletonTheme>
);
```

- [ ] **Step 4: Verify dev server starts without errors**

```bash
npm run dev
```

Expected: no console errors, app loads normally at `http://localhost:5173`.

- [ ] **Step 5: Commit**

```bash
git add src/main.jsx package.json package-lock.json
git commit -m "feat: install react-loading-skeleton, add SkeletonTheme with brand colors"
```

---

### Task 2: Create SkeletonCard component + test

**Files:**
- Create: `src/Components/HelperComponents/SkeletonCard/SkeletonCard.jsx`
- Create: `src/Components/HelperComponents/SkeletonCard/SkeletonCard.test.jsx`

**Interfaces:**
- Produces: `<SkeletonCard variant="card" count={6} />` and `<SkeletonCard variant="row" count={4} />`
- `variant` defaults to `"card"`, `count` defaults to `6`
- Returns an **array** of React elements (no wrapping div) — slots into parent grid/flex

- [ ] **Step 1: Write the failing test**

Create `src/Components/HelperComponents/SkeletonCard/SkeletonCard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import { SkeletonTheme } from 'react-loading-skeleton';
import SkeletonCard from './SkeletonCard';

const wrap = (ui) => render(
  <SkeletonTheme baseColor="#e8ede9" highlightColor="#FAF5F1">
    <div>{ui}</div>
  </SkeletonTheme>
);

describe('SkeletonCard', () => {
  it('renders correct count for card variant', () => {
    wrap(<SkeletonCard variant="card" count={3} />);
    // each card has a data-testid="skeleton-card-item"
    expect(document.querySelectorAll('[data-testid="skeleton-card-item"]')).toHaveLength(3);
  });

  it('renders correct count for row variant', () => {
    wrap(<SkeletonCard variant="row" count={4} />);
    expect(document.querySelectorAll('[data-testid="skeleton-row-item"]')).toHaveLength(4);
  });

  it('defaults to card variant and count 6', () => {
    wrap(<SkeletonCard />);
    expect(document.querySelectorAll('[data-testid="skeleton-card-item"]')).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx jest SkeletonCard --no-coverage
```

Expected: FAIL — `SkeletonCard` module not found.

- [ ] **Step 3: Create the component**

Create `src/Components/HelperComponents/SkeletonCard/SkeletonCard.jsx`:

```jsx
import Skeleton from 'react-loading-skeleton';

const SkeletonCard = ({ variant = 'card', count = 6 }) => {
  if (variant === 'row') {
    return Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        data-testid="skeleton-row-item"
        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}
      >
        <Skeleton circle width={48} height={48} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={16} style={{ marginBottom: 8, display: 'block' }} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
    ));
  }

  return Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      data-testid="skeleton-card-item"
      style={{ borderRadius: 8, overflow: 'hidden', background: '#fff' }}
    >
      <Skeleton height={180} style={{ display: 'block' }} />
      <div style={{ padding: '0.75rem' }}>
        <Skeleton width="70%" height={18} style={{ marginBottom: 8, display: 'block' }} />
        <Skeleton width="100%" height={14} style={{ marginBottom: 6, display: 'block' }} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  ));
};

export default SkeletonCard;
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx jest SkeletonCard --no-coverage
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/Components/HelperComponents/SkeletonCard/
git commit -m "feat: add SkeletonCard component (card + row variants)"
```

---

### Task 3: Replace PetShopPage skeleton + remove old CSS

**Files:**
- Modify: `src/Pages/PetShopPage/PetShopPage.jsx` (lines 146–153)
- Modify: `src/Pages/PetShopPage/PetShopPage.css` (remove `.ps-skeleton` + `@keyframes`)

**Interfaces:**
- Consumes: `SkeletonCard` from Task 2

- [ ] **Step 1: Import SkeletonCard in PetShopPage**

Add to the imports at the top of `src/Pages/PetShopPage/PetShopPage.jsx`:

```jsx
import SkeletonCard from '../../Components/HelperComponents/SkeletonCard/SkeletonCard';
```

- [ ] **Step 2: Replace the loading block in renderGrid()**

Find the current loading block (lines 145–153):

```jsx
// BEFORE:
if (isLoading) {
  return (
    <div className="ps-grid">
      {[1,2,3,4,5,6,7,8].map((n) => (
        <div key={`skeleton-${n}`} className="ps-skeleton" />
      ))}
    </div>
  );
}

// AFTER:
if (isLoading) {
  return (
    <div className="ps-grid">
      <SkeletonCard variant="card" count={8} />
    </div>
  );
}
```

- [ ] **Step 3: Remove ps-skeleton CSS**

In `src/Pages/PetShopPage/PetShopPage.css`, find and delete the `.ps-skeleton` rule block and its associated `@keyframes` shimmer animation. Search for `.ps-skeleton` and remove those declarations entirely.

- [ ] **Step 4: Verify visually**

Start dev server (`npm run dev`), navigate to `/petshop`, confirm 8 brand-colored shimmer cards appear during the loading flash, then products load without layout jump.

- [ ] **Step 5: Commit**

```bash
git add src/Pages/PetShopPage/PetShopPage.jsx src/Pages/PetShopPage/PetShopPage.css
git commit -m "feat: replace ps-skeleton with SkeletonCard on PetShopPage"
```

---

### Task 4: Replace GalleryPage skeleton + remove old CSS

**Files:**
- Modify: `src/Pages/Gallery/GalleryPage.jsx` (lines 100–105)
- Modify: `src/Pages/Gallery/Gallery.css` (remove `.gal-skeleton` + `@keyframes`)

**Interfaces:**
- Consumes: `SkeletonCard` from Task 2

- [ ] **Step 1: Import SkeletonCard in GalleryPage**

Add to imports in `src/Pages/Gallery/GalleryPage.jsx`:

```jsx
import SkeletonCard from '../../Components/HelperComponents/SkeletonCard/SkeletonCard';
```

- [ ] **Step 2: Replace the loading block**

Find the current loading block (lines 100–105):

```jsx
// BEFORE:
if (loading) {
  galleryContent = (
    <div className="gal-grid">
      {Array.from({ length: 6 }, (_, i) => <div key={`skel-${i}`} className="gal-skeleton" />)}
    </div>
  );
}

// AFTER:
if (loading) {
  galleryContent = (
    <div className="gal-grid">
      <SkeletonCard variant="card" count={6} />
    </div>
  );
}
```

- [ ] **Step 3: Remove gal-skeleton CSS**

In `src/Pages/Gallery/Gallery.css`, find and delete the `.gal-skeleton` rule and its `@keyframes` shimmer animation.

- [ ] **Step 4: Verify visually**

Navigate to `/gallery` — confirm 6 shimmer cards appear during load, no layout jump after.

- [ ] **Step 5: Commit**

```bash
git add src/Pages/Gallery/GalleryPage.jsx src/Pages/Gallery/Gallery.css
git commit -m "feat: replace gal-skeleton with SkeletonCard on GalleryPage"
```

---

### Task 5: Replace PetCareTipsPage text loading (+ CLS fix)

**Files:**
- Modify: `src/Pages/PetCareTips/PetCareTipsPage.jsx` (line 92–93)

**Interfaces:**
- Consumes: `SkeletonCard` from Task 2
- CLS fix: adds `pct-grid` wrapper in the loading case (currently missing — this is why height collapses)

- [ ] **Step 1: Import SkeletonCard in PetCareTipsPage**

Add to imports in `src/Pages/PetCareTips/PetCareTipsPage.jsx`:

```jsx
import SkeletonCard from '../../Components/HelperComponents/SkeletonCard/SkeletonCard';
```

- [ ] **Step 2: Replace text string with skeleton inside grid wrapper**

Find the current loading block (lines 92–93):

```jsx
// BEFORE:
if (loading) {
  tipsGridContent = <div className="pct-empty">Loading tips…</div>;
}

// AFTER:
if (loading) {
  tipsGridContent = (
    <div className="pct-grid">
      <SkeletonCard variant="card" count={6} />
    </div>
  );
}
```

The `pct-grid` wrapper is the CLS fix — the grid now exists during loading, preserving the page height that previously collapsed to a single text line.

- [ ] **Step 3: Verify visually**

Navigate to `/pet-care-tips` — confirm 6 shimmer cards appear during load (not a text string), and the page height does not collapse or jump.

- [ ] **Step 4: Commit**

```bash
git add src/Pages/PetCareTips/PetCareTipsPage.jsx
git commit -m "feat: replace text loading with SkeletonCard on PetCareTipsPage, fix CLS"
```

---

### Task 6: Replace FeaturedProductSection skeleton + remove old CSS

**Files:**
- Modify: `src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx` (lines 77–84)
- Search and remove `.fp-skeleton` + `.fp-skeleton-row` + `@keyframes` from the associated CSS file

**Interfaces:**
- Consumes: `SkeletonCard` from Task 2

- [ ] **Step 1: Import SkeletonCard in FeaturedProductSection**

Add to imports in `src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx`:

```jsx
import SkeletonCard from '../../../Components/HelperComponents/SkeletonCard/SkeletonCard';
```

- [ ] **Step 2: Replace the loading block**

Find the current loading block (lines 77–84):

```jsx
// BEFORE:
if (loading) {
  carouselContent = (
    <div className="fp-skeleton-row">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={`fp-skel-${i}`} className="fp-skeleton" />
      ))}
    </div>
  );
}

// AFTER:
if (loading) {
  carouselContent = (
    <div className="fp-skeleton-row">
      <SkeletonCard variant="card" count={3} />
    </div>
  );
}
```

Note: keep `fp-skeleton-row` wrapper — it sets the flex/horizontal layout for the carousel. Only the inner `fp-skeleton` divs are replaced.

- [ ] **Step 3: Remove fp-skeleton CSS**

Find the CSS file imported by FeaturedProductSection and delete the `.fp-skeleton` rule and its shimmer `@keyframes`. Keep `.fp-skeleton-row` (still used as wrapper).

- [ ] **Step 4: Verify visually**

Navigate to `/` (home page) — confirm 3 shimmer cards appear in the featured products carousel slot during load.

- [ ] **Step 5: Commit**

```bash
git add src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx
git commit -m "feat: replace fp-skeleton with SkeletonCard on FeaturedProductSection"
```

---

### Task 7: Replace MyOrdersPage spinner (+ CLS fix)

**Files:**
- Modify: `src/Pages/MyOrders/MyOrdersPage.jsx` (lines 253–260)

**Interfaces:**
- Consumes: `SkeletonCard` from Task 2
- CLS fix: current code does an early `return` (replaces entire page). New code renders skeleton inside the orders list container instead.

- [ ] **Step 1: Import SkeletonCard in MyOrdersPage**

Add to imports in `src/Pages/MyOrders/MyOrdersPage.jsx`:

```jsx
import SkeletonCard from '../../Components/HelperComponents/SkeletonCard/SkeletonCard';
```

- [ ] **Step 2: Remove FaSpinner from the destructured import**

Find the existing import of `FaSpinner` at the top:

```jsx
// BEFORE:
import {
  FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaSpinner,
  FaBan, FaSearch, FaChevronDown, FaRedoAlt, FaUndo,
  FaMapMarkerAlt, FaCreditCard, FaTimes,
} from "react-icons/fa";
```

Note: `FaSpinner` is also used for the `processing` badge and the cancel button spinner — do NOT remove it from the import. It stays; only the page-level loading block changes.

- [ ] **Step 3: Replace the early-return loading block**

Find the current loading block (lines 253–260):

```jsx
// BEFORE:
if (loading) {
  return (
    <div className="my-orders-state">
      <FaSpinner className="spin" size={28} />
      <p>Loading your orders…</p>
    </div>
  );
}

// AFTER:
if (loading) {
  return (
    <div className="my-orders-page">
      <div className="my-orders-list">
        <SkeletonCard variant="row" count={4} />
      </div>
    </div>
  );
}
```

This keeps the page wrapper consistent (no collapse), and the 4 row skeletons match the order-row shape.

- [ ] **Step 4: Verify visually**

Navigate to `/my-orders` while logged in — confirm 4 row skeletons appear during load, page height does not collapse.

- [ ] **Step 5: Commit**

```bash
git add src/Pages/MyOrders/MyOrdersPage.jsx
git commit -m "feat: replace FaSpinner page-level loading with SkeletonCard on MyOrdersPage, fix CLS"
```

---

### Task 8: Replace MySubscriptions text loading

**Files:**
- Modify: `src/Pages/Subscriptions/MySubscriptions.jsx` (line 59)

**Interfaces:**
- Consumes: `SkeletonCard` from Task 2

- [ ] **Step 1: Import SkeletonCard in MySubscriptions**

Add to imports in `src/Pages/Subscriptions/MySubscriptions.jsx`:

```jsx
import SkeletonCard from '../../Components/HelperComponents/SkeletonCard/SkeletonCard';
```

- [ ] **Step 2: Replace text with row skeletons**

Find the current loading line (line 59):

```jsx
// BEFORE:
{loading && <p className="ms-empty">Loading…</p>}

// AFTER:
{loading && (
  <div className="ms-list">
    <SkeletonCard variant="row" count={3} />
  </div>
)}
```

Using `ms-list` wrapper preserves the same layout container that the real subscription items render in.

- [ ] **Step 3: Verify visually**

Navigate to `/my-subscriptions` while logged in — confirm 3 row skeletons appear, no text string, no height collapse.

- [ ] **Step 4: Commit**

```bash
git add src/Pages/Subscriptions/MySubscriptions.jsx
git commit -m "feat: replace text loading with SkeletonCard on MySubscriptions"
```

---

### Task 9: Replace ProfessionalList spinner

**Files:**
- Modify: `src/Components/HelperComponents/ProfessionalList/ProfessionalList.jsx` (lines 197–205)

**Interfaces:**
- Consumes: `SkeletonCard` from Task 2

- [ ] **Step 1: Import SkeletonCard in ProfessionalList**

Add to imports in `src/Components/HelperComponents/ProfessionalList/ProfessionalList.jsx`:

```jsx
import SkeletonCard from '@/Components/HelperComponents/SkeletonCard/SkeletonCard';
```

- [ ] **Step 2: Remove LoadingSpinner import**

Find and remove:

```jsx
import LoadingSpinner from "@/Components/HelperComponents/LoadingSpinner/LoadingSpinner";
```

Only remove if `LoadingSpinner` is not used anywhere else in this file. Verify with a search before deleting.

- [ ] **Step 3: Replace the loading block**

Find the current loading block (lines 197–205):

```jsx
// BEFORE:
if (loading) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <LoadingSpinner />
      <p>{config.loadingMessage}</p>
    </div>
  );
}

// AFTER:
if (loading) {
  return (
    <div className="pl-list" role="status" aria-live="polite" aria-label={config.loadingMessage}>
      <SkeletonCard variant="row" count={4} />
    </div>
  );
}
```

`pl-list` preserves the container that the real professional cards render in — check the JSX below the loading block to confirm the wrapper class name and use it here.

- [ ] **Step 4: Verify visually**

Navigate to `/appointments` — confirm 4 row skeletons appear in the professional list area while data loads.

- [ ] **Step 5: Push and commit**

```bash
git add src/Components/HelperComponents/ProfessionalList/ProfessionalList.jsx
git commit -m "feat: replace LoadingSpinner with SkeletonCard on ProfessionalList"
git push origin fix/perf-seo-cleanup
```

---

## Self-Review Checklist

- [x] **Spec coverage:** all 7 page replacements covered (Tasks 3–9), dependency install (Task 1), component creation (Task 2), CSS cleanup embedded in each task
- [x] **No placeholders:** every step has exact code, exact file paths, exact commands
- [x] **Type consistency:** `SkeletonCard` props (`variant`, `count`) are identical across all tasks; `data-testid` values match test assertions
- [x] **CLS fix verified:** PetCareTipsPage (Task 5) and MyOrdersPage (Task 7) explicitly add the grid/list wrapper in the loading case — the two pages where the wrapper was previously missing
- [x] **FaSpinner retained:** Task 7 notes that `FaSpinner` is still used for badge/cancel states — import stays, only the page-level loading block is replaced
- [x] **fp-skeleton-row retained:** Task 6 notes the row wrapper is kept; only inner skeleton divs are replaced
