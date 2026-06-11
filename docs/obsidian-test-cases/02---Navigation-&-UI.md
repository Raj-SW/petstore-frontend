# 02 - Navigation & UI

> **5 test cases**


---

### TC-NAV-001 — Navbar – Unauthenticated State

**Preconditions:** User NOT logged in.

**Steps:**
1. Visit homepage.
2. Observe navbar.

**Expected Result:** Shows: Logo, Home, Services dropdown, Pet Shop, Login, Sign Up, Cart icon.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-NAV-002 — Navbar – Authenticated State

**Preconditions:** User logged in as customer.

**Steps:**
1. Log in.
2. Observe navbar.

**Expected Result:** Login/Sign Up replaced by user profile menu. Cart icon still visible.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-NAV-003 — Services Dropdown

**Preconditions:** None.

**Steps:**
1. Click 'Services' in navbar.
2. Check dropdown options.

**Expected Result:** Dropdown shows: All Services, Book Appointment, Import-Export. Each navigates correctly.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-NAV-004 — Mobile Menu

**Preconditions:** None.

**Steps:**
1. Resize browser to < 768px or use DevTools responsive mode.
2. Click hamburger icon.

**Expected Result:** Slide-out menu opens with all nav links. Services section is an accordion.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-NAV-005 — Admin Link Visibility

**Preconditions:** Test with admin and customer accounts.

**Steps:**
1. Log in as customer → check profile menu for Admin link.
2. Log out. Log in as admin → check again.

**Expected Result:** Admin link NOT visible for customer. Admin link IS visible for admin.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
