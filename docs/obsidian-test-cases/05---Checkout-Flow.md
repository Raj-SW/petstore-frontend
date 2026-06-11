# 05 - Checkout Flow

> **8 test cases**


---

### TC-CHK-001 — Step 1 – Cart Review

**Preconditions:** Logged in as customer. At least one item in cart.

**Steps:**
1. Navigate to /checkout.
2. Observe Step 1.

**Expected Result:** CheckoutStepper shows Step 1 (Cart) active. Items listed. Summary shows subtotal, shipping ($20), total.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CHK-002 — Step 1 – Modify Quantity

**Preconditions:** On /checkout Step 1 with items.

**Steps:**
1. Change quantity of an item with +/− controls.

**Expected Result:** Total in sidebar updates in real time.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CHK-003 — Step 1 – Remove Item

**Preconditions:** On /checkout Step 1 with 2+ items.

**Steps:**
1. Remove one item from cart.

**Expected Result:** Item disappears. Totals recalculate.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CHK-004 — Step 1 → Step 2 Navigation

**Preconditions:** On /checkout Step 1.

**Steps:**
1. Click 'Continue' to proceed.

**Expected Result:** Stepper advances to Step 2 (Shipping). Slide animation plays.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CHK-005 — Step 2 – Shipping Address Form

**Preconditions:** On /checkout Step 2.

**Steps:**
1. Fill in: Street, City, State, Country, Zip.
2. Observe order summary sidebar.

**Expected Result:** All fields accept input. Order summary visible (read-only). Total shown.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CHK-006 — Step 2 – Validation: Missing Fields

**Preconditions:** On /checkout Step 2.

**Steps:**
1. Leave one or more address fields blank.
2. Click 'Place Order'.

**Expected Result:** Validation errors on empty fields. Order not placed.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CHK-007 — Step 2 – Back Navigation

**Preconditions:** On /checkout Step 2.

**Steps:**
1. Click 'Back' button.

**Expected Result:** Returns to Step 1. Cart items intact. Reverse slide animation plays.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CHK-008 — Place Order → Payment

**Preconditions:** On /checkout Step 2 with valid shipping info.

**Steps:**
1. Fill all shipping fields.
2. Click 'Place Order'.

**Expected Result:** Cart synced → order created → redirected to /payment/:orderId. Order ID visible in URL.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
