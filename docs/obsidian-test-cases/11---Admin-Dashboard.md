# 11 - Admin Dashboard

> **4 test cases**


---

### TC-ADM-001 — Dashboard Loads

**Preconditions:** Logged in as admin.

**Steps:**
1. Navigate to /admin.

**Expected Result:** Stats cards: total sales, orders, products, appointments. No console errors.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADM-002 — Stats Accuracy

**Preconditions:** Known data in system (e.g., 5 products, 3 orders).

**Steps:**
1. View dashboard stats.

**Expected Result:** Numbers match actual counts in the system.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADM-003 — Admin Sidebar Navigation

**Preconditions:** On any admin page.

**Steps:**
1. Click each sidebar item: Dashboard, Products, Users, Orders, Appointments, Analytics, Inventory, Invoices, Transactions, Settings.

**Expected Result:** Each click navigates to correct page. Active item highlighted.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADM-004 — Collapsible Sidebar

**Preconditions:** On any admin page.

**Steps:**
1. Click sidebar collapse toggle.
2. Click again to expand.

**Expected Result:** Collapses to icon-only. Content area expands. Expanding restores full sidebar.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
