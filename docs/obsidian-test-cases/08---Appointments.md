# 08 - Appointments

> **9 test cases**


---

### TC-APT-001 — Page Loads (Unauthenticated)

**Preconditions:** User NOT logged in.

**Steps:**
1. Navigate to /appointments.

**Expected Result:** Page loads. Tabs: Veterinarians, Groomers, Trainers, Pet Taxi. Dashboard tab shows login prompt.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-APT-002 — Browse Veterinarians Tab

**Preconditions:** On appointments page.

**Steps:**
1. Click 'Veterinarians' tab.

**Expected Result:** List of vets loads with cards (name, specialty, availability).

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-APT-003 — Browse by Role via URL

**Preconditions:** None.

**Steps:**
1. Navigate to /appointments?tab=groomers.

**Expected Result:** Groomers tab active with correct professionals. URL param respected.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-APT-004 — Book an Appointment

**Preconditions:** Logged in as customer. Professional with availability exists.

**Steps:**
1. Select a professional.
2. Select date/time slot.
3. Select pet.
4. Add description.
5. Confirm.

**Expected Result:** Appointment created. Confirmation shown. Appears in My Appointments.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-APT-005 — View My Appointments

**Preconditions:** Logged in as customer with appointments.

**Steps:**
1. On appointments page, click 'Dashboard' tab.

**Expected Result:** User's appointments listed with status, professional name, date/time.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-APT-006 — Cancel an Appointment

**Preconditions:** Logged in. PENDING appointment exists.

**Steps:**
1. Find pending appointment.
2. Click Cancel.
3. Confirm.

**Expected Result:** Appointment status changes to CANCELLED.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-APT-007 — Professional Views Their Appointments

**Preconditions:** Logged in as vet or groomer. Appointments exist for this professional.

**Steps:**
1. Navigate to professional appointments section.

**Expected Result:** Professional sees appointments booked with them.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-APT-008 — Professional Confirms an Appointment

**Preconditions:** Logged in as professional. PENDING appointment exists.

**Steps:**
1. Find PENDING appointment.
2. Change status to CONFIRMED.

**Expected Result:** Appointment status updates to CONFIRMED.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-APT-009 — Book Without Login

**Preconditions:** User NOT logged in.

**Steps:**
1. Try to book an appointment.

**Expected Result:** Login prompt shown. Booking not created.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
