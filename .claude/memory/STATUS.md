# Frontend Status

**Active branch:** `feat/epic2-select-migrations`
**Last updated:** 2026-06-24
**Stack:** React 18 + Vite, Tailwind 3.4, shadcn/ui, @dnd-kit, Framer Motion, Vitest + React Testing Library

For the full cross-repo backlog (BE + FE), see `../backend/.claude/memory/STATUS.md`.

---

## Done (this branch)

| Epic | What shipped | Key files |
|------|-------------|-----------|
| 1 | About in navbar, mobile header simplified, gallery breadcrumbs | `NavigationBar/`, `GalleryPage/`, `GalleryDetailPage/` |
| 2 | Design system foundation — shadcn/ui token binding, ui/Select + Dialog + Popover + Tooltip, SearchBar generalized, RTE img overflow fix | `src/Components/ui/`, `tailwind.config.js`, `Components/RichText/` |
| 3 | Service page — Coming Soon badges + disabled CTAs on 4 services, live card links on 3 | `Pages/ServicePage/ServicePage.jsx` |
| 5 | Petshop filter — multi-select chips from DB filter options, remove dead rating filter, remove post-hero category strip | `Pages/PetshopPage/`, `Components/FilterComponent/` |
| 6 | Product bulk actions admin UI — sticky toolbar, sale modal, bulk-delete confirm; DataTable row selection | `Pages/Admin/Products/AdminProducts.jsx`, `Components/Admin/DataTable/DataTable.jsx` |
| 6b | ImageManager component; variant images in AdminProductForm; variant gallery swap on product detail | `Components/Admin/ImageManager/`, `Pages/Admin/Products/AdminProductForm.jsx`, `Pages/IndividualProductItemPage/` |
| 6c | Rs labels on all price inputs | `Pages/Admin/Products/AdminProductForm.jsx` |
| 7a | Homepage feedback — renders each testimonial's own photos; adaptive 0/1/2-3 layout | `Pages/HomePage/HomePageSections/StatsSection.jsx` |
| 8 | AdminTipForm + AdminGalleryForm use ImageManager for cover + section images | `Pages/Admin/Tips/AdminTipForm.jsx`, `Pages/Admin/Gallery/AdminGalleryForm.jsx` |
| 14 | Variant-aware inventory — Variant column, variantId in restock/adjust/history | `Pages/Admin/Inventory/AdminInventory.jsx` |
| 2b | All 28 native `<select>` elements across 19 files migrated to shadcn Select; all dead CSS dropped; `/admin/ui-gallery` verification page added | `feat/epic2-select-migrations` branch |

---

## Remaining

| Epic | What's left | Depends on |
|------|-------------|------------|
| 2 | ✅ DONE — see row 2b above | — |
| 4 | ProfessionalCard visual rebuild on design system; appointment list SearchBar | Epic 2 |
| 9b | Typed announcements admin UI — type picker, per-type field sections (event date/location, CTA url, content ref picker) | Epic 9b BE ✅ |
| 11 | `AdminSettings` page with StoreSettings controls (shipping fee, free-shipping threshold, tax rate/inclusive toggle) | Epic 11 BE ✅ |
| 11 | Checkout page shows shipping + tax breakdown; order summary uses `grandTotal` | Epic 11 BE ✅ |
| 12 | Subscriptions analytics dashboard (demand vs stock chart, horizon selector); enriched admin list/detail; user My Subscriptions; product-list "Subscribed(N)" badge | Epic 12 BE ✅ |
| 13 | Import/Export — multi-step FE form (replaces dead 920-line wizard); `/admin/import-export` admin page | Epic 13 BE (not started) |
| 15 | Checkout redesign (single responsive page, design system); payment method selector (COD / Card / Juice) | MCB Juice creds needed |

---

## Test setup

- **Pyramid (Vitest projects + Playwright):**
  - `unit` — co-located `src/**/*.test.{js,jsx}`, jsdom, deps mocked. `npm run test:unit`
  - `integration` — `tests/integration/**`, React Router + MSW. `npm run test:integration`
  - `e2e` — `tests/e2e/**/*.spec.js`, Playwright vs. the production build. `npm run test:e2e`
- **Config:** `vitest.config.js` (unit+integration projects, shared coverage), `playwright.config.js`.
- **Helpers:** `tests/helpers/` — `render.jsx` (renderWithProviders = MemoryRouter + CurrencyProvider), `server.js` + `handlers.js` (MSW), `setup.unit.js` / `setup.integration.js`.
- **Mock pattern (unit):** `vi.mock(...)` is hoisted — define fixtures **inside** the factory.
- **Current coverage:** 337 tests across 62 files (335 unit + 2 integration) + 1 e2e smoke — all passing.
  - Logic layer fully covered: API wrappers ~96%, hooks ~91%, utils ~90%, contexts ~67%.
  - Components/pages (~135 files) are deliberately left to the integration (MSW) + e2e (Playwright) layers, not blanket unit tests — so the repo-wide line % is low by design.
  - API wrappers mock `@/core/api/apiClient` (named `api`, or `default` for invoice/transaction). axios-based localServices mock `axios` directly.

### CI (`.github/workflows/`)

- `ci.yml` — unit → integration → e2e → report → reviewdog; partial coverage from unit+integration is `nyc merge`d into one report + PR comment.
- `codeql.yml`, `sonarcloud.yml`, `labeler.yml` (+ `.github/labeler.yml`), `ai-summary.yml`.
- **Already configured** (pre-existing on main): SonarCloud project `Raj-SW_petstore-frontend` + `SONAR_CUBE_TOKEN` secret.
- **Manual post-merge:** create the repo labels `tests`/`ci`/`documentation`/`dependencies`/`frontend` (labeler uses `sync-labels: true`); optionally require the test checks on `main`.

Run before every commit: `npm run test:all && npm run build`
