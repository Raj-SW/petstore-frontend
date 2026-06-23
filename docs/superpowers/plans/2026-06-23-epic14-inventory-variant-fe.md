# Epic 14 FE — Variant-Aware Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin inventory UI variant-aware: show a Variant column in the table, pass `variantId` to restock/adjust API calls, and filter movement history to the selected variant.

**Architecture:** The backend `getInventory` already returns one row per variant (with `variantId`, `variantLabel`, `hasVariants` on each row). The FE only needs to surface these fields — no new data fetching. `restockProduct` and `adjustStock` need `variantId` plumbed into the request body. History already supports `?variantId=` as a query param.

**Tech Stack:** React 18, Vitest + React Testing Library, axios (via `api` wrapper in `apiClient.js`)

---

## Files

| Action | Path | What changes |
|--------|------|-------------|
| Modify | `src/Services/api/inventoryApi.js` | Add `variantId` param to `restockProduct` and `adjustStock` |
| Modify | `src/Pages/Admin/Inventory/AdminInventory.jsx` | Variant column, row key, modal wiring, history filter, movement label |
| Modify | `src/Pages/Admin/Inventory/AdminInventory.css` | `.inv-variant-label` chip styling |
| Create | `src/Pages/Admin/Inventory/AdminInventory.test.jsx` | Component tests for all variant behaviours |

---

## Task 1 — Write the failing tests

**Files:**
- Create: `src/Pages/Admin/Inventory/AdminInventory.test.jsx`

These tests drive the next three tasks. All should FAIL now and PASS after tasks 2–4.

- [ ] **Step 1: Create the test file**

```jsx
// src/Pages/Admin/Inventory/AdminInventory.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock inventoryApi — variant product has two variant rows
const VARIANT_ROW_1KG = {
  _id: "prod1",
  name: "Dog Food",
  variantId: "v1",
  variantLabel: "1kg",
  hasVariants: true,
  price: 500,
  quantity: 3,
  stockStatus: "low",
  isActive: true,
  images: [],
  categories: ["dogs"],
};
const VARIANT_ROW_3KG = {
  _id: "prod1",
  name: "Dog Food",
  variantId: "v2",
  variantLabel: "3kg",
  hasVariants: true,
  price: 1200,
  quantity: 0,
  stockStatus: "out",
  isActive: true,
  images: [],
  categories: ["dogs"],
};
const PLAIN_ROW = {
  _id: "prod2",
  name: "Cat Toy",
  hasVariants: false,
  price: 200,
  quantity: 50,
  stockStatus: "in",
  isActive: true,
  images: [],
  categories: ["cats"],
};

vi.mock("../../../Services/api/inventoryApi", () => ({
  default: {
    getInventory: vi.fn().mockResolvedValue({
      data: [VARIANT_ROW_1KG, VARIANT_ROW_3KG, PLAIN_ROW],
      stats: { total: 3, out: 1, low: 1, in: 1, totalValue: 11700 },
    }),
    restockProduct: vi.fn().mockResolvedValue({ success: true }),
    adjustStock: vi.fn().mockResolvedValue({ success: true }),
    getMovements: vi.fn().mockResolvedValue({
      data: [
        {
          _id: "m1",
          type: "restock",
          delta: 10,
          prevQty: 0,
          newQty: 10,
          variantLabel: "1kg",
          note: "Initial stock",
          createdBy: { name: "Admin" },
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  },
}));
vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

import inventoryApi from "../../../Services/api/inventoryApi";
import AdminInventory from "./AdminInventory";

describe("AdminInventory — variant awareness", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a Variant column and shows the variant label for each row", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getByText("Dog Food")).toBeInTheDocument());

    expect(screen.getByRole("columnheader", { name: /variant/i })).toBeInTheDocument();
    expect(screen.getByText("1kg")).toBeInTheDocument();
    expect(screen.getByText("3kg")).toBeInTheDocument();
    // Non-variant product shows a dash
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("restock sends variantId for a variant row", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getByText("1kg")).toBeInTheDocument());

    // Click the first Restock button (1kg row)
    const restockBtns = screen.getAllByRole("button", { name: /restock/i });
    fireEvent.click(restockBtns[0]);

    // Modal opens — fill units
    await waitFor(() => expect(screen.getByPlaceholderText(/e\.g\. 50/i)).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. 50/i), { target: { value: "20" } });

    fireEvent.click(screen.getByRole("button", { name: /add stock/i }));

    await waitFor(() =>
      expect(inventoryApi.restockProduct).toHaveBeenCalledWith(
        "prod1", 20, "", "v1"
      )
    );
  });

  it("adjust sends variantId for a variant row", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getByText("1kg")).toBeInTheDocument());

    const adjustBtns = screen.getAllByRole("button", { name: /adjust/i });
    fireEvent.click(adjustBtns[0]);

    await waitFor(() => expect(screen.getByRole("button", { name: /save adjustment/i })).toBeInTheDocument());
    const qtyInput = screen.getByDisplayValue("3"); // pre-filled with current qty
    fireEvent.change(qtyInput, { target: { value: "15" } });
    fireEvent.change(screen.getByPlaceholderText(/damaged/i), {
      target: { value: "Correction" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save adjustment/i }));

    await waitFor(() =>
      expect(inventoryApi.adjustStock).toHaveBeenCalledWith(
        "prod1", 15, "Correction", "v1"
      )
    );
  });

  it("history passes variantId in the API call for a variant row", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getByText("1kg")).toBeInTheDocument());

    const historyBtns = screen.getAllByRole("button", { name: /history/i });
    fireEvent.click(historyBtns[0]);

    await waitFor(() =>
      expect(inventoryApi.getMovements).toHaveBeenCalledWith("prod1", { variantId: "v1" })
    );
  });

  it("history drawer shows variantLabel on each movement", async () => {
    render(<AdminInventory />);
    await waitFor(() => expect(screen.getByText("1kg")).toBeInTheDocument());

    const historyBtns = screen.getAllByRole("button", { name: /history/i });
    fireEvent.click(historyBtns[0]);

    await waitFor(() => expect(screen.getByText("Initial stock")).toBeInTheDocument());
    expect(screen.getAllByText("1kg").length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the tests — all must FAIL**

```bash
cd "C:/Users/Raj/OneDrive/Documents/Pet Project/frontend"
npx vitest run src/Pages/Admin/Inventory/AdminInventory.test.jsx
```

Expected: 5 tests FAIL (no Variant column, wrong API signatures, etc.)

---

## Task 2 — Update inventoryApi to pass variantId

**Files:**
- Modify: `src/Services/api/inventoryApi.js`

- [ ] **Step 1: Update `restockProduct` and `adjustStock`**

Replace the two methods:

```js
// PATCH /admin/inventory/:id/restock
// variantId is required when the product has variants.
restockProduct: async (productId, units, note = "", variantId = null) => {
  const body = { units, note };
  if (variantId) body.variantId = variantId;
  const response = await api.patch(`/admin/inventory/${productId}/restock`, body);
  return response.data;
},

