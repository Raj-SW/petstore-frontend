# 04 - Cart

> **7 test cases**


---

### TC-CART-001 — Add Item to Cart

**Preconditions:** None (can be logged out).

**Steps:**
1. On Pet Shop or product page.
2. Click 'Add to Cart'.

**Expected Result:** Cart icon count increments. Toast confirmation shown.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CART-002 — View Cart Modal

**Preconditions:** At least one item in cart.

**Steps:**
1. Click cart icon in navbar.

**Expected Result:** Cart modal opens: product image, name, price, quantity, subtotal, total.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CART-003 — Change Quantity in Cart

**Preconditions:** Item in cart. Cart modal open.

**Steps:**
1. Increase quantity with + button.
2. Decrease with − button.

**Expected Result:** Quantity updates. Total price recalculates correctly.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CART-004 — Remove Item from Cart

**Preconditions:** Item in cart. Cart modal open.

**Steps:**
1. Click remove/delete icon on a cart item.

**Expected Result:** Item removed. Cart count decrements. Total updates.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CART-005 — Cart Persists on Refresh

**Preconditions:** Item(s) in cart.

**Steps:**
1. Add items to cart.
2. Refresh page (F5).
3. Open cart.

**Expected Result:** Cart still contains the same items.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CART-006 — Empty Cart State

**Preconditions:** Cart is empty.

**Steps:**
1. Open cart modal with no items.

**Expected Result:** Empty state message shown. Checkout button disabled or hidden.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**

---

### TC-CART-007 — Checkout Requires Login

**Preconditions:** User NOT logged in. Items in cart.

**Steps:**
1. Open cart modal.
2. Click 'Checkout'.

**Expected Result:** Login prompt shown OR redirect to login. Does NOT proceed to /checkout without auth.

**Result:**
- [ ] Pass
- [ ] Fail
- [ ] Skip
- [ ] Blocked

**Notes:**
