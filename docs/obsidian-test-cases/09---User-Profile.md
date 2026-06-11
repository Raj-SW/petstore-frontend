# 09 - User Profile

> **9 test cases**


---

### TC-USR-001 — View Profile Page

**Preconditions:** Logged in as any user.

**Steps:**
1. Navigate to /profile.

**Expected Result:** Profile loads with name, email, phone, address. Tabs for Pets, Password, Delete Account.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-USR-002 — Update Profile Info

**Preconditions:** On profile page.

**Steps:**
1. Edit Name and Address.
2. Save changes.

**Expected Result:** Success message. Updated info persists on refresh.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-USR-003 — Change Password

**Preconditions:** On profile page, Password tab.

**Steps:**
1. Enter current password.
2. Enter new valid password.
3. Confirm.
4. Submit.

**Expected Result:** Success message. Can log in with new password. Old password rejected.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-USR-004 — Change Password – Wrong Current

**Preconditions:** On profile page, Password tab.

**Steps:**
1. Enter incorrect current password.
2. Submit.

**Expected Result:** Error: incorrect current password. Not changed.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-USR-005 — Add a Pet

**Preconditions:** On profile page, Pets tab.

**Steps:**
1. Click 'Add Pet'.
2. Fill: name, breed, age, type, gender, color, description.
3. Save.

**Expected Result:** New pet appears in pets list.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-USR-006 — Edit a Pet

**Preconditions:** At least one pet exists. On Pets tab.

**Steps:**
1. Click Edit on a pet.
2. Change name.
3. Save.

**Expected Result:** Pet name updates in list.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-USR-007 — Delete a Pet

**Preconditions:** At least one pet exists. On Pets tab.

**Steps:**
1. Click Delete on a pet.
2. Confirm.

**Expected Result:** Pet removed from list.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-USR-008 — Delete Account

**Preconditions:** On profile page, Delete Account section.

**Steps:**
1. Click 'Delete Account'.
2. Confirm.

**Expected Result:** Account deleted. User logged out. Old credentials rejected.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-USR-009 — Profile Requires Auth

**Preconditions:** User NOT logged in.

**Steps:**
1. Navigate directly to /profile.

**Expected Result:** Redirected to home/login. Profile page not shown.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
