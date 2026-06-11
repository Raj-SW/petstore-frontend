# 14 - Admin Orders

> **4 test cases**


---

### TC-ADO-001 — All Orders List

**Preconditions:** Logged in as admin. At least one order exists.

**Steps:**
1. Navigate to /admin/orders.

**Expected Result:** All orders: ID, customer, date, total, status, payment status.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADO-002 — Update Order Status

**Preconditions:** A pending/processing order exists.

**Steps:**
1. Find order.
2. Change status to 'processing'.
3. Save.

**Expected Result:** Status updates. Customer sees it in My Orders.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADO-003 — Update Payment Status

**Preconditions:** Order with pending payment exists.

**Steps:**
1. Find order.
2. Update payment status to 'completed'.

**Expected Result:** Payment status updates in admin list.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADO-004 — Filter Orders by Status

**Preconditions:** Multiple orders exist.

**Steps:**
1. Filter by 'shipped'.

**Expected Result:** Only shipped orders displayed.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
