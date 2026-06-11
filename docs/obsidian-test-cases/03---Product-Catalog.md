# 03 - Product Catalog

> **11 test cases**


---

### TC-PROD-001 — Pet Shop Page Loads

**Preconditions:** None.

**Steps:**
1. Navigate to /petshop.

**Expected Result:** Product grid renders with cards (image, name, price, Add to Cart). No console errors.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-002 — Search Products

**Preconditions:** Pet Shop page is open.

**Steps:**
1. Type a product name in search bar.
2. Wait for results.

**Expected Result:** Grid updates to show only products matching the search term.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-003 — Search – No Results

**Preconditions:** Pet Shop page is open.

**Steps:**
1. Search for term matching nothing (e.g., 'xyznonexistent').

**Expected Result:** Empty state message shown. No crash.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-004 — Filter by Category

**Preconditions:** Pet Shop page is open.

**Steps:**
1. Open filter panel.
2. Select a category.

**Expected Result:** Grid updates to show only products in the selected category.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-005 — Sort Products

**Preconditions:** Pet Shop open with multiple products.

**Steps:**
1. Sort by Price Low→High.
2. Sort by Price High→Low.

**Expected Result:** Products reorder correctly for each sort option.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-006 — Pagination

**Preconditions:** Enough products to span multiple pages.

**Steps:**
1. Go to Pet Shop.
2. Click 'Next page' or page 2.

**Expected Result:** Different products load. Page indicator updates.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-007 — Individual Product Page

**Preconditions:** None.

**Steps:**
1. On Pet Shop, click a product card.

**Expected Result:** Navigates to /product/:id. Shows images, name, description, price, quantity selector, Add to Cart.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-008 — Product Images

**Preconditions:** On a product page with multiple images.

**Steps:**
1. Click through image thumbnails/carousel.

**Expected Result:** Main image updates to selected thumbnail. No broken images.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-009 — Product Reviews Display

**Preconditions:** A product with at least one review exists.

**Steps:**
1. Navigate to product page.
2. Scroll to reviews section.

**Expected Result:** Reviews show: star rating, comment, reviewer name. Average rating displayed.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-010 — Submit a Review

**Preconditions:** Logged in as customer. On a product page.

**Steps:**
1. Click 'Write a Review'.
2. Select star rating.
3. Write comment.
4. Submit.

**Expected Result:** Review appears in list. Average rating updates.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-PROD-011 — Submit Review – Logged Out

**Preconditions:** User NOT logged in. On a product page.

**Steps:**
1. Attempt to submit a review.

**Expected Result:** Login prompt shown or redirected. Review not submitted.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
