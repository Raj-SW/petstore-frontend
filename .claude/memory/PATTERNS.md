# Frontend Patterns & Component Register

---

## Shared Components — use these, don't duplicate

| Component | Path | Purpose | Key props |
|-----------|------|---------|-----------|
| `ImageManager` | `src/Components/Admin/ImageManager/ImageManager.jsx` | Immediate-upload image picker with drag-reorder, set-primary, delete | `value [{url,publicId}]`, `onChange`, `uploadUrl`, `max`, `onError` |
| `DataTable` | `src/Components/Admin/DataTable/DataTable.jsx` | Admin data table with optional row selection | `columns`, `data`, `selectable`, `selectedIds`, `onSelectionChange`, `rowIdKey` |
| `SearchBar` | `src/Components/HelperComponents/SearchBar/` | Reusable search input with `onSearch` callback | `onSearch`, `placeholder` |
| `Breadcrumb` | `src/Components/HelperComponents/Breadcrumb/` | Page breadcrumb trail | `items: [{label, path}]` — `path: null` = current page (no link) |
| `ProductPrice` | `src/Components/HelperComponents/Price/ProductPrice.jsx` | Renders price with sale strikethrough | `price`, `salePrice`, `isOnSaleNow` |
| `SaleBadge` | `src/Components/HelperComponents/SaleBadge/` | Green "−X%" badge | `percent` |
| `RichTextEditor` | `src/Components/RichText/` | TipTap-based editor (admin) | `preset`, `value`, `onChange`, `placeholder`, `minHeight` |
| `RichTextRenderer` | `src/Components/RichText/` | Renders saved HTML safely (public pages) | `content` |
| `SubscribeWidget` | `src/Components/Subscriptions/SubscribeWidget.jsx` | Recurring order subscribe button | `product`, `quantity`, `variantId` |

### shadcn/ui components (design system)

Live in `src/Components/ui/`. These are bound to brand tokens — use them for all new admin UI instead of native HTML elements:
- `Button`, `Input`, `Card` — general
- `Select` (wraps Radix) — replaces every native `<select>`
- `Dialog` — replaces every custom modal backdrop
- `Popover`, `Tooltip` — use for contextual overlays

---

## Admin CSS classes — always reuse

Global styles in `src/index.css` / `src/App.css` (and page-level Admin CSS):

**Cards & layout:**
`.admin-page`, `.admin-page-header`, `.admin-page-title`, `.admin-page-subtitle`, `.admin-card`

**Form fields:**
`.admin-field`, `.admin-label`, `.admin-input`, `.admin-required`

**Buttons:**
`.admin-save-btn`, `.admin-outline-btn`

**Modals (use for every confirm/form dialog):**
`.admin-modal-backdrop`, `.admin-modal`, `.admin-modal-title`, `.admin-modal-msg`
`.admin-modal-actions`, `.admin-modal-btn.confirm`, `.admin-modal-btn.cancel`

**Toggles:**
`.admin-toggle`, `.toggle-input` (styled checkbox → pill toggle)

---

## API layer

All API calls go through `src/Services/api/`. Each resource has its own file:

| File | Resource |
|------|----------|
| `productsApi.js` | Products + bulk actions |
| `inventoryApi.js` | Inventory restock/adjust/history |
| `announcementsApi.js` | Announcements |
| `ordersApi.js` | Orders |
| `feedbackApi.js` | Feedback |
| `subscriptionsApi.js` | Subscriptions |

Base client: `src/core/api/apiClient.js` — exports `api` (axios instance with auth interceptors).

Upload calls use `api.post(uploadUrl, formData)` — the response shape is `{ data: { url, publicId } }`.

---

## Routing

`src/App.jsx` holds all routes. Admin routes are nested under `/admin` with `<AdminLayout>`. When adding a new admin page:
1. Create `src/Pages/Admin/<Feature>/Admin<Feature>.jsx`
2. Add route in `App.jsx`
3. Add nav entry in `src/Components/Admin/AdminLayout.jsx`

---

## Variant-aware patterns

**Product detail page** (`IndividualProductItemPage.jsx`):
- `selectedVariant` state — defaults to first in-stock variant
- Gallery uses `selectedVariant.images` if non-empty, falls back to `product.images`
- `activeImage` resets to 0 on variant change
- Cart item uses `variantId` + `variantLabel` for line-item identity

**Inventory page** (`AdminInventory.jsx`):
- One table row per variant (backend returns per-variant rows)
- `restock`/`adjust`/`history` all pass `variantId` from the row's `product` object
- Row key: `` `${p._id}_${p.variantId || "base"}` ``

---

## Test conventions

- **Mock location:** always define fixture data inside `vi.mock(...)` factory — never as top-level `const` (hoisting causes `ReferenceError`)
- **Multiple matches:** use `getAllByText` / `getAllByRole` when a label appears more than once; use anchored regex (`/^activate$/i`) to avoid partial matches
- **Async:** wrap post-interaction assertions in `waitFor(() => ...)` for any state change driven by a mock API call
- **File location:** colocate tests with the component — `AdminFoo.test.jsx` next to `AdminFoo.jsx`
