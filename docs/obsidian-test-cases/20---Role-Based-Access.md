# 20 - Role-Based Access

> **8 test cases**


---

### TC-RBA-001 — Customer Cannot Access Admin

**Preconditions:** Logged in as customer.

**Steps:**
1. Navigate directly to /admin.

**Expected Result:** Redirected away. Admin dashboard NOT shown.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-RBA-002 — Unauthenticated – Protected Pages

**Preconditions:** NOT logged in.

**Steps:**
1. Navigate to each: /profile, /checkout, /payment/123, /order-confirmed/123, /my-orders.

**Expected Result:** Each route redirects to home or login.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-RBA-003 — Professional Cannot Access Admin

**Preconditions:** Logged in as veterinarian.

**Steps:**
1. Navigate to /admin.

**Expected Result:** Redirected. Admin panel not accessible.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-RBA-004 — Customer Cannot Update Professional Availability

**Preconditions:** Logged in as customer.

**Steps:**
1. Attempt PATCH to /professionals/:id/availability via DevTools.

**Expected Result:** 403 Forbidden response.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-RBA-005 — Admin Accesses All Admin Endpoints

**Preconditions:** Logged in as admin.

**Steps:**
1. Navigate through all admin sidebar pages.

**Expected Result:** All pages load without 401 or 403 errors.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-RBA-006 — PetTaxi Excluded from Service Provider Routes

**Preconditions:** Logged in as petTaxi role.

**Steps:**
1. Attempt GET /appointments/professional-appointments.

**Expected Result:** 403 Forbidden – petTaxi excluded from isServiceProvider middleware.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-RBA-007 — Inactive User Cannot Login

**Preconditions:** Admin has set a user status to inactive.

**Steps:**
1. Attempt to log in as deactivated user.

**Expected Result:** Login fails: account deactivated error.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-RBA-008 — Customer Cannot View Another's Invoice

**Preconditions:** Two customers (A and B) each with an invoice.

**Steps:**
1. Log in as Customer A.
2. Access Customer B's invoice URL directly.

**Expected Result:** 403 Forbidden. Invoice not displayed.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
