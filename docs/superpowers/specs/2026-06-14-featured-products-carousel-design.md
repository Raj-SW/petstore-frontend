# Featured Products Carousel — Design Spec

**Date:** 2026-06-14
**Status:** Approved (design), pending implementation plan
**Scope:** Frontend only (one component rewrite + one API call change + one dependency)

## Problem

The HomePage "Featured Products" section (`src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx`) shows a fixed 3-card grid per category tab (General / Dogs / Cats / Fish), capped at 3 items by the API call `getFeaturedByCategory(key, 3)`. If an admin features more than 3 products in a category, the extras are never seen.

## Goal

Replace the per-tab 3-card grid with a horizontal **sliding carousel** so users can browse through **all** featured items in a category, regardless of count, while preserving the existing tabbed layout, Framer Motion reveals, and featured-with-fallback data logic.

## Decisions (locked)

- **Layout:** Option A — 3 cards per view on desktop, **side arrow buttons + position dots**, drag/swipe enabled.
- **Responsive cards-per-view:** desktop 3 · tablet 2 · mobile 1.2 (the `.2` peek hints scrollability).
- **Autoplay:** yes — advance ~5s, **pause-on-hover**, stop-on-interaction, disabled under `prefers-reduced-motion`.
- **Item count:** "load all" implemented as `limit=100` (see rationale below).
- **Carousel engine:** reuse the existing embla-based `src/Components/ui/carousel.jsx` primitives.

## Architecture

### Component: `FeaturedProductSection.jsx` (rewrite of grid region only)

Unchanged:
- Tab state (`activeTab`), the `TABS` array, and the `products` map keyed by category.
- On-mount prefetch of all four categories into `products` (instant tab switching, no refetch).
- Header + tabs block with Framer Motion `useInView` scroll-reveal and the shared `layoutId="fp-tab-indicator"` sliding pill.
- Loading flag flips false once all four requests settle.
- Empty state (`"No products available right now."`).

Changed — the grid region becomes a carousel:
- Replace the `fp-grid` `motion.div` with the `ui/carousel.jsx` composition:
  `<Carousel>` → `<CarouselContent>` → one `<CarouselItem>` per product → `<CarouselPrevious/>` `<CarouselNext/>`.
- Cards-per-view via Tailwind `basis` utilities on `CarouselItem`:
  `basis-[83%] sm:basis-1/2 lg:basis-1/3` (mobile 1.2-ish peek → tablet 2 → desktop 3).
- Keep `ProductCardV2` as the card, with the same defensive prop-mapping already in place
  (`product.images?.[0]?.url || product.images?.[0] || product.imageUrl`, `name || title`, `_id || id`).
- **Dots:** subscribe to the embla `api` (`setApi`) and render a dot per scroll-snap; highlight the
  selected snap via `api.on("select", ...)`. Clicking a dot calls `api.scrollTo(i)`.
- **Tab switch:** re-mount the carousel by keying it on `activeTab` (preserves the existing
  `AnimatePresence mode="wait"` crossfade and resets scroll position to the start per tab).

### Autoplay

- Add dependency: `embla-carousel-autoplay` (official first-party embla plugin).
- Pass the plugin to the carousel via the existing `plugins` prop on `ui/carousel.jsx`
  (`Carousel` already forwards `plugins` into `useEmblaCarousel`).
- Config: `{ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }`.
- Guard with `prefers-reduced-motion`: if the user prefers reduced motion, do not attach the
  autoplay plugin.

### Data flow / API

- Single change in `src/Services/api/productsApi.js`: the carousel calls
  `getFeaturedByCategory(key, 100)` (was `3`).
- **Rationale for `limit=100`, not "remove limit":** `GET /products` (backend `getProducts`)
  defaults to `limit=10` and is paginated (`.skip().limit()`), with no hard server-side max.
  Removing the param would silently cap at 10. Passing a generous `limit=100` returns every
  featured item for any realistic catalog while keeping the query bounded. Featured sets are
  admin-curated and small.
- The existing featured-with-fallback behavior in `getFeaturedByCategory` is unchanged: if no
  `isFeatured=true` products exist in the category, it re-queries without the flag and shows the
  latest active products instead — so the carousel is never empty by accident.
- **No backend changes.**

## Edge cases

- **≤ cards-per-view items:** embla's `canScrollPrev/canScrollNext` are false → arrows auto-disable
  (the existing `ui/carousel.jsx` already disables the buttons on these flags). Dots collapse to one.
  Autoplay becomes a visual no-op. Result looks like today's static row.
- **Loading:** render 3 skeleton placeholders (`fp-skeleton`) inside the carousel viewport.
- **Reduced motion:** autoplay disabled (see above); manual arrows/drag/dots still work.
- **Image/shape variance:** handled by the existing prop-mapping, carried over verbatim.

## Testing

Vitest + React Testing Library (matches existing frontend test setup):
- Renders a `CarouselItem` per product for the active tab.
- Renders one dot per scroll snap; clicking dot N calls `api.scrollTo(N)` (mock embla api).
- Switching tabs re-mounts the carousel and shows the new category's items.
- With ≤3 items, next/prev arrows are disabled.
- `getFeaturedByCategory` is called with `limit=100` for each tab on mount.
- Fallback: when featured query returns empty, the non-featured query result is rendered.
- Autoplay plugin is not attached when `matchMedia('(prefers-reduced-motion: reduce)')` matches.

Manual: `npm run build` clean; browser check that desktop shows 3 + arrows + dots, mobile shows
~1.2 with peek, autoplay advances and pauses on hover.

## Out of scope

- Backend product/featured endpoints (unchanged).
- The PetCareTips `FeaturedSection.jsx` (separate component, not touched).
- Styling overhaul of `ProductCardV2`.

## New dependency

- `embla-carousel-autoplay` (^8.x, matches installed `embla-carousel-react` ^8.3.0).
