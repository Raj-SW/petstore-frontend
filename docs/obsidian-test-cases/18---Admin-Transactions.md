# 18 - Admin Transactions

> **5 test cases**


---

### TC-ATR-001 — Transactions Page Loads

**Preconditions:** Logged in as admin. Completed payment exists.

**Steps:**
1. Navigate to /admin/transactions.

**Expected Result:** Stats: Total Revenue, Total Refunds, Net Revenue. Table: date, customer, type, amount, payment method, invoice link, transaction ID.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ATR-002 — Filter by Type (Payment / Refund)

**Preconditions:** Both payment and refund transactions exist.

**Steps:**
1. Filter by 'Refund'.

**Expected Result:** Only refund transactions shown. Amounts styled differently.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ATR-003 — Filter by Payment Method

**Preconditions:** Transactions via Stripe and PayPal exist.

**Steps:**
1. Filter by 'Stripe'.
2. Filter by 'PayPal'.

**Expected Result:** Each filter shows only transactions via that method.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ATR-004 — Transaction Links to Invoice

**Preconditions:** Transaction with a linked invoice exists.

**Steps:**
1. Find transaction with invoice reference.
2. Click invoice link.

**Expected Result:** Navigates to or shows corresponding invoice detail.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ATR-005 — Net Revenue Calculation

**Preconditions:** Known payment and refund amounts.

**Steps:**
1. Note Total Revenue and Total Refunds stats.

**Expected Result:** Net Revenue = Total Revenue − Total Refunds. Math is correct.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
