# VitalPaws — Manual Test Cases

**Project:** VitalPaws Pet Care Platform  
**Scope:** Full system (Frontend + Backend)  
**Testing Type:** Manual  
**Last Updated:** 2026-06-05

---

## How to Use This Document

| Column | Description |
|--------|-------------|
| **TC ID** | Unique test case identifier |
| **Preconditions** | State that must be true before running the test |
| **Steps** | Numbered actions to perform |
| **Expected Result** | What a passing test looks like |
| **Status** | Fill in: ✅ Pass / ❌ Fail / ⏭ Skip |
| **Notes** | Bug description or observations |

---

## Test Accounts Required

Set these up before starting:

| Account | Role | Email | Purpose |
|---------|------|-------|---------|
| Admin | admin | admin@test.com | Admin panel tests |
| Customer | customer | customer@test.com | Shopping & checkout |
| Vet | veterinarian | vet@test.com | Professional appointment tests |
| Groomer | groomer | groomer@test.com | Professional appointment tests |

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Navigation & UI](#2-navigation--ui)
3. [Product Catalog](#3-product-catalog)
4. [Cart](#4-cart)
5. [Checkout Flow](#5-checkout-flow)
6. [Payments](#6-payments)
7. [Orders](#7-orders)
8. [Appointments](#8-appointments)
9. [User Profile](#9-user-profile)
10. [Professionals](#10-professionals)
11. [Admin — Dashboard](#11-admin--dashboard)
12. [Admin — Products](#12-admin--products)
13. [Admin — Users](#13-admin--users)
14. [Admin — Orders](#14-admin--orders)
15. [Admin — Appointments](#15-admin--appointments)
16. [Admin — Inventory](#16-admin--inventory)
17. [Admin — Invoices](#17-admin--invoices)
18. [Admin — Transactions](#18-admin--transactions)
19. [Admin — Analytics](#19-admin--analytics)
20. [Role-Based Access Control](#20-role-based-access-control)

---

## 1. Authentication

### TC-AUTH-001 — Successful Signup

| | |
|---|---|
| **Preconditions** | User is not logged in. Email does not already exist in the system. |
| **Steps** | 1. Navigate to homepage. <br>2. Click the Sign Up button in the navbar. <br>3. Fill in: Name, Email, Phone (8 digits), Address, Password (must have uppercase, lowercase, number, special char, 8+ chars). <br>4. Submit the form. |
| **Expected Result** | Success message shown. User is NOT auto-logged in. Login required separately. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-002 — Signup with Duplicate Email

| | |
|---|---|
| **Preconditions** | An account already exists with the email being used. |
| **Steps** | 1. Open Sign Up modal. <br>2. Enter an already-registered email. <br>3. Fill in all other fields validly. <br>4. Submit. |
| **Expected Result** | Error message: email already in use. Form does not close. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-003 — Signup with Weak Password

| | |
|---|---|
| **Preconditions** | User is not logged in. |
| **Steps** | 1. Open Sign Up modal. <br>2. Enter a password that fails one or more rules (e.g., "password", "12345678", "ALLCAPS1!"). <br>3. Submit. |
| **Expected Result** | Validation error shown describing which rule failed. Form not submitted. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-004 — Successful Login

| | |
|---|---|
| **Preconditions** | Valid customer account exists. User is not logged in. |
| **Steps** | 1. Click Login in the navbar. <br>2. Enter correct email and password. <br>3. Submit. |
| **Expected Result** | Modal closes. Navbar updates to show user name / profile menu. `vp_token` and `vp_user` are set in localStorage. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-005 — Login with Wrong Password

| | |
|---|---|
| **Preconditions** | Valid account exists. |
| **Steps** | 1. Open Login modal. <br>2. Enter correct email but wrong password. <br>3. Submit. |
| **Expected Result** | Error message: invalid credentials. User remains logged out. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-006 — Login with Non-Existent Email

| | |
|---|---|
| **Preconditions** | User is not logged in. |
| **Steps** | 1. Open Login modal. <br>2. Enter an email that has no account. <br>3. Submit. |
| **Expected Result** | Error message shown. User remains logged out. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-007 — Logout

| | |
|---|---|
| **Preconditions** | User is logged in. |
| **Steps** | 1. Click the user menu in the navbar. <br>2. Click Logout. |
| **Expected Result** | User is logged out. Navbar reverts to Login/Sign Up buttons. `vp_token` and `vp_user` removed from localStorage. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-008 — Session Persists on Page Refresh

| | |
|---|---|
| **Preconditions** | User is logged in. |
| **Steps** | 1. While logged in, press F5 to refresh the page. |
| **Expected Result** | User remains logged in after refresh. Navbar still shows authenticated state. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-009 — Forgot Password — Email Sent

| | |
|---|---|
| **Preconditions** | Account exists with a real email address. |
| **Steps** | 1. Open Login modal. <br>2. Click "Forgot Password". <br>3. Enter registered email. <br>4. Submit. |
| **Expected Result** | Success message: password reset email sent. Email received with reset link. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-010 — Forgot Password — Unregistered Email

| | |
|---|---|
| **Preconditions** | None. |
| **Steps** | 1. Open Forgot Password modal. <br>2. Enter an email that has no account. <br>3. Submit. |
| **Expected Result** | Error shown or generic "if this email exists, you'll receive a link" message. No crash. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-011 — Reset Password via Link

| | |
|---|---|
| **Preconditions** | A valid password reset email has been received (TC-AUTH-009). |
| **Steps** | 1. Click the reset link in the email → navigates to `/reset-password`. <br>2. Enter a new valid password. <br>3. Confirm password. <br>4. Submit. |
| **Expected Result** | Success message. User can log in with the new password. Old password no longer works. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-012 — Reset Password with Expired Token

| | |
|---|---|
| **Preconditions** | Password reset token is older than 10 minutes. |
| **Steps** | 1. Use an old/expired reset link. <br>2. Try to submit new password. |
| **Expected Result** | Error: token expired or invalid. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-013 — Expired JWT Auto-Logout

| | |
|---|---|
| **Preconditions** | User has a valid account. Modify `vp_token` in localStorage to set an expired `exp` claim. |
| **Steps** | 1. In browser DevTools → Application → Local Storage, edit `vp_token` to use a past timestamp for `exp`. <br>2. Refresh the page. |
| **Expected Result** | User is automatically logged out. Navbar shows Login/Sign Up. |
| **Status** | |
| **Notes** | |

---

### TC-AUTH-014 — 401 Response Triggers Logout

| | |
|---|---|
| **Preconditions** | User is logged in. |
| **Steps** | 1. In DevTools → Application → Local Storage, corrupt the `vp_token` value (e.g., add random chars). <br>2. Navigate to a protected page (e.g., `/profile`). |
| **Expected Result** | API call returns 401 → user is automatically logged out and redirected. |
| **Status** | |
| **Notes** | |

---

## 2. Navigation & UI

### TC-NAV-001 — Navbar Unauthenticated State

| | |
|---|---|
| **Preconditions** | User is NOT logged in. |
| **Steps** | 1. Visit the homepage. <br>2. Observe the navbar. |
| **Expected Result** | Navbar shows: Logo, Home, Services dropdown, Pet Shop, Login, Sign Up, Cart icon. |
| **Status** | |
| **Notes** | |

---

### TC-NAV-002 — Navbar Authenticated State

| | |
|---|---|
| **Preconditions** | User is logged in as customer. |
| **Steps** | 1. Log in. <br>2. Observe the navbar. |
| **Expected Result** | Login/Sign Up replaced by user profile menu. Cart icon still visible. |
| **Status** | |
| **Notes** | |

---

### TC-NAV-003 — Services Dropdown

| | |
|---|---|
| **Preconditions** | None. |
| **Steps** | 1. Hover or click "Services" in the navbar. <br>2. Check the dropdown options. |
| **Expected Result** | Dropdown shows: All Services, Book Appointment, Import-Export. Each navigates to the correct page. |
| **Status** | |
| **Notes** | |

---

### TC-NAV-004 — Mobile Menu

| | |
|---|---|
| **Preconditions** | None. |
| **Steps** | 1. Resize browser to mobile width (< 768px) or use DevTools responsive mode. <br>2. Click the hamburger/menu icon. |
| **Expected Result** | Slide-out mobile menu opens with all nav links. Services section is an accordion. |
| **Status** | |
| **Notes** | |

---

### TC-NAV-005 — Admin Link Visibility

| | |
|---|---|
| **Preconditions** | Test with two accounts: admin and customer. |
| **Steps** | 1. Log in as customer → check profile menu for Admin link. <br>2. Log out. Log in as admin → check profile menu. |
| **Expected Result** | Admin link is NOT visible for customer. Admin link IS visible for admin user. |
| **Status** | |
| **Notes** | |

---

## 3. Product Catalog

### TC-PROD-001 — Pet Shop Page Loads

| | |
|---|---|
| **Preconditions** | None. |
| **Steps** | 1. Navigate to `/petshop`. |
| **Expected Result** | Product grid renders with cards (image, name, price, Add to Cart button). No console errors. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-002 — Search Products

| | |
|---|---|
| **Preconditions** | Pet Shop page is open. |
| **Steps** | 1. Type a product name in the search bar. <br>2. Wait for results. |
| **Expected Result** | Grid updates to show only products matching the search term. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-003 — Search with No Results

| | |
|---|---|
| **Preconditions** | Pet Shop page is open. |
| **Steps** | 1. Search for a term that matches nothing (e.g., "xyznonexistent"). |
| **Expected Result** | Empty state message displayed (e.g., "No products found"). No crash. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-004 — Filter by Category

| | |
|---|---|
| **Preconditions** | Pet Shop page is open. |
| **Steps** | 1. Open the filter panel. <br>2. Select a category. |
| **Expected Result** | Grid updates to show only products in the selected category. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-005 — Sort Products

| | |
|---|---|
| **Preconditions** | Pet Shop page is open with multiple products. |
| **Steps** | 1. Use the sort dropdown to sort by Price (Low → High). <br>2. Then sort by Price (High → Low). |
| **Expected Result** | Products reorder correctly for each sort option. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-006 — Pagination

| | |
|---|---|
| **Preconditions** | Enough products exist to span multiple pages. |
| **Steps** | 1. Go to Pet Shop. <br>2. Click "Next page" or page 2 in the pagination bar. |
| **Expected Result** | Different set of products loads. Current page indicator updates. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-007 — Individual Product Page

| | |
|---|---|
| **Preconditions** | None. |
| **Steps** | 1. On Pet Shop, click a product card. |
| **Expected Result** | Navigates to `/product/:id`. Shows product image(s), name, description, price, quantity selector, Add to Cart button. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-008 — Product Images

| | |
|---|---|
| **Preconditions** | On an individual product page with multiple images. |
| **Steps** | 1. Click through the product image thumbnails/carousel. |
| **Expected Result** | Main image updates to the selected thumbnail. No broken images. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-009 — Product Reviews Display

| | |
|---|---|
| **Preconditions** | A product with at least one review exists. |
| **Steps** | 1. Navigate to that product's page. <br>2. Scroll to the reviews section. |
| **Expected Result** | Reviews show: star rating, comment, reviewer name. Average rating displayed. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-010 — Submit a Review

| | |
|---|---|
| **Preconditions** | Logged in as customer. On an individual product page. |
| **Steps** | 1. Click "Write a Review" or similar button. <br>2. Select a star rating. <br>3. Write a comment. <br>4. Submit. |
| **Expected Result** | Review appears in the list. Average rating updates. |
| **Status** | |
| **Notes** | |

---

### TC-PROD-011 — Submit Review When Logged Out

| | |
|---|---|
| **Preconditions** | User is NOT logged in. On a product page. |
| **Steps** | 1. Attempt to submit a review. |
| **Expected Result** | Redirected to login OR a login prompt appears. Review not submitted. |
| **Status** | |
| **Notes** | |

---

## 4. Cart

### TC-CART-001 — Add Item to Cart

| | |
|---|---|
| **Preconditions** | None (can be logged out). |
| **Steps** | 1. On Pet Shop or product page. <br>2. Click "Add to Cart" on any product. |
| **Expected Result** | Cart icon count increments. Toast/snackbar confirmation shown. |
| **Status** | |
| **Notes** | |

---

### TC-CART-002 — View Cart Modal

| | |
|---|---|
| **Preconditions** | At least one item in the cart. |
| **Steps** | 1. Click the cart icon in the navbar. |
| **Expected Result** | Cart modal/drawer opens showing: product image, name, price, quantity, subtotal, total. |
| **Status** | |
| **Notes** | |

---

### TC-CART-003 — Change Quantity in Cart

| | |
|---|---|
| **Preconditions** | Item is in the cart. Cart modal is open. |
| **Steps** | 1. Increase quantity using the + button. <br>2. Decrease quantity using the − button. |
| **Expected Result** | Quantity updates. Total price recalculates correctly. |
| **Status** | |
| **Notes** | |

---

### TC-CART-004 — Remove Item from Cart

| | |
|---|---|
| **Preconditions** | Item is in the cart. Cart modal is open. |
| **Steps** | 1. Click the remove/delete icon on a cart item. |
| **Expected Result** | Item is removed. Cart count decrements. Total updates. |
| **Status** | |
| **Notes** | |

---

### TC-CART-005 — Cart Persists on Page Refresh

| | |
|---|---|
| **Preconditions** | Item(s) in cart. |
| **Steps** | 1. Add items to cart. <br>2. Refresh the page (F5). <br>3. Open cart. |
| **Expected Result** | Cart still contains the same items. |
| **Status** | |
| **Notes** | |

---

### TC-CART-006 — Empty Cart State

| | |
|---|---|
| **Preconditions** | Cart is empty (or all items removed). |
| **Steps** | 1. Open cart modal with no items. |
| **Expected Result** | Empty state message displayed (e.g., "Your cart is empty"). Checkout button is disabled or hidden. |
| **Status** | |
| **Notes** | |

---

### TC-CART-007 — Checkout Button Requires Login

| | |
|---|---|
| **Preconditions** | User is NOT logged in. Items in cart. |
| **Steps** | 1. Open cart modal. <br>2. Click "Checkout" or "Proceed to Checkout". |
| **Expected Result** | Login prompt shown OR redirected to login. Does NOT proceed to `/checkout` without auth. |
| **Status** | |
| **Notes** | |

---

## 5. Checkout Flow

### TC-CHK-001 — Checkout Step 1 — Cart Review

| | |
|---|---|
| **Preconditions** | Logged in as customer. At least one item in cart. |
| **Steps** | 1. Proceed to `/checkout`. <br>2. Observe Step 1. |
| **Expected Result** | CheckoutStepper shows Step 1 (Cart) as active. Cart items listed with images, names, prices, quantities. Order summary sidebar shows subtotal, shipping ($20), and total. |
| **Status** | |
| **Notes** | |

---

### TC-CHK-002 — Checkout Step 1 — Modify Quantity

| | |
|---|---|
| **Preconditions** | On `/checkout` Step 1 with multiple items. |
| **Steps** | 1. Change quantity of an item using +/− controls. |
| **Expected Result** | Total in sidebar updates in real time. |
| **Status** | |
| **Notes** | |

---

### TC-CHK-003 — Checkout Step 1 — Remove Item

| | |
|---|---|
| **Preconditions** | On `/checkout` Step 1 with at least 2 items. |
| **Steps** | 1. Remove one item from the cart. |
| **Expected Result** | Item disappears. Totals recalculate. |
| **Status** | |
| **Notes** | |

---

### TC-CHK-004 — Checkout Step 1 → Step 2 Navigation

| | |
|---|---|
| **Preconditions** | On `/checkout` Step 1. |
| **Steps** | 1. Click "Continue" or "Next" to proceed to Step 2. |
| **Expected Result** | Stepper advances to Step 2 (Shipping). Smooth slide animation. |
| **Status** | |
| **Notes** | |

---

### TC-CHK-005 — Checkout Step 2 — Shipping Address Form

| | |
|---|---|
| **Preconditions** | On `/checkout` Step 2. |
| **Steps** | 1. Fill in: Street, City, State, Country, Zip. <br>2. Observe the frozen order summary sidebar. |
| **Expected Result** | All fields accept input. Order summary shown (read-only). Total visible. |
| **Status** | |
| **Notes** | |

---

### TC-CHK-006 — Checkout Step 2 — Validation: Missing Fields

| | |
|---|---|
| **Preconditions** | On `/checkout` Step 2. |
| **Steps** | 1. Leave one or more address fields blank. <br>2. Click "Place Order". |
| **Expected Result** | Validation errors shown on empty fields. Order not placed. |
| **Status** | |
| **Notes** | |

---

### TC-CHK-007 — Checkout Step 2 — Back Navigation

| | |
|---|---|
| **Preconditions** | On `/checkout` Step 2. |
| **Steps** | 1. Click "Back" button. |
| **Expected Result** | Returns to Step 1. Cart items still intact. Stepper shows Step 1 as active. Reverse slide animation plays. |
| **Status** | |
| **Notes** | |

---

### TC-CHK-008 — Place Order Navigates to Payment

| | |
|---|---|
| **Preconditions** | On `/checkout` Step 2 with valid shipping info. |
| **Steps** | 1. Fill in all shipping fields. <br>2. Click "Place Order". |
| **Expected Result** | Cart synced to backend → order created → redirected to `/payment/:orderId`. Order ID visible in URL. |
| **Status** | |
| **Notes** | |

---

## 6. Payments

### TC-PAY-001 — Payment Page Loads Correctly

| | |
|---|---|
| **Preconditions** | Navigated from Checkout Step 2 (order just created). |
| **Steps** | 1. Observe `/payment/:orderId`. |
| **Expected Result** | CheckoutStepper shows Step 3 (Payment) as active. Order summary on left (items + total). Stripe card input on right. |
| **Status** | |
| **Notes** | |

---

### TC-PAY-002 — Successful Stripe Payment

| | |
|---|---|
| **Preconditions** | On payment page with valid order. Stripe test mode enabled. |
| **Steps** | 1. Enter Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC. <br>2. Click "Pay Now" / "Complete Payment". |
| **Expected Result** | Payment processing spinner shown. On success → redirected to `/order-confirmed/:orderId`. |
| **Status** | |
| **Notes** | |

---

### TC-PAY-003 — Order Confirmed Page

| | |
|---|---|
| **Preconditions** | Payment just completed (TC-PAY-002). |
| **Steps** | 1. Observe the `/order-confirmed/:orderId` page. |
| **Expected Result** | Animated checkmark shown. Order ID displayed (last 8 chars). Items list with totals. "View My Orders" and "Continue Shopping" buttons present and functional. |
| **Status** | |
| **Notes** | |

---

### TC-PAY-004 — Payment with Declined Card

| | |
|---|---|
| **Preconditions** | On payment page. |
| **Steps** | 1. Enter Stripe declined test card: `4000 0000 0000 0002`. <br>2. Click Pay. |
| **Expected Result** | Error message shown: card declined. User stays on payment page. No order confirmed. |
| **Status** | |
| **Notes** | |

---

### TC-PAY-005 — Payment with Insufficient Funds Card

| | |
|---|---|
| **Preconditions** | On payment page. |
| **Steps** | 1. Enter Stripe insufficient funds test card: `4000 0000 0000 9995`. <br>2. Click Pay. |
| **Expected Result** | Error message: insufficient funds. User stays on payment page. |
| **Status** | |
| **Notes** | |

---

### TC-PAY-006 — Order Confirmed Page on Direct Refresh

| | |
|---|---|
| **Preconditions** | User is on `/order-confirmed/:orderId` after payment. |
| **Steps** | 1. Refresh the page (F5). |
| **Expected Result** | Page still shows order details (fetches from API as fallback). No crash or blank state. |
| **Status** | |
| **Notes** | |

---

## 7. Orders

### TC-ORD-001 — View My Orders

| | |
|---|---|
| **Preconditions** | Logged in as customer with at least one completed order. |
| **Steps** | 1. Navigate to `/my-orders` or via profile menu. |
| **Expected Result** | List of past orders shown with: order ID, date, total, status, items summary. |
| **Status** | |
| **Notes** | |

---

### TC-ORD-002 — View Order Detail

| | |
|---|---|
| **Preconditions** | On My Orders page with orders listed. |
| **Steps** | 1. Click on an order to view its detail. |
| **Expected Result** | Order detail shows: items, quantities, prices, shipping address, payment status, order status. |
| **Status** | |
| **Notes** | |

---

### TC-ORD-003 — Cancel a Pending Order

| | |
|---|---|
| **Preconditions** | Logged in as customer. An order exists with status "pending". |
| **Steps** | 1. Find the pending order in My Orders. <br>2. Click "Cancel Order". <br>3. Confirm cancellation. |
| **Expected Result** | Order status changes to "cancelled". Cancel button disappears or is disabled. |
| **Status** | |
| **Notes** | |

---

### TC-ORD-004 — Cannot Cancel a Shipped/Delivered Order

| | |
|---|---|
| **Preconditions** | An order exists with status "shipped" or "delivered". |
| **Steps** | 1. Navigate to that order. |
| **Expected Result** | Cancel button is not shown or is disabled for shipped/delivered orders. |
| **Status** | |
| **Notes** | |

---

### TC-ORD-005 — My Orders — Empty State

| | |
|---|---|
| **Preconditions** | Logged in as a new customer with no orders. |
| **Steps** | 1. Navigate to My Orders. |
| **Expected Result** | Empty state shown (e.g., "No orders yet"). Link to Pet Shop. |
| **Status** | |
| **Notes** | |

---

## 8. Appointments

### TC-APT-001 — Appointment Page Loads (Unauthenticated)

| | |
|---|---|
| **Preconditions** | User NOT logged in. |
| **Steps** | 1. Navigate to `/appointments`. |
| **Expected Result** | Page loads. Tabs visible: Veterinarians, Groomers, Trainers, Pet Taxi. Dashboard tab shows login prompt. |
| **Status** | |
| **Notes** | |

---

### TC-APT-002 — Browse Veterinarians Tab

| | |
|---|---|
| **Preconditions** | On appointments page. |
| **Steps** | 1. Click "Veterinarians" tab. |
| **Expected Result** | List of veterinarian professionals loads with cards (name, specialty, availability). |
| **Status** | |
| **Notes** | |

---

### TC-APT-003 — Browse by Role via URL

| | |
|---|---|
| **Preconditions** | None. |
| **Steps** | 1. Navigate to `/appointments?tab=groomers`. |
| **Expected Result** | Groomers tab is active and showing correct professionals. URL param is respected. |
| **Status** | |
| **Notes** | |

---

### TC-APT-004 — Book an Appointment

| | |
|---|---|
| **Preconditions** | Logged in as customer. A professional with availability exists. |
| **Steps** | 1. Select a professional from the list. <br>2. Select an available date/time slot. <br>3. Select a pet (or add one). <br>4. Add description. <br>5. Confirm booking. |
| **Expected Result** | Appointment created. Confirmation shown. Appointment appears in My Appointments. |
| **Status** | |
| **Notes** | |

---

### TC-APT-005 — View My Appointments (Dashboard Tab)

| | |
|---|---|
| **Preconditions** | Logged in as customer with at least one appointment. |
| **Steps** | 1. On appointments page, click "Dashboard" tab. |
| **Expected Result** | List of user's appointments with status (PENDING/CONFIRMED/etc.), professional name, date/time. |
| **Status** | |
| **Notes** | |

---

### TC-APT-006 — Cancel an Appointment

| | |
|---|---|
| **Preconditions** | Logged in as customer. PENDING appointment exists. |
| **Steps** | 1. Find a pending appointment in the dashboard. <br>2. Click Cancel. <br>3. Confirm. |
| **Expected Result** | Appointment status changes to CANCELLED. |
| **Status** | |
| **Notes** | |

---

### TC-APT-007 — Professional Views Their Appointments

| | |
|---|---|
| **Preconditions** | Logged in as a veterinarian or groomer account. Appointments exist for this professional. |
| **Steps** | 1. Navigate to the professional appointments section. |
| **Expected Result** | Professional can see appointments booked with them. |
| **Status** | |
| **Notes** | |

---

### TC-APT-008 — Professional Confirms an Appointment

| | |
|---|---|
| **Preconditions** | Logged in as professional. A PENDING appointment exists. |
| **Steps** | 1. Find a PENDING appointment. <br>2. Change status to CONFIRMED. |
| **Expected Result** | Appointment status updates to CONFIRMED. |
| **Status** | |
| **Notes** | |

---

### TC-APT-009 — Book Appointment Without Login

| | |
|---|---|
| **Preconditions** | User NOT logged in. |
| **Steps** | 1. On appointments page, try to book an appointment. |
| **Expected Result** | Login prompt shown. Booking not created. |
| **Status** | |
| **Notes** | |

---

## 9. User Profile

### TC-USR-001 — View Profile Page

| | |
|---|---|
| **Preconditions** | Logged in as any user. |
| **Steps** | 1. Navigate to `/profile`. |
| **Expected Result** | Profile page loads with current name, email, phone, address. Tabs for Pets, Password, Delete Account. |
| **Status** | |
| **Notes** | |

---

### TC-USR-002 — Update Profile Info

| | |
|---|---|
| **Preconditions** | On profile page. |
| **Steps** | 1. Edit the Name field. <br>2. Edit Address. <br>3. Save changes. |
| **Expected Result** | Success message. Updated info persists on refresh. |
| **Status** | |
| **Notes** | |

---

### TC-USR-003 — Change Password

| | |
|---|---|
| **Preconditions** | On profile page, Password tab. |
| **Steps** | 1. Enter current password. <br>2. Enter new password (meeting requirements). <br>3. Confirm new password. <br>4. Submit. |
| **Expected Result** | Success message. Can log in with new password. Old password rejected. |
| **Status** | |
| **Notes** | |

---

### TC-USR-004 — Change Password — Wrong Current Password

| | |
|---|---|
| **Preconditions** | On profile page, Password tab. |
| **Steps** | 1. Enter an incorrect current password. <br>2. Submit. |
| **Expected Result** | Error: incorrect current password. Password not changed. |
| **Status** | |
| **Notes** | |

---

### TC-USR-005 — Add a Pet

| | |
|---|---|
| **Preconditions** | On profile page, Pets tab. |
| **Steps** | 1. Click "Add Pet". <br>2. Fill in: name, breed, age, type, gender, color, description. <br>3. Save. |
| **Expected Result** | New pet appears in the pets list. |
| **Status** | |
| **Notes** | |

---

### TC-USR-006 — Edit a Pet

| | |
|---|---|
| **Preconditions** | At least one pet exists. On Pets tab. |
| **Steps** | 1. Click Edit on an existing pet. <br>2. Change the name. <br>3. Save. |
| **Expected Result** | Pet name updates in the list. |
| **Status** | |
| **Notes** | |

---

### TC-USR-007 — Delete a Pet

| | |
|---|---|
| **Preconditions** | At least one pet exists. On Pets tab. |
| **Steps** | 1. Click Delete on a pet. <br>2. Confirm deletion. |
| **Expected Result** | Pet removed from the list. |
| **Status** | |
| **Notes** | |

---

### TC-USR-008 — Delete Account

| | |
|---|---|
| **Preconditions** | On profile page, Delete Account section. |
| **Steps** | 1. Click "Delete Account". <br>2. Confirm the action (password or confirmation prompt). |
| **Expected Result** | Account deleted. User logged out. Attempting to log in with old credentials fails. |
| **Status** | |
| **Notes** | |

---

### TC-USR-009 — Profile Page Requires Auth

| | |
|---|---|
| **Preconditions** | User NOT logged in. |
| **Steps** | 1. Navigate directly to `/profile`. |
| **Expected Result** | Redirected to home/login. Profile page not shown. |
| **Status** | |
| **Notes** | |

---

## 10. Professionals

### TC-PRO-001 — List All Professionals

| | |
|---|---|
| **Preconditions** | None. |
| **Steps** | 1. Fetch or browse professionals list (e.g., via appointments page tabs). |
| **Expected Result** | Professional cards render with name, role, and availability info. |
| **Status** | |
| **Notes** | |

---

### TC-PRO-002 — Filter Professionals by Role

| | |
|---|---|
| **Preconditions** | On professionals list. |
| **Steps** | 1. Filter/tab to "Groomers". <br>2. Then "Trainers". |
| **Expected Result** | Only professionals of the selected role are shown. |
| **Status** | |
| **Notes** | |

---

### TC-PRO-003 — View Individual Professional

| | |
|---|---|
| **Preconditions** | None. |
| **Steps** | 1. Click on a professional card. |
| **Expected Result** | Professional profile shown with availability calendar/slots. |
| **Status** | |
| **Notes** | |

---

### TC-PRO-004 — Professional Updates Own Profile

| | |
|---|---|
| **Preconditions** | Logged in as a veterinarian/groomer/trainer. |
| **Steps** | 1. Navigate to professional profile settings. <br>2. Update specialization or bio. <br>3. Save. |
| **Expected Result** | Profile updates successfully. |
| **Status** | |
| **Notes** | |

---

### TC-PRO-005 — Professional Updates Availability

| | |
|---|---|
| **Preconditions** | Logged in as a veterinarian/groomer/trainer. |
| **Steps** | 1. Navigate to availability settings. <br>2. Toggle a day or set working hours. <br>3. Save. |
| **Expected Result** | Availability saved. Reflected when booking through appointments page. |
| **Status** | |
| **Notes** | |

---

## 11. Admin — Dashboard

### TC-ADM-001 — Dashboard Loads

| | |
|---|---|
| **Preconditions** | Logged in as admin. |
| **Steps** | 1. Navigate to `/admin`. |
| **Expected Result** | Dashboard renders with stat cards: total sales, orders, products, appointments. No console errors. |
| **Status** | |
| **Notes** | |

---

### TC-ADM-002 — Dashboard Stats Accuracy

| | |
|---|---|
| **Preconditions** | Known data in the system (e.g., 5 products, 3 orders). |
| **Steps** | 1. View dashboard stats. |
| **Expected Result** | Numbers shown match actual counts in the system. |
| **Status** | |
| **Notes** | |

---

### TC-ADM-003 — Admin Sidebar Navigation

| | |
|---|---|
| **Preconditions** | On any admin page. |
| **Steps** | 1. Click each sidebar item: Dashboard, Products, Users, Orders, Appointments, Analytics, Inventory, Invoices, Transactions, Settings. |
| **Expected Result** | Each click navigates to the correct admin page. Active item highlighted in sidebar. |
| **Status** | |
| **Notes** | |

---

### TC-ADM-004 — Collapsible Sidebar

| | |
|---|---|
| **Preconditions** | On any admin page. |
| **Steps** | 1. Click the sidebar collapse toggle. <br>2. Click again to expand. |
| **Expected Result** | Sidebar collapses to icon-only mode. Content area expands. Expanding restores full sidebar. |
| **Status** | |
| **Notes** | |

---

## 12. Admin — Products

### TC-ADP-001 — Products List

| | |
|---|---|
| **Preconditions** | Logged in as admin. |
| **Steps** | 1. Navigate to `/admin/products`. |
| **Expected Result** | DataTable shows all products with columns: name, category, price, quantity, status, actions. |
| **Status** | |
| **Notes** | |

---

### TC-ADP-002 — Create New Product

| | |
|---|---|
| **Preconditions** | On Admin Products page. |
| **Steps** | 1. Click "Add Product". <br>2. Fill in: name, description, price, quantity, categories. <br>3. Upload at least one image. <br>4. Save. |
| **Expected Result** | Product appears in the list. Visible on the Pet Shop page. |
| **Status** | |
| **Notes** | |

---

### TC-ADP-003 — Create Product — Missing Required Fields

| | |
|---|---|
| **Preconditions** | On product create form. |
| **Steps** | 1. Submit the form with required fields blank (e.g., no name or price). |
| **Expected Result** | Validation errors shown. Product not created. |
| **Status** | |
| **Notes** | |

---

### TC-ADP-004 — Edit a Product

| | |
|---|---|
| **Preconditions** | At least one product exists in admin. |
| **Steps** | 1. Click Edit on a product. <br>2. Change the price. <br>3. Save. |
| **Expected Result** | Updated price appears in the list and on the product page. |
| **Status** | |
| **Notes** | |

---

### TC-ADP-005 — Delete a Product

| | |
|---|---|
| **Preconditions** | At least one product exists. |
| **Steps** | 1. Click Delete on a product. <br>2. Confirm deletion. |
| **Expected Result** | Product removed from the list and from Pet Shop. |
| **Status** | |
| **Notes** | |

---

### TC-ADP-006 — Upload Product Image

| | |
|---|---|
| **Preconditions** | On product create/edit form. |
| **Steps** | 1. Click image upload. <br>2. Select an image file (JPG/PNG). <br>3. Save product. |
| **Expected Result** | Image uploads to Cloudinary. Product card shows the uploaded image. |
| **Status** | |
| **Notes** | |

---

### TC-ADP-007 — Toggle Product Active/Inactive

| | |
|---|---|
| **Preconditions** | A product exists. |
| **Steps** | 1. Edit a product. <br>2. Toggle the "isActive" field off. <br>3. Save. |
| **Expected Result** | Product no longer appears on the public Pet Shop page. Still visible in admin. |
| **Status** | |
| **Notes** | |

---

## 13. Admin — Users

### TC-ADU-001 — Users List

| | |
|---|---|
| **Preconditions** | Logged in as admin. |
| **Steps** | 1. Navigate to `/admin/users`. |
| **Expected Result** | Table shows all users: name, email, role, status (active/inactive), join date, actions. |
| **Status** | |
| **Notes** | |

---

### TC-ADU-002 — Change User Role

| | |
|---|---|
| **Preconditions** | On Admin Users page. A customer account exists. |
| **Steps** | 1. Find a customer user. <br>2. Change their role to "veterinarian". <br>3. Save/confirm. |
| **Expected Result** | User's role updates in the table. That user now has professional privileges. |
| **Status** | |
| **Notes** | |

---

### TC-ADU-003 — Toggle User Status (Active/Inactive)

| | |
|---|---|
| **Preconditions** | On Admin Users page. |
| **Steps** | 1. Find an active user. <br>2. Toggle their status to inactive. |
| **Expected Result** | User status changes. The deactivated user cannot log in (gets 401 from backend `isActive` check). |
| **Status** | |
| **Notes** | |

---

### TC-ADU-004 — Delete a User

| | |
|---|---|
| **Preconditions** | A non-admin user exists. |
| **Steps** | 1. Find the user in the list. <br>2. Click Delete. <br>3. Confirm. |
| **Expected Result** | User removed from the list. That user cannot log in anymore. |
| **Status** | |
| **Notes** | |

---

### TC-ADU-005 — Admin Cannot Delete Themselves

| | |
|---|---|
| **Preconditions** | Logged in as admin. |
| **Steps** | 1. Find your own account in the users list. <br>2. Check if Delete is available. |
| **Expected Result** | Delete is either hidden for own account, or shows an error if attempted. |
| **Status** | |
| **Notes** | |

---

## 14. Admin — Orders

### TC-ADO-001 — All Orders List

| | |
|---|---|
| **Preconditions** | Logged in as admin. At least one order exists. |
| **Steps** | 1. Navigate to `/admin/orders`. |
| **Expected Result** | All customer orders listed with: order ID, customer, date, total, status, payment status. |
| **Status** | |
| **Notes** | |

---

### TC-ADO-002 — Update Order Status

| | |
|---|---|
| **Preconditions** | A "pending" or "processing" order exists. |
| **Steps** | 1. Find the order. <br>2. Change status from "pending" to "processing". <br>3. Save. |
| **Expected Result** | Order status updates. Customer sees updated status in My Orders. |
| **Status** | |
| **Notes** | |

---

### TC-ADO-003 — Update Order Payment Status

| | |
|---|---|
| **Preconditions** | An order with "pending" payment status exists. |
| **Steps** | 1. Find the order. <br>2. Update payment status to "completed". |
| **Expected Result** | Payment status updates in the admin list. |
| **Status** | |
| **Notes** | |

---

### TC-ADO-004 — Search/Filter Orders

| | |
|---|---|
| **Preconditions** | Multiple orders exist. |
| **Steps** | 1. Filter orders by status "shipped". |
| **Expected Result** | Only shipped orders displayed. |
| **Status** | |
| **Notes** | |

---

## 15. Admin — Appointments

### TC-ADA-001 — All Appointments List

| | |
|---|---|
| **Preconditions** | Logged in as admin. Appointments exist. |
| **Steps** | 1. Navigate to `/admin/appointments`. |
| **Expected Result** | All appointments listed: customer, professional, type, date/time, status. |
| **Status** | |
| **Notes** | |

---

### TC-ADA-002 — Filter Appointments by Status

| | |
|---|---|
| **Preconditions** | Appointments with various statuses exist. |
| **Steps** | 1. Filter by status "PENDING". |
| **Expected Result** | Only PENDING appointments shown. |
| **Status** | |
| **Notes** | |

---

## 16. Admin — Inventory

### TC-INV-001 — Inventory Page Loads

| | |
|---|---|
| **Preconditions** | Logged in as admin. Products exist. |
| **Steps** | 1. Navigate to `/admin/inventory`. |
| **Expected Result** | Stats shown: Total SKUs, Low Stock count, Out of Stock, Total Inventory Value. Product table renders with columns: name, category, quantity, stock status badge, active status. |
| **Status** | |
| **Notes** | |

---

### TC-INV-002 — Filter by Stock Status

| | |
|---|---|
| **Preconditions** | On Inventory page. Products with varied stock levels exist. |
| **Steps** | 1. Filter by "Low Stock". <br>2. Then filter by "Out of Stock". <br>3. Then "In Stock". |
| **Expected Result** | Each filter shows only products matching that stock status. |
| **Status** | |
| **Notes** | |

---

### TC-INV-003 — Search Inventory

| | |
|---|---|
| **Preconditions** | On Inventory page. |
| **Steps** | 1. Type a product name in the search input. |
| **Expected Result** | Table filters to matching products. |
| **Status** | |
| **Notes** | |

---

### TC-INV-004 — Restock a Product

| | |
|---|---|
| **Preconditions** | On Inventory page. A product with low/zero stock exists. |
| **Steps** | 1. Click Restock on a product. <br>2. Enter units to add (e.g., 50). <br>3. Add an optional note. <br>4. Confirm. |
| **Expected Result** | Quantity increases by entered amount. Stock status badge updates. Toast confirmation shown. |
| **Status** | |
| **Notes** | |

---

### TC-INV-005 — Adjust Stock

| | |
|---|---|
| **Preconditions** | On Inventory page. |
| **Steps** | 1. Click Adjust on a product. <br>2. Enter a new exact quantity (e.g., 25). <br>3. Enter a mandatory reason note. <br>4. Confirm. |
| **Expected Result** | Quantity set to the entered value (not added — replaced). Movement record created. |
| **Status** | |
| **Notes** | |

---

### TC-INV-006 — Adjust Stock — Missing Note

| | |
|---|---|
| **Preconditions** | Adjust modal is open. |
| **Steps** | 1. Enter a new quantity. <br>2. Leave the note field empty. <br>3. Submit. |
| **Expected Result** | Validation error: note is required for adjustments. Stock not changed. |
| **Status** | |
| **Notes** | |

---

### TC-INV-007 — View Movement History

| | |
|---|---|
| **Preconditions** | A product with past stock movements (orders/restock/adjustments). |
| **Steps** | 1. Click the movement history action on a product. <br>2. A drawer/panel opens. |
| **Expected Result** | Drawer shows a list of movements: type (order/restock/adjustment), delta (+/-), prevQty, newQty, who made the change, timestamp. |
| **Status** | |
| **Notes** | |

---

### TC-INV-008 — Change Low Stock Threshold

| | |
|---|---|
| **Preconditions** | On Inventory page. |
| **Steps** | 1. Change the threshold input from 10 to 20. <br>2. Apply/refresh. |
| **Expected Result** | Products with quantity ≤ 20 now show "low stock" status. |
| **Status** | |
| **Notes** | |

---

### TC-INV-009 — Inventory Reflects Order Deductions

| | |
|---|---|
| **Preconditions** | A product with known stock level (e.g., 10 units). |
| **Steps** | 1. Customer places an order for 2 units of that product (complete checkout). <br>2. Admin checks inventory for that product. |
| **Expected Result** | Quantity reduced by 2. Movement history shows an "order" type entry. |
| **Status** | |
| **Notes** | |

---

## 17. Admin — Invoices

### TC-AIN-001 — Invoices Page Loads

| | |
|---|---|
| **Preconditions** | Logged in as admin. At least one completed order exists. |
| **Steps** | 1. Navigate to `/admin/invoices`. |
| **Expected Result** | Stats shown: Total Issued, Total Revenue, Total Refunded. Invoice table renders. |
| **Status** | |
| **Notes** | |

---

### TC-AIN-002 — Generate Invoice from Order

| | |
|---|---|
| **Preconditions** | A paid order exists without an invoice. |
| **Steps** | 1. From admin orders or invoice page, trigger "Generate Invoice" for the paid order. |
| **Expected Result** | Invoice created with format INV-YYYY-NNNN. Appears in the invoices list. |
| **Status** | |
| **Notes** | |

---

### TC-AIN-003 — Generate Invoice — Idempotency

| | |
|---|---|
| **Preconditions** | An invoice already exists for an order. |
| **Steps** | 1. Try to generate an invoice for the same order again. |
| **Expected Result** | Returns the existing invoice instead of creating a duplicate. |
| **Status** | |
| **Notes** | |

---

### TC-AIN-004 — View Invoice Detail

| | |
|---|---|
| **Preconditions** | At least one invoice exists. |
| **Steps** | 1. Click the view/detail action on an invoice. |
| **Expected Result** | Drawer/modal shows: invoice number, customer name/email, shipping address, line items with prices, subtotal, discount, total, payment method, transaction ID. |
| **Status** | |
| **Notes** | |

---

### TC-AIN-005 — Download Invoice as PDF

| | |
|---|---|
| **Preconditions** | An invoice exists. |
| **Steps** | 1. Click "Download PDF" on an invoice. |
| **Expected Result** | PDF file downloads in the browser. Contains VitalPaws branding, invoice number, line items, and totals. |
| **Status** | |
| **Notes** | |

---

### TC-AIN-006 — Search Invoices

| | |
|---|---|
| **Preconditions** | Multiple invoices exist. |
| **Steps** | 1. Search by invoice number (e.g., "INV-2026"). |
| **Expected Result** | Table filters to matching invoices. |
| **Status** | |
| **Notes** | |

---

### TC-AIN-007 — Filter Invoices by Status

| | |
|---|---|
| **Preconditions** | Invoices with both "issued" and "refunded" statuses exist. |
| **Steps** | 1. Filter by "Refunded". |
| **Expected Result** | Only refunded invoices shown. |
| **Status** | |
| **Notes** | |

---

### TC-AIN-008 — Customer Views Own Invoice

| | |
|---|---|
| **Preconditions** | Logged in as customer. An invoice exists for their order. |
| **Steps** | 1. Navigate to the customer invoice endpoint (via My Orders → Invoice link). |
| **Expected Result** | Customer can view their own invoice. Cannot access another customer's invoice (403 response). |
| **Status** | |
| **Notes** | |

---

## 18. Admin — Transactions

### TC-ATR-001 — Transactions Page Loads

| | |
|---|---|
| **Preconditions** | Logged in as admin. At least one completed payment exists. |
| **Steps** | 1. Navigate to `/admin/transactions`. |
| **Expected Result** | Stats shown: Total Revenue, Total Refunds, Net Revenue. Transaction table renders with: date, customer, type, amount, payment method, invoice link, transaction ID. |
| **Status** | |
| **Notes** | |

---

### TC-ATR-002 — Filter by Type (Payment / Refund)

| | |
|---|---|
| **Preconditions** | Both payment and refund transactions exist. |
| **Steps** | 1. Filter by "Refund". |
| **Expected Result** | Only refund transactions shown. Amounts styled differently (e.g., red / negative). |
| **Status** | |
| **Notes** | |

---

### TC-ATR-003 — Filter by Payment Method

| | |
|---|---|
| **Preconditions** | Transactions via different payment methods exist. |
| **Steps** | 1. Filter by "Stripe". <br>2. Then filter by "PayPal". |
| **Expected Result** | Each filter shows only transactions made through that method. |
| **Status** | |
| **Notes** | |

---

### TC-ATR-004 — Transaction Links to Invoice

| | |
|---|---|
| **Preconditions** | A transaction with a linked invoice exists. |
| **Steps** | 1. Find a transaction row with an invoice reference. <br>2. Click the invoice link. |
| **Expected Result** | Navigates to or shows the corresponding invoice detail. |
| **Status** | |
| **Notes** | |

---

### TC-ATR-005 — Net Revenue Calculation

| | |
|---|---|
| **Preconditions** | Both payment and refund transactions exist with known amounts. |
| **Steps** | 1. Note the Total Revenue and Total Refunds stats. |
| **Expected Result** | Net Revenue = Total Revenue − Total Refunds. Math is correct. |
| **Status** | |
| **Notes** | |

---

## 19. Admin — Analytics

### TC-ANL-001 — Analytics Page Loads

| | |
|---|---|
| **Preconditions** | Logged in as admin. |
| **Steps** | 1. Navigate to `/admin/analytics`. |
| **Expected Result** | Page renders with chart sections: Sales, Products, Users, Appointments. No console errors. |
| **Status** | |
| **Notes** | |

---

### TC-ANL-002 — Sales Chart Renders

| | |
|---|---|
| **Preconditions** | Sales data exists. |
| **Steps** | 1. View the sales analytics chart. |
| **Expected Result** | Chart displays with data points. Axes labelled. No empty/broken chart. |
| **Status** | |
| **Notes** | |

---

### TC-ANL-003 — Products Analytics

| | |
|---|---|
| **Preconditions** | Products and orders exist. |
| **Steps** | 1. View product analytics section. |
| **Expected Result** | Shows top products, category breakdown or similar metrics. |
| **Status** | |
| **Notes** | |

---

### TC-ANL-004 — User Analytics

| | |
|---|---|
| **Preconditions** | Multiple users registered over time. |
| **Steps** | 1. View user analytics section. |
| **Expected Result** | User growth data shown (total users, new registrations). |
| **Status** | |
| **Notes** | |

---

### TC-ANL-005 — Appointment Analytics

| | |
|---|---|
| **Preconditions** | Appointments exist. |
| **Steps** | 1. View appointments analytics. |
| **Expected Result** | Appointment counts by type or status shown. |
| **Status** | |
| **Notes** | |

---

## 20. Role-Based Access Control

### TC-RBA-001 — Customer Cannot Access Admin Pages

| | |
|---|---|
| **Preconditions** | Logged in as customer. |
| **Steps** | 1. Navigate directly to `/admin`. |
| **Expected Result** | Redirected away (to home or 403 page). Admin dashboard NOT shown. |
| **Status** | |
| **Notes** | |

---

### TC-RBA-002 — Unauthenticated User Cannot Access Protected Pages

| | |
|---|---|
| **Preconditions** | NOT logged in. |
| **Steps** | 1. Navigate to each protected route: `/profile`, `/checkout`, `/payment/123`, `/order-confirmed/123`, `/my-orders`. |
| **Expected Result** | Each route redirects to home or login. Content not displayed. |
| **Status** | |
| **Notes** | |

---

### TC-RBA-003 — Professional Cannot Access Admin Pages

| | |
|---|---|
| **Preconditions** | Logged in as veterinarian. |
| **Steps** | 1. Navigate to `/admin`. |
| **Expected Result** | Redirected. Admin panel not accessible. |
| **Status** | |
| **Notes** | |

---

### TC-RBA-004 — Customer Cannot Update Professional Availability

| | |
|---|---|
| **Preconditions** | Logged in as customer. |
| **Steps** | 1. Attempt a PATCH to `/professionals/:id/availability` (via DevTools or direct API call). |
| **Expected Result** | 403 Forbidden response. |
| **Status** | |
| **Notes** | |

---

### TC-RBA-005 — Admin Can Access All Admin Endpoints

| | |
|---|---|
| **Preconditions** | Logged in as admin. |
| **Steps** | 1. Navigate through all admin sidebar pages: Dashboard, Products, Users, Orders, Appointments, Inventory, Invoices, Transactions, Analytics, Settings. |
| **Expected Result** | All pages load without 401 or 403 errors. |
| **Status** | |
| **Notes** | |

---

### TC-RBA-006 — PetTaxi Cannot Book as Service Provider

| | |
|---|---|
| **Preconditions** | Logged in as petTaxi role user. |
| **Steps** | 1. Attempt to access `GET /appointments/professional-appointments`. |
| **Expected Result** | 403 Forbidden — petTaxi is excluded from isServiceProvider middleware. |
| **Status** | |
| **Notes** | |

---

### TC-RBA-007 — Inactive User Cannot Login

| | |
|---|---|
| **Preconditions** | Admin has set a user's status to inactive. |
| **Steps** | 1. Attempt to log in as the deactivated user. |
| **Expected Result** | Login fails with an appropriate error (account deactivated). |
| **Status** | |
| **Notes** | |

---

### TC-RBA-008 — Customer Cannot View Another Customer's Invoice

| | |
|---|---|
| **Preconditions** | Two customer accounts (A and B), each with an invoice. |
| **Steps** | 1. Log in as Customer A. <br>2. Attempt to access Customer B's invoice URL directly. |
| **Expected Result** | 403 Forbidden. Invoice not displayed. |
| **Status** | |
| **Notes** | |

---

*End of Manual Test Cases — VitalPaws v1.0*
