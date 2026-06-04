# Checkout Flow – Design Spec
**Date:** 2026-06-03  
**Status:** Approved

---

## Scope

Full visual and UX overhaul of the 4-page checkout + order-confirmation flow:

1. `/checkout` — CartCheckoutPage (step 1: cart review, step 2: shipping)
2. `/payment/:orderId` — PaymentPage (Stripe card entry)
3. `/order-confirmed/:orderId` — NEW OrderConfirmedPage
4. `/my-orders` — MyOrdersPage (receives cartoon treatment only)

---

## Global Constraints

- **Every screen: `min-height: 100vh`** — no short pages, always fills the viewport
- **Cartoon theme** — bold borders (`var(--cborder)`), offset shadows (`var(--cshadow)`), spring physics (Framer Motion `type:"spring"`) on all interactive elements
- **Fluid step transitions** — AnimatePresence `mode="wait"` between steps; slide left/right matching direction of travel
- **Progress feedback everywhere** — loading spinners, disabled buttons, skeleton states; never a blank flash

---

## 1. Visual Progress Stepper (replaces text strip)

### Visual design
Three icon-nodes connected by a progress line:

```
 [🛒]─────────[📦]─────────[💳]
  Cart       Shipping     Payment
```

- Node: 44px circle, bold `var(--cborder)` border
- **Done**: forest-green fill, white ✓ inside, gold shadow
- **Active**: white fill, forest-green icon, cartoon shadow
- **Upcoming**: light grey fill, grey icon
- Connector line: 2px; left half fills gold when moving right
- Spring animation on node state transition (scale pop when it completes)

### Implementation
New component: `src/Components/HelperComponents/CheckoutStepper/CheckoutStepper.jsx`  
Props: `currentStep: 1|2|3`

---

## 2. CartCheckoutPage – Overhaul

### Layout
- `min-height: 100vh`, centered, `max-width: 1280px`
- Sticky `<CheckoutStepper>` below navbar
- Steps 1 & 2: two-column grid (items left, summary right sticky); stacks at ≤900px

### Step 1 — Cart Review
- `AnimatePresence` around each `CartItem` list entry → items slide+fade out on remove
- CartItem quantity +/− buttons: spring `scale: 0.85` on tap
- "Empty cart" CTA state: cartoon styled with paw/bone SVG decoration
- "Proceed to Checkout" button: spring hover lift + cartoon shadow

### Step 2 — Shipping
- Step transition: `x: 40 → 0` enter, `x: -40 → exit` for back
- All inputs: cartoon border on focus (gold glow), bold labels
- Inline validation: red border + error message on empty required fields before submit
- Submit button shows spinner + "Creating order…" text while `handlePlaceOrder` runs
- Pass `{ items, subtotal, shipping, total }` in `navigate()` location state for PaymentPage

### Step transitions (direction-aware)
```js
const variants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};
```

---

## 3. PaymentPage – Add Order Summary Panel

### Layout
Two-column card: **left = frozen order summary**, **right = Stripe form**  
Single column on mobile (summary on top, form below).

### Left panel – Order Summary
Populated from `location.state` (passed by CartCheckoutPage).  
Fallback: fetch `ordersApi.getOrderById(orderId)` if state is absent.

Shows:
- Each item: name × qty, line total
- Subtotal / Shipping / **Total** (bold, larger)
- "🔒 Stripe secured" trust badge

### Right panel – Stripe form
- Same `CardElement` but wrapped in a cartoon card
- "Pay $X.XX" on the button (dynamic amount from state)
- Test hint only in development (`import.meta.env.DEV`)
- Loading state: entire panel dims + spinner overlay while `processing`

### 100vh
`payment-page` already flexes to center; ensure `min-height: 100vh` is set.

---

## 4. OrderConfirmedPage (new)

**Route:** `/order-confirmed/:orderId`  
**File:** `src/Pages/OrderConfirmed/OrderConfirmedPage.jsx`  
**Entry point:** PaymentPage navigates here instead of `/my-orders` on success.

### Layout
Full-page centered, `min-height: 100vh`, forest-green gradient background (same feel as PetShop hero dark overlay).

### Sections (stacked, animated in sequence)
1. **Animated checkmark** — big circle, spring scale-in, green fill with white ✓
2. **Headline** — "Order Confirmed! 🎉" in Bebas Neue, gold, large
3. **Subtext** — "We've received your order and will start preparing it right away."
4. **Order card** — white cartoon card showing:
   - Order # (last 8 chars of `_id`, uppercase)
   - Item list with images (from location.state or API fetch)
   - Total paid
5. **CTAs** — two buttons: "View My Orders" (primary) · "Continue Shopping" (outline)
6. **Floating decorations** — paw + sparkle SVGs, same as PetShop hero

### Data source
`location.state` from PaymentPage (orderId, items, total).  
If absent, call `ordersApi.getOrderById(orderId)`.

---

## 5. MyOrdersPage – Cartoon Treatment

- `min-height: 100vh`
- Order cards: `var(--cborder)` + `var(--cshadow)` via CartoonTheme (already covered)
- Status badge colours made more vibrant:
  - pending → sunny yellow
  - processing → sky blue  
  - shipped → teal
  - delivered → mint green
  - cancelled → coral red
- Cancel button: spring press-down on tap

---

## 6. CartItem Component

- Wrap list item in `motion.div` with `layout` prop for smooth reflow
- Remove: `AnimatePresence` → `x: -80, opacity: 0` exit
- Qty buttons: spring `scale: 0.82` on tap
- Item image: cartoon border + rounded
- Subtotal: bold, coral (`var(--cartoon-coral)`)

---

## Route Change

Add to `main.jsx` router:
```js
{ path: "order-confirmed/:orderId", element: <ProtectedRoute><OrderConfirmedPage /></ProtectedRoute> }
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `src/Components/HelperComponents/CheckoutStepper/CheckoutStepper.jsx` | Create |
| `src/Components/HelperComponents/CheckoutStepper/CheckoutStepper.css` | Create |
| `src/Components/HelperComponents/CartItem/CartItem.jsx` | Modify |
| `src/Components/HelperComponents/CartItem/CartItem.css` | Modify |
| `src/Pages/CartCheckoutPage/CartCheckOutPage.jsx` | Rewrite |
| `src/Pages/CartCheckoutPage/CartCheckOutPage.css` | Rewrite |
| `src/Pages/Payment/PaymentPage.jsx` | Rewrite |
| `src/Pages/Payment/PaymentPage.css` | Rewrite |
| `src/Pages/OrderConfirmed/OrderConfirmedPage.jsx` | Create |
| `src/Pages/OrderConfirmed/OrderConfirmedPage.css` | Create |
| `src/Pages/MyOrders/MyOrdersPage.css` | Modify |
| `src/main.jsx` | Add route |
