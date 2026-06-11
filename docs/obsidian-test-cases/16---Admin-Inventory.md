# 16 - Admin Inventory

> **9 test cases**


---

### TC-INV-001 — Inventory Page Loads

**Preconditions:** Logged in as admin. Products exist.

**Steps:**
1. Navigate to /admin/inventory.

**Expected Result:** Stats: Total SKUs, Low Stock, Out of Stock, Total Value. Table: name, category, quantity, stock status badge, active status.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-INV-002 — Filter by Stock Status

**Preconditions:** Products with varied stock levels.

**Steps:**
1. Filter 'Low Stock'.
2. Filter 'Out of Stock'.
3. Filter 'In Stock'.

**Expected Result:** Each filter shows only matching products.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-INV-003 — Search Inventory

**Preconditions:** On Inventory page.

**Steps:**
1. Type a product name in search.

**Expected Result:** Table filters to matching products.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-INV-004 — Restock a Product

**Preconditions:** Product with low/zero stock.

**Steps:**
1. Click Restock.
2. Enter units (e.g., 50).
3. Add optional note.
4. Confirm.

**Expected Result:** Quantity increases by entered amount. Status badge updates. Toast shown.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-INV-005 — Adjust Stock

**Preconditions:** On Inventory page.

**Steps:**
1. Click Adjust.
2. Enter new exact quantity (e.g., 25).
3. Enter mandatory reason note.
4. Confirm.

**Expected Result:** Quantity set to entered value (replaced, not added). Movement record created.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-INV-006 — Adjust Stock – Missing Note

**Preconditions:** Adjust modal is open.

**Steps:**
1. Enter new quantity.
2. Leave note empty.
3. Submit.

**Expected Result:** Validation error: note required. Stock not changed.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-INV-007 — View Movement History

**Preconditions:** Product with past stock movements.

**Steps:**
1. Click movement history action on product.

**Expected Result:** Drawer shows: type (order/restock/adjustment), delta (+/-), prevQty, newQty, changed by, timestamp.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-INV-008 — Change Low Stock Threshold

**Preconditions:** On Inventory page.

**Steps:**
1. Change threshold from 10 to 20.
2. Apply/refresh.

**Expected Result:** Products with qty ≤ 20 now show 'low stock'.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-INV-009 — Inventory Reflects Order Deductions

**Preconditions:** Product with known stock (e.g., 10 units).

**Steps:**
1. Customer orders 2 units of that product (complete checkout).
2. Admin checks inventory.

**Expected Result:** Quantity reduced by 2. Movement history shows 'order' type entry.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
