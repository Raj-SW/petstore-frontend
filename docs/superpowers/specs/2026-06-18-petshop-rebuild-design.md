# Petstore / Shop Page Rebuild (P4) — Design Spec

**Date:** 2026-06-18
**Status:** Approved (design)
**Sub-project:** Design-sync **P4** of the 2026-06-14 UI/UX batch. See `2026-06-14-design-sync-overview.md`.
**Repos:** frontend (`Raj-SW/petstore-frontend`) + a small additive backend change (`Raj-SW/petstore-backend`).

## Summary

Rebuild the top of the Pet Shop page (`/petshop`) around an **admin-managed advert banner** and elevate the page's overall look so it no longer feels "AI-generated". The existing functional machinery — product loading, category quick-filter, sidebar filters, sort, per-page, search, pagination, mobile filter drawer — is kept intact; this is a presentational rebuild plus one additive backend field.

## Goals

- Replace the static hero (hardcoded background image + heading) with a prominent, admin-controlled advert banner.
- Make the breadcrumb, page heading, and search visibly prominent.
- Elevate the whole page to the VitalPaws design system (forest `#001C10`, amber `#BA7517`, ivory `#f6ece3`, `--font-display`/`--font-body`).
- Reuse existing infrastructure: the adverts resource, `PromoSlideshow` rotation pattern, the existing `SearchBar`, `ProductCard`, `Breadcrumb`, `FilterComponent`.

## Non-goals

- No SearchBar redesign — the existing `SearchBar` component is reused as-is (its particle styling is a separate, deferred decision).
- No changes to product data loading, filtering, sorting, or pagination logic.
- No new product/advert analytics; no scheduled adverts.
- Other pages (P5/P10/P2) are separate sub-projects.

## Decisions (locked during brainstorming)

1. **Banner source:** a **new `shop` advert placement** (independent from the Tips-page `banner` placement and the homepage `hero`/`promo`).
2. **Search:** keep the existing `SearchBar` component; just reposition it prominently.
3. **Scope:** top section rebuild **plus** visual polish throughout (chips, toolbar, grid, pagination).

## Architecture

### Backend — additive `shop` placement

The adverts resource already supports placements `banner | sponsored | hero | promo`. Add `shop`, treated like `hero`/`promo` (link optional):

- `src/models/advert.model.js` — add `'shop'` to the `PLACEMENTS` array (line 3) and update the enum message string. `link` stays optional for `shop` (the required-validator only lists `banner`/`sponsored`, so no change needed there). `image` is already optional at the model level for every placement.
- `src/validators/advert.validator.js` — add `'shop'` to the `placement` `Joi.valid(...)` list (and the message), and add `'shop'` to the `link` `when('placement', { is: Joi.valid('hero', 'promo') })` group so the link is optional for `shop`.
- No data migration — existing documents are unaffected; the public `GET /api/adverts?placement=shop` already works generically.

### Frontend — `ShopBanner` component

New `src/Components/Shop/ShopBanner.jsx` (+ `ShopBanner.css`):

- On mount, calls `advertsApi.getAdverts('shop')`.
- **≥1 advert:** renders a wide, rounded, full-bleed banner — advert image as the background, a title overlay, and (when `advert.link` is present) an amber "Shop now" pill linking to it; external links open in a new tab via the same `link.startsWith('http')` check as the existing `AdvertBanner`. If a `shop` advert has no link, the banner shows the title without a CTA. When **>1**, auto-rotates on an interval with dot indicators, reusing the `PromoSlideshow` AnimatePresence pattern already in the repo.
- **0 adverts (or fetch error):** renders a **branded fallback** — the current `petshopBanner` image + the "Everything for your beloved pet" headline + subtitle — so the page is never empty.
- Self-contained: owns its own fetch/rotation state; the page passes nothing in.

### Page composition (`PetShopPage.jsx`)

Top-to-bottom, replacing the current `ps-hero` section:

1. **Breadcrumb strip** — clean ivory band with the existing `Breadcrumb` (`Home / Pet Shop`).
2. **`<ShopBanner />`** — the advert banner / fallback.
3. **Intro band** — large "Pet Shop" heading + subtitle, with the existing `SearchBar` centered and prominent on an ivory band.
4. **Category quick-filter strip** — restyled pill chips (amber active state).
5. **Body** — unchanged structure: sidebar `FilterComponent` + products column (toolbar, grid, pagination) + mobile drawer, restyled for polish.

All existing handlers (`handleSearch`, `handleApplyFilters`, `handleCategoryClick`, `handleSort`, pagination, `searchParams` deep-link) are preserved verbatim; only JSX/markup and CSS change.

## Data flow

1. Admin creates a `shop` advert in Admin → Adverts (image + title + link).
2. `ShopBanner` fetches active `shop` adverts → renders banner (rotating if multiple) or the branded fallback.
3. Customer clicks "Shop now" → navigates to `advert.link`; or uses search/filters/category exactly as today.

## Error handling

- `advertsApi.getAdverts('shop')` failure or empty result → branded fallback (never a broken/empty banner).
- Product load/search/filter errors → existing `ps-state` error/empty views, unchanged.
- External advert links use `target="_blank" rel="noopener noreferrer"`.

## Testing

**Backend (Jest):** extend `tests/adverts.controller.test.js` (and/or `tests/advert.model.test.js`) so a `shop`-placement advert is accepted (create → 201, no link) and surfaced by `GET /api/adverts?placement=shop`.

**Frontend (Vitest):** `ShopBanner.test.jsx` —
- renders an advert's title + "Shop now" CTA when the API returns one advert (api mocked);
- renders the branded fallback heading when the API returns `[]`.

Manual: `npm run build` clean; browser pass on desktop + mobile (banner rotation, search, filters, category chips, pagination, mobile drawer).

## Files

| File | Change |
|---|---|
| `backend/src/models/advert.model.js` | add `'shop'` to placement enum |
| `backend/src/validators/advert.validator.js` | allow `'shop'` |
| `backend/.../advert test` | accept `shop` placement |
| `frontend/src/Components/Shop/ShopBanner.jsx` (+`.css`) | new advert banner w/ rotation + fallback |
| `frontend/src/Components/Shop/ShopBanner.test.jsx` | smoke test |
| `frontend/src/Pages/PetShopPage/PetShopPage.jsx` | recompose top section, keep logic |
| `frontend/src/Pages/PetShopPage/PetShopPage.css` | design-system polish throughout |
| `frontend/src/Pages/Admin/Adverts/AdminAdverts.jsx` | add `Pet Shop banner` option + hint |

## Open questions (none blocking)

- Exact rotation interval (start at ~6s, matching the existing promo slideshow).
- Whether to cap the banner aspect ratio on very wide screens (decide during build; default to a max-height clamp).
