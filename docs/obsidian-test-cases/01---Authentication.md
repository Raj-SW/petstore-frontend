# 01 - Authentication

> **14 test cases**


---

### TC-AUTH-001 — Successful Signup

**Preconditions:** User not logged in. Email does not exist in system.

**Steps:**
1. Navigate to homepage.
2. Click Sign Up in navbar.
3. Fill in: Name, Email, Phone (8 digits), Address, Password (8+ chars, uppercase, lowercase, number, special char).
4. Submit form.

**Expected Result:** Success message shown. User is NOT auto-logged in. Separate login required.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-002 — Signup – Duplicate Email

**Preconditions:** Account already exists with the email being used.

**Steps:**
1. Open Sign Up modal.
2. Enter an already-registered email.
3. Fill other fields validly.
4. Submit.

**Expected Result:** Error: email already in use. Form stays open.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-003 — Signup – Weak Password

**Preconditions:** User not logged in.

**Steps:**
1. Open Sign Up modal.
2. Enter a weak password (e.g., 'password', '12345678', 'ALLCAPS1!').
3. Submit.

**Expected Result:** Validation error describes which rule failed. Form not submitted.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-004 — Successful Login

**Preconditions:** Valid customer account exists. User not logged in.

**Steps:**
1. Click Login in navbar.
2. Enter correct email and password.
3. Submit.

**Expected Result:** Modal closes. Navbar shows user name. vp_token and vp_user stored in localStorage.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-005 — Login – Wrong Password

**Preconditions:** Valid account exists.

**Steps:**
1. Open Login modal.
2. Enter correct email but wrong password.
3. Submit.

**Expected Result:** Error: invalid credentials. User stays logged out.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-006 — Login – Non-Existent Email

**Preconditions:** User not logged in.

**Steps:**
1. Open Login modal.
2. Enter email with no account.
3. Submit.

**Expected Result:** Error message shown. User stays logged out.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-007 — Logout

**Preconditions:** User is logged in.

**Steps:**
1. Click user menu in navbar.
2. Click Logout.

**Expected Result:** User logged out. Navbar shows Login/Sign Up. vp_token and vp_user removed from localStorage.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-008 — Session Persists on Refresh

**Preconditions:** User is logged in.

**Steps:**
1. While logged in, press F5.

**Expected Result:** User remains logged in. Navbar still shows authenticated state.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-009 — Forgot Password – Email Sent

**Preconditions:** Account exists with a real email address.

**Steps:**
1. Open Login modal.
2. Click 'Forgot Password'.
3. Enter registered email.
4. Submit.

**Expected Result:** Success message. Password reset email received with reset link.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-010 — Forgot Password – Unregistered Email

**Preconditions:** None.

**Steps:**
1. Open Forgot Password modal.
2. Enter email with no account.
3. Submit.

**Expected Result:** Generic message shown or error. No crash.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-011 — Reset Password via Link

**Preconditions:** Valid password reset email received.

**Steps:**
1. Click reset link in email → navigates to /reset-password.
2. Enter new valid password.
3. Confirm password.
4. Submit.

**Expected Result:** Success message. Can log in with new password. Old password rejected.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-012 — Reset Password – Expired Token

**Preconditions:** Password reset token older than 10 minutes.

**Steps:**
1. Use an expired reset link.
2. Try to submit new password.

**Expected Result:** Error: token expired or invalid.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-013 — Expired JWT Auto-Logout

**Preconditions:** User is logged in.

**Steps:**
1. In DevTools → Application → Local Storage, edit vp_token to use a past timestamp for exp.
2. Refresh the page.

**Expected Result:** User automatically logged out. Navbar shows Login/Sign Up.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-AUTH-014 — 401 Response Triggers Logout

**Preconditions:** User is logged in.

**Steps:**
1. In DevTools, corrupt the vp_token value.
2. Navigate to a protected page (e.g., /profile).

**Expected Result:** API returns 401 → user automatically logged out and redirected.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