// PATCH /admin/inventory/:id/adjust
// variantId is required when the product has variants.
adjustStock: async (productId, newQuantity, note, variantId = null) => {
  const body = { newQuantity, note };
  if (variantId) body.variantId = variantId;
  const response = await api.patch(`/admin/inventory/${productId}/adjust`, body);
  return response.data;
},
```

- [ ] **Step 2: Re-run tests — the API-signature tests should now pass**

```bash
npx vitest run src/Pages/Admin/Inventory/AdminInventory.test.jsx
```

Expected: tests 3 and 4 (restock/adjust variantId) PASS. Tests 1, 2, 5 still FAIL (no Variant column, history not wired yet).

---

## Task 3 — Add Variant column and fix row key in the table

**Files:**
- Modify: `src/Pages/Admin/Inventory/AdminInventory.jsx`
- Modify: `src/Pages/Admin/Inventory/AdminInventory.css`

- [ ] **Step 1: Add Variant column header**

In `AdminInventory.jsx`, find the `<thead>` block:

```jsx
<thead>
  <tr>
    <th>Product</th>
    <th>Category</th>
    <th>Qty</th>
    <th>Status</th>
    <th>Active</th>
    <th>Actions</th>
  </tr>
</thead>
```

Replace with:

```jsx
<thead>
  <tr>
    <th>Product</th>
    <th>Variant</th>
    <th>Category</th>
    <th>Qty</th>
    <th>Status</th>
    <th>Active</th>
    <th>Actions</th>
  </tr>
