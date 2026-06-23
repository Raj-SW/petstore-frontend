# Frontend Architecture Decisions

Key choices that affect how the frontend is structured. Read before touching images, pricing, variants, or the design system.

---

## Design System

**Decision:** The canonical design system is the half-built shadcn/ui in `src/Components/ui/` (Button, Card, Input, Tabs, Select, Dialog, Popover, Tooltip) bound to brand tokens via Tailwind CSS variables.

**Brand tokens (defined in `tailwind.config.js` + `src/index.css`):**
- `--color-primary-forest` = `#001C10` (dark green)
- `--color-accent-gold` = `#D99A2B`
- `--color-bg-warm-ivory` = `#FAF5F1`

**Do not use:** antd, react-bootstrap, primereact — they are legacy imports being phased out. Do not add new components from them.

**Native `<select>`:** Replace with shadcn `Select` (Radix-based). There are 17 remaining instances across admin pages — this is tracked as Epic 2 remaining work.

---

## Image Management

**Decision:** All image handling uses the `<ImageManager>` component + immediate-upload contract. Images are uploaded to Cloudinary as soon as the user picks them. The form only holds ordered `[{url, publicId}]` refs and submits them as `imageRefs` JSON.

**Never** send raw image files on form submit. The old deferred-multipart approach (sending files on save) was abandoned — it cannot be shared across resources.

**Upload URL per resource:**
- Products + variants: `/products/upload-image`
- Feedback: `/feedback/upload-image`
- Tips: `/tips/upload-image`
- Gallery: `/gallery/upload-image`

Response shape: `{ data: { url, publicId } }`

---

## MUR-Only Pricing

**Decision:** All prices are stored and displayed in MUR (Mauritian Rupee). There is no currency field or conversion anywhere.

- Label all price inputs `Rs` (not `$`)
- Use `formatMUR` from the backend for server-side formatting; for the frontend just prefix with `Rs`
- The invoice PDF and all email templates show `Rs` — never `$`

---

## Variant-Aware Data

Products with variants come from the API with a `variantsView` array (virtual field) where each entry has `{ _id, label, price, salePrice, effectivePrice, quantity, isOnSaleNow, images }`.

For variant products:
- Display price = `selectedVariant.effectivePrice`
- Stock = `selectedVariant.quantity`
- Gallery = `selectedVariant.images` if non-empty, else `product.images`
- Cart line ID = `` `${productId}::${variantId}` ``

The top-level `product.price` and `product.quantity` are roll-ups (derived from variants) — do not use them for display when a variant is selected.

---

## Admin Forms — FormData + JSON fields

Admin create/update forms that have nested data (variants, sections, imageRefs) use `FormData` with JSON-stringified fields:

```js
fd.append("variants",  JSON.stringify([{ label, price, quantity, images }]));
fd.append("imageRefs", JSON.stringify([{ url, publicId }]));
fd.append("sections",  JSON.stringify([{ title, body, order }]));
```

The backend parses these with `parseJsonField`. Validators accept them as `Joi.string().optional()`.

---

## State Management

No global state library. Context only for cross-cutting concerns:
- `CartContext` — cart items, add/remove/update
- `AuthContext` — current user, login/logout
- `ToastContext` — `addToast(message, type)` — use for all success/error feedback
- `CurrencyContext` — currency selector (currently MUR-only but kept for potential future use)

Everything else is local component state.
