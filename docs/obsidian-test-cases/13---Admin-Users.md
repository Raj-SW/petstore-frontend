# 13 - Admin Users

> **5 test cases**


---

### TC-ADU-001 — Users List

**Preconditions:** Logged in as admin.

**Steps:**
1. Navigate to /admin/users.

**Expected Result:** Table: name, email, role, status, join date, actions.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADU-002 — Change User Role

**Preconditions:** Customer account exists.

**Steps:**
1. Find customer.
2. Change role to 'veterinarian'.
3. Save.

**Expected Result:** Role updates. User now has professional privileges.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADU-003 — Toggle User Status

**Preconditions:** On Admin Users page.

**Steps:**
1. Find active user.
2. Toggle status to inactive.

**Expected Result:** Status changes. Deactivated user cannot log in (401 from backend).

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADU-004 — Delete a User

**Preconditions:** A non-admin user exists.

**Steps:**
1. Find user.
2. Click Delete.
3. Confirm.

**Expected Result:** User removed from list. Cannot log in.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADU-005 — Admin Cannot Delete Themselves

**Preconditions:** Logged in as admin.

**Steps:**
1. Find own account in users list.
2. Attempt to delete.

**Expected Result:** Delete hidden for own account or error shown if attempted.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
