# 06 - Payments

> **6 test cases**


---

### TC-PAY-001 — Payment Page Loads

**Preconditions:** Navigated from Checkout Step 2 (order just created).

**Steps:**
1. Observe /payment/:orderId.

**Expected Result:** CheckoutStepper shows Step 3 (Payment) active. Order summary left, Stripe card input right.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PAY-002 — Successful Stripe Payment

**Preconditions:** On payment page. Stripe test mode enabled.

**Steps:**
1. Enter test card: 4242 4242 4242 4242, any future expiry, any CVC.
2. Click 'Pay Now'.

**Expected Result:** Processing spinner shown. On success → redirected to /order-confirmed/:orderId.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PAY-003 — Order Confirmed Page

**Preconditions:** Payment just completed.

**Steps:**
1. Observe /order-confirmed/:orderId.

**Expected Result:** Animated checkmark. Order ID (last 8 chars). Items list with totals. 'View My Orders' and 'Continue Shopping' buttons work.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PAY-004 — Payment – Declined Card

**Preconditions:** On payment page.

**Steps:**
1. Enter declined test card: 4000 0000 0000 0002.
2. Click Pay.

**Expected Result:** Error: card declined. User stays on payment page.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PAY-005 — Payment – Insufficient Funds

**Preconditions:** On payment page.

**Steps:**
1. Enter test card: 4000 0000 0000 9995.
2. Click Pay.

**Expected Result:** Error: insufficient funds. User stays on payment page.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PAY-006 — Order Confirmed Page – Refresh

**Preconditions:** User is on /order-confirmed/:orderId after payment.

**Steps:**
1. Refresh the page (F5).

**Expected Result:** Page still shows order details (API fallback). No crash or blank state.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