</thead>
```

- [ ] **Step 2: Add Variant cell and fix row key in the tbody map**

Find the `products.map((p, i) => {` block. Change the `<motion.tr key={p._id}` line and add the variant cell immediately after the Product `<td>`:

```jsx
<motion.tr
  key={`${p._id}_${p.variantId || "base"}`}
  ...
>
  <td>
    {/* existing product cell — no change */}
  </td>
  <td>
    {p.variantLabel
      ? <span className="inv-variant-label">{p.variantLabel}</span>
      : <span className="inv-no-variant">—</span>
    }
  </td>
  <td>{/* existing category cell */}</td>
  ...
```

- [ ] **Step 3: Add CSS for the variant chip**

In `AdminInventory.css`, add at the end:

```css
/* ── Variant label chip ── */
.inv-variant-label {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.18rem 0.6rem;
  border-radius: 20px;
  background: rgba(0, 28, 16, 0.07);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.inv-no-variant {
  color: var(--color-text-soft, #bbb);
  font-size: 0.85rem;
}
```

- [ ] **Step 4: Re-run tests**

```bash
npx vitest run src/Pages/Admin/Inventory/AdminInventory.test.jsx
```

Expected: test 1 (Variant column) now PASSES. Tests 2, 5 still fail (history wiring).

---

## Task 4 — Wire variantId into restock/adjust modals

**Files:**
- Modify: `src/Pages/Admin/Inventory/AdminInventory.jsx`

The row object (`p`) already carries `variantId` and `variantLabel` from the BE response. The component stores the full row in `restock.product` / `adjust.product`, so `variantId` is already available there — we just need to pass it and surface it in the modal UI.

- [ ] **Step 1: Update `handleRestock` to pass variantId**

Find:
```js
await inventoryApi.restockProduct(restock.product._id, units, restock.note);
```

Replace with:
```js
await inventoryApi.restockProduct(
  restock.product._id,
  units,
  restock.note,
  restock.product.variantId || null
);
```

- [ ] **Step 2: Update `handleAdjust` to pass variantId**

Find:
```js
await inventoryApi.adjustStock(adjust.product._id, newQty, adjust.note);
```

Replace with:
```js
await inventoryApi.adjustStock(
  adjust.product._id,
  newQty,
  adjust.note,
  adjust.product.variantId || null
);
```

- [ ] **Step 3: Show variant label in Restock modal title**

Find the restock modal `<h3>`:
```jsx
<h3 className="admin-modal-title">Restock — {productName(restock.product)}</h3>
```

Replace with:
```jsx
<h3 className="admin-modal-title">
  Restock — {productName(restock.product)}
  {restock.product?.variantLabel && (
    <span className="inv-modal-variant-chip">{restock.product.variantLabel}</span>
  )}
</h3>
```

- [ ] **Step 4: Show variant label in Adjust modal title**

Find:
```jsx
<h3 className="admin-modal-title">Adjust Stock — {productName(adjust.product)}</h3>
```

Replace with:
```jsx
<h3 className="admin-modal-title">
  Adjust Stock — {productName(adjust.product)}
  {adjust.product?.variantLabel && (
    <span className="inv-modal-variant-chip">{adjust.product.variantLabel}</span>
  )}
</h3>
```

- [ ] **Step 5: Add the chip style to AdminInventory.css**

```css
.inv-modal-variant-chip {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  margin-left: 0.5rem;
  border-radius: 20px;
  background: rgba(0, 28, 16, 0.09);
  color: var(--color-text-muted);
  vertical-align: middle;
}
```

- [ ] **Step 6: Re-run tests**

```bash
npx vitest run src/Pages/Admin/Inventory/AdminInventory.test.jsx
```

Expected: tests 1, 2, 3 PASS. Tests 4, 5 (history) still fail.

---

## Task 5 — Wire variantId into history drawer and movement items

**Files:**
- Modify: `src/Pages/Admin/Inventory/AdminInventory.jsx`

- [ ] **Step 1: Pass variantId to `getMovements` in `openHistory`**

Find:
```js
const openHistory = async (product) => {
  setHistory({ open: true, product, movements: [], loading: true });
  try {
    const res = await inventoryApi.getMovements(product._id);
```

Replace with:
```js
const openHistory = async (product) => {
  setHistory({ open: true, product, movements: [], loading: true });
  try {
    const params = product.variantId ? { variantId: product.variantId } : {};
    const res = await inventoryApi.getMovements(product._id, params);
```

- [ ] **Step 2: Show variant label in the history drawer header**

Find:
```jsx
<div>
  <h3>Movement History</h3>
  <p>{history.product ? productName(history.product) : ""}</p>
</div>
```

Replace with:
```jsx
<div>
  <h3>Movement History</h3>
  <p>
    {history.product ? productName(history.product) : ""}
    {history.product?.variantLabel && (
      <span className="inv-modal-variant-chip">{history.product.variantLabel}</span>
    )}
  </p>
</div>
```

- [ ] **Step 3: Show variantLabel on each movement item**

Find the movement item render block inside `history.movements.map((m) => (`:

```jsx
<div className="inv-movement-info">
  <span className="inv-movement-delta">
    {m.delta > 0 ? `+${m.delta}` : m.delta} units
    <span className="inv-movement-qty">
      &nbsp;({m.prevQty} → {m.newQty})
    </span>
  </span>
  {m.note && (
    <span className="inv-movement-note">"{m.note}"</span>
  )}
  <span className="inv-movement-meta">
    {m.createdBy?.name || "System"} ·{" "}
    {new Date(m.createdAt).toLocaleString()}
  </span>
</div>
```

Replace with:
```jsx
<div className="inv-movement-info">
  <span className="inv-movement-delta">
    {m.delta > 0 ? `+${m.delta}` : m.delta} units
    <span className="inv-movement-qty">
      &nbsp;({m.prevQty} → {m.newQty})
    </span>
    {m.variantLabel && (
      <span className="inv-modal-variant-chip">{m.variantLabel}</span>
    )}
  </span>
  {m.note && (
    <span className="inv-movement-note">"{m.note}"</span>
  )}
  <span className="inv-movement-meta">
    {m.createdBy?.name || "System"} ·{" "}
    {new Date(m.createdAt).toLocaleString()}
  </span>
</div>
```

- [ ] **Step 4: Run all tests — all 5 should now PASS**

```bash
npx vitest run src/Pages/Admin/Inventory/AdminInventory.test.jsx
```

Expected: **5/5 PASS**

- [ ] **Step 5: Run the full admin test suite — no regressions**

```bash
npx vitest run src/Pages/Admin
```

Expected: all tests PASS

- [ ] **Step 6: Production build — no compile errors**

```bash
npx vite build 2>&1 | grep -E "error|built in"
```

Expected: `✓ built in Xs`

---

## Task 6 — Commit

- [ ] **Step 1: Stage and commit**

```bash
cd "C:/Users/Raj/OneDrive/Documents/Pet Project/frontend"
git add \
  src/Services/api/inventoryApi.js \
  src/Pages/Admin/Inventory/AdminInventory.jsx \
  src/Pages/Admin/Inventory/AdminInventory.css \
  src/Pages/Admin/Inventory/AdminInventory.test.jsx

git commit -m "feat(epic-14): variant-aware inventory admin UI

Surfaces the per-variant rows already returned by getInventory:

- Table: add Variant column showing variantLabel chip; fix row key to
  \`\${productId}_\${variantId || 'base'}\` so variant rows are distinct.
- Restock modal: passes variantId to PATCH /inventory/:id/restock;
  shows variant chip in modal title.
- Adjust modal: passes variantId to PATCH /inventory/:id/adjust;
  shows variant chip in modal title.
- History drawer: passes ?variantId= to GET /inventory/:id/movements
  when opening a variant row; shows variantLabel in drawer header and
  on each movement item.
- inventoryApi: restockProduct + adjustStock accept optional variantId arg.
- AdminInventory.test.jsx: 5/5 (column, restock, adjust, history call,
  movement label).

Backend variant-aware controller shipped in e98a3c7.
Spec: docs/superpowers/specs/2026-06-21-variant-aware-inventory-design.md

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|-----------------|------|
| Per-variant rows in inventory table | Task 3 |
| Variant label shown per row | Task 3 |
| Restock requires variantId for variant products | Tasks 2 + 4 |
| Adjust requires variantId for variant products | Tasks 2 + 4 |
| History filtered to selected variant | Task 5 |
| variantLabel shown on movement items | Task 5 |
| Modal shows which variant is being acted on | Tasks 4 + 5 |

All requirements covered. No placeholders. Types consistent across all tasks (`variantId` is always passed as the 4th arg to `restockProduct`/`adjustStock`, matches BE body field name).
