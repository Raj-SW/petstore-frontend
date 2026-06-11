# 12 - Admin Products

> **7 test cases**


---

### TC-ADP-001 — Products List

**Preconditions:** Logged in as admin.

**Steps:**
1. Navigate to /admin/products.

**Expected Result:** DataTable shows all products: name, category, price, quantity, status, actions.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADP-002 — Create New Product

**Preconditions:** On Admin Products page.

**Steps:**
1. Click 'Add Product'.
2. Fill: name, description, price, quantity, categories.
3. Upload image.
4. Save.

**Expected Result:** Product in list and visible on Pet Shop page.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADP-003 — Create Product – Missing Fields

**Preconditions:** On product create form.

**Steps:**
1. Submit form with required fields blank.

**Expected Result:** Validation errors shown. Product not created.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADP-004 — Edit a Product

**Preconditions:** At least one product exists.

**Steps:**
1. Click Edit.
2. Change price.
3. Save.

**Expected Result:** Updated price in list and product page.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADP-005 — Delete a Product

**Preconditions:** At least one product exists.

**Steps:**
1. Click Delete.
2. Confirm.

**Expected Result:** Product removed from list and Pet Shop.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADP-006 — Upload Product Image

**Preconditions:** On product create/edit form.

**Steps:**
1. Click image upload.
2. Select JPG/PNG.
3. Save product.

**Expected Result:** Image uploads to Cloudinary. Product card shows uploaded image.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-ADP-007 — Toggle Product Active/Inactive

**Preconditions:** A product exists.

**Steps:**
1. Edit product.
2. Toggle 'isActive' off.
3. Save.

**Expected Result:** Product no longer on public Pet Shop. Still visible in admin.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
