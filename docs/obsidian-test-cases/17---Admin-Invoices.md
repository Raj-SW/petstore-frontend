# 17 - Admin Invoices

> **8 test cases**


---

### TC-AIN-001 — Invoices Page Loads

**Preconditions:** Logged in as admin. Completed orders exist.

**Steps:**
1. Navigate to /admin/invoices.

**Expected Result:** Stats: Total Issued, Total Revenue, Total Refunded. Invoice table renders.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AIN-002 — Generate Invoice from Order

**Preconditions:** A paid order without an invoice.

**Steps:**
1. Trigger 'Generate Invoice' for the paid order.

**Expected Result:** Invoice created in INV-YYYY-NNNN format. Appears in invoices list.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AIN-003 — Generate Invoice – Idempotency

**Preconditions:** Invoice already exists for an order.

**Steps:**
1. Try to generate invoice for same order again.

**Expected Result:** Returns existing invoice. No duplicate created.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AIN-004 — View Invoice Detail

**Preconditions:** At least one invoice exists.

**Steps:**
1. Click view action on an invoice.

**Expected Result:** Drawer shows: invoice number, customer, shipping address, line items, subtotal, discount, total, payment method, transaction ID.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AIN-005 — Download Invoice PDF

**Preconditions:** Invoice exists.

**Steps:**
1. Click 'Download PDF' on an invoice.

**Expected Result:** PDF downloads. Contains VitalPaws branding, invoice number, line items, totals.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AIN-006 — Search Invoices

**Preconditions:** Multiple invoices exist.

**Steps:**
1. Search by invoice number (e.g., 'INV-2026').

**Expected Result:** Table filters to matching invoices.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AIN-007 — Filter by Status

**Preconditions:** Invoices with 'issued' and 'refunded' statuses.

**Steps:**
1. Filter by 'Refunded'.

**Expected Result:** Only refunded invoices shown.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AIN-008 — Customer Views Own Invoice

**Preconditions:** Logged in as customer. Invoice exists for their order.

**Steps:**
1. Access own invoice URL.
2. Access another customer's invoice URL directly.

**Expected Result:** Own invoice accessible. Other customer's invoice returns 403 Forbidden.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
