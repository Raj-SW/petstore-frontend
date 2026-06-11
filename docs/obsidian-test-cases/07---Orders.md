# 07 - Orders

> **5 test cases**


---

### TC-ORD-001 — View My Orders

**Preconditions:** Logged in as customer with at least one completed order.

**Steps:**
1. Navigate to /my-orders.

**Expected Result:** List of orders: ID, date, total, status, items summary.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ORD-002 — View Order Detail

**Preconditions:** On My Orders with orders listed.

**Steps:**
1. Click an order to view detail.

**Expected Result:** Shows: items, quantities, prices, shipping address, payment status, order status.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ORD-003 — Cancel a Pending Order

**Preconditions:** Logged in. Pending order exists.

**Steps:**
1. Find pending order.
2. Click 'Cancel Order'.
3. Confirm.

**Expected Result:** Order status changes to 'cancelled'. Cancel button disabled/hidden.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ORD-004 — Cannot Cancel Shipped Order

**Preconditions:** Order exists with status 'shipped' or 'delivered'.

**Steps:**
1. Navigate to that order.

**Expected Result:** Cancel button not shown or disabled for shipped/delivered orders.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ORD-005 — My Orders – Empty State

**Preconditions:** Logged in as new customer with no orders.

**Steps:**
1. Navigate to /my-orders.

**Expected Result:** Empty state shown. Link to Pet Shop displayed.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
