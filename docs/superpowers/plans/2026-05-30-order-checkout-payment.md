# Order, Checkout & Payment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the full customer purchase flow — backend-synced cart → multi-step checkout with shipping form → Stripe payment page → purchase history at `/my-orders`.

**Architecture:** The frontend currently uses `react-use-cart` (localStorage only) and `CartCheckOutPage.handleCheckout` does nothing but clear the cart and navigate home — no API call is ever made, so no orders land in the DB. Fix is in three layers: (1) sync `react-use-cart` to the backend Cart model on every mutation, (2) collect shipping address and call `POST /api/orders` at checkout, (3) redirect to a Stripe Elements payment page, then let customers view their history at `/my-orders`.

**Tech Stack:** React 18 + Vite, `@stripe/stripe-js` + `@stripe/react-stripe-js`, react-use-cart (kept for UI state), Express + Mongoose backend (Cart, Order, Payment controllers already exist).

---

## Pre-flight — Things to confirm before starting

- **Real Stripe keys required.** The backend `.env` currently has `STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key` (placeholder). Payment will fail at runtime until real keys are added. Get test keys from https://dashboard.stripe.com/test/apikeys.
  - Backend `.env` → `STRIPE_SECRET_KEY=sk_test_...` (real key)
  - Backend `.env` → `STRIPE_WEBHOOK_SECRET=whsec_...` (real key)
  - Frontend `.env` → add `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` (real key)

---

## Files Modified / Created

**Backend:**
- Modify: `backend/src/controllers/cart.controller.js` — fix param name bug (`productId` → `id`)

**Frontend — new:**
- Create: `frontend/src/Services/api/cartApi.js`
- Create: `frontend/src/Services/api/paymentsApi.js`
- Create: `frontend/src/Pages/Payment/PaymentPage.jsx`
- Create: `frontend/src/Pages/Payment/PaymentPage.css`
- Create: `frontend/src/Pages/MyOrders/MyOrdersPage.jsx`
- Create: `frontend/src/Pages/MyOrders/MyOrdersPage.css`

**Frontend — modified:**
- Modify: `frontend/src/context/CartContext.jsx` — add backend sync + export `useCart` hook
- Modify: `frontend/src/Components/NavigationBar/AddToCart.jsx` — update useCart import
- Modify: `frontend/src/Components/NavigationBar/CartModal.jsx` — update useCart import
- Modify: `frontend/src/Components/HelperComponents/ProductCard/ProductCard.jsx` — update useCart import
- Modify: `frontend/src/Components/HelperComponents/ProductCard/ProductCardV2.jsx` — update useCart import
- Modify: `frontend/src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx` — update useCart import
- Modify: `frontend/src/Pages/CartCheckoutPage/CartCheckOutPage.jsx` — multi-step checkout with shipping form
- Modify: `frontend/src/main.jsx` — add `/payment/:orderId` and `/my-orders` routes + protect `/checkout`

---

## Task 1: Install Stripe frontend package + add env var

**Files:**
- Modify: `frontend/.env`

- [ ] **Step 1: Install Stripe packages**

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Expected: packages added to `node_modules`, `package.json` updated.

- [ ] **Step 2: Add Stripe publishable key to frontend `.env`**

Open `frontend/.env` and add this line (replace with your real test key from Stripe dashboard):

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_REAL_KEY_HERE
```

> ⚠️ Also update `backend/.env` with your real `STRIPE_SECRET_KEY` before testing payment. Without real keys, the payment page will fail at the "initialize payment" step.

- [ ] **Step 3: Commit**

```bash
cd frontend
git add package.json package-lock.json .env
git commit -m "chore: install Stripe frontend packages + add publishable key env var"
```

---

## Task 2: Fix backend cart controller param name bug

The `updateCartItem` and `removeCartItem` controllers destructure `productId` from `req.params`, but the route registers the param as `:id`. This means both operations always get `undefined` and silently fail.

**Files:**
- Modify: `backend/src/controllers/cart.controller.js:73-113` and `116-139`

- [ ] **Step 1: Fix `updateCartItem` — line ~76**

In `backend/src/controllers/cart.controller.js`, find `updateCartItem`:

```js
// Before (broken)
const { productId } = req.params;

// After (fixed)
const { id: productId } = req.params;
```

- [ ] **Step 2: Fix `removeCartItem` — line ~119**

In the same file, find `removeCartItem`:

```js
// Before (broken)
const { productId } = req.params;

// After (fixed)
const { id: productId } = req.params;
```

- [ ] **Step 3: Verify — restart backend and test with Postman**

```
PATCH http://localhost:5000/api/cart/:someProductId
Authorization: Bearer <token>
Content-Type: application/json

{ "quantity": 3 }
```

Expected: `200 { success: true, data: { items: [...] } }` with updated quantity.

- [ ] **Step 4: Commit**

```bash
cd backend
git add src/controllers/cart.controller.js
git commit -m "fix(cart): use correct param name id instead of productId in update and remove"
```

---

## Task 3: Create `cartApi.js`

**Files:**
- Create: `frontend/src/Services/api/cartApi.js`

- [ ] **Step 1: Create the file**

```js
// frontend/src/Services/api/cartApi.js
import { api } from "../../core/api/apiClient";

const cartApi = {
  // Get the logged-in user's cart from backend
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data.data; // { items, totalItems, totalAmount, ... }
  },

  // Add a product to the backend cart
  // productId = MongoDB _id string, quantity = positive integer
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post("/cart", { productId, quantity });
    return response.data.data;
  },

  // Update quantity of an existing cart item
  updateItem: async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    return response.data.data;
  },

  // Remove a single item from the cart
  removeItem: async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data.data;
  },

  // Clear all items from the cart
  clearCart: async () => {
    const response = await api.delete("/cart/clear");
    return response.data.data;
  },
};

export default cartApi;
```

- [ ] **Step 2: Commit**

```bash
git add src/Services/api/cartApi.js
git commit -m "feat(api): add cartApi wrapper for backend cart endpoints"
```

---

## Task 4: Create `paymentsApi.js`

Payment routes are mounted at `/api/payments` (with an `s`) in `backend/src/app.js`.

**Files:**
- Create: `frontend/src/Services/api/paymentsApi.js`

- [ ] **Step 1: Create the file**

```js
// frontend/src/Services/api/paymentsApi.js
import { api } from "../../core/api/apiClient";

const paymentsApi = {
  // Initialize a Stripe PaymentIntent for an order.
  // Returns { clientSecret, paymentIntentId, orderId, paymentMethod }
  initializePayment: async (orderId, paymentMethod = "stripe") => {
    const response = await api.post(`/payments/orders/${orderId}/initialize`, {
      paymentMethod,
    });
    return response.data.data;
  },

  // Confirm payment after Stripe client-side confirmation.
  // paymentIntentId = the Stripe PaymentIntent id
  confirmPayment: async (orderId, paymentIntentId, paymentMethod = "stripe") => {
    const response = await api.post(`/payments/orders/${orderId}/confirm`, {
      paymentIntentId,
      paymentMethod,
    });
    return response.data.data;
  },
};

export default paymentsApi;
```

- [ ] **Step 2: Commit**

```bash
git add src/Services/api/paymentsApi.js
git commit -m "feat(api): add paymentsApi wrapper for Stripe initialize/confirm endpoints"
```

---

## Task 5: Rewrite `CartContext.jsx` with backend sync + export `useCart` hook

This is the core change. We keep `react-use-cart` for UI state but wrap every mutation to also call the backend when the user is authenticated. Components that previously imported `useCart` from `react-use-cart` will import it from `@/context/CartContext` instead (done in Task 6).

**Files:**
- Modify: `frontend/src/context/CartContext.jsx`

- [ ] **Step 1: Rewrite `CartContext.jsx`**

Replace the entire file:

```jsx
// frontend/src/context/CartContext.jsx
import { createContext, useContext, useEffect, useCallback } from "react";
import { CartProvider as RUCProvider, useCart as useRUCCart } from "react-use-cart";
import { useAuth } from "./AuthContext";
import cartApi from "../Services/api/cartApi";

const CartSyncCtx = createContext(null);

/**
 * Inner layer — has access to both useAuth and react-use-cart.
 * Intercepts every mutation to also sync with the backend cart.
 */
function CartSyncLayer({ children }) {
  const { user } = useAuth();
  const ruc = useRUCCart();

  // On login: fetch backend cart and populate local state.
  // On logout: clear local cart.
  useEffect(() => {
    if (!user) {
      ruc.emptyCart();
      return;
    }

    cartApi
      .getCart()
      .then((backendCart) => {
        if (!backendCart?.items?.length) return;
        const converted = backendCart.items.map((item) => ({
          id: item.product?._id || item.product,
          name: item.product?.name || "Product",
          price: item.price,
          image: item.product?.images?.[0] || "",
          quantity: item.quantity,
        }));
        ruc.setItems(converted);
      })
      .catch(() => {
        // Backend cart unavailable — local cart stays empty, user can re-add
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Optimistic add: update UI immediately, sync to backend in background
  const addItem = useCallback(
    async (item, quantity = 1) => {
      ruc.addItem(item, quantity);
      if (user) {
        try {
          await cartApi.addToCart(item.id, quantity);
        } catch {
          /* silent — UI already updated */
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id]
  );

  const removeItem = useCallback(
    async (id) => {
      ruc.removeItem(id);
      if (user) {
        try {
          await cartApi.removeItem(id);
        } catch {
          /* silent */
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id]
  );

  const updateItemQuantity = useCallback(
    async (id, quantity) => {
      if (quantity <= 0) {
        return removeItem(id);
      }
      ruc.updateItemQuantity(id, quantity);
      if (user) {
        try {
          await cartApi.updateItem(id, quantity);
        } catch {
          /* silent */
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, removeItem]
  );

  const emptyCart = useCallback(
    async () => {
      ruc.emptyCart();
      if (user) {
        try {
          await cartApi.clearCart();
        } catch {
          /* silent */
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id]
  );

  const value = {
    ...ruc,
    addItem,
    removeItem,
    updateItemQuantity,
    emptyCart,
  };

  return <CartSyncCtx.Provider value={value}>{children}</CartSyncCtx.Provider>;
}

/**
 * Drop-in replacement for react-use-cart's useCart hook.
 * Import this instead of importing from "react-use-cart".
 */
export function useCart() {
  const ctx = useContext(CartSyncCtx);
  if (!ctx) throw new Error("useCart must be used within CartContext");
  return ctx;
}

/**
 * Provider component — wraps react-use-cart's CartProvider + sync layer.
 * Used in main.jsx as <CartContext>...</CartContext>.
 */
function CartContext({ children }) {
  return (
    <RUCProvider>
      <CartSyncLayer>{children}</CartSyncLayer>
    </RUCProvider>
  );
}

export default CartContext;
```

- [ ] **Step 2: Commit**

```bash
git add src/context/CartContext.jsx
git commit -m "feat(cart): add backend sync layer to CartContext, export useCart hook"
```

---

## Task 6: Update `useCart` imports in 5 components

Every file that does `import { useCart } from "react-use-cart"` must switch to `@/context/CartContext`. No logic changes — just the import line.

**Files:**
- Modify: `frontend/src/Components/NavigationBar/AddToCart.jsx`
- Modify: `frontend/src/Components/NavigationBar/CartModal.jsx`
- Modify: `frontend/src/Components/HelperComponents/ProductCard/ProductCard.jsx`
- Modify: `frontend/src/Components/HelperComponents/ProductCard/ProductCardV2.jsx`
- Modify: `frontend/src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx`

- [ ] **Step 1: Update `AddToCart.jsx`**

```js
// Before
import { useCart } from "react-use-cart";

// After
import { useCart } from "@/context/CartContext";
```

- [ ] **Step 2: Update `CartModal.jsx`**

```js
// Before
import { useCart } from "react-use-cart";

// After
import { useCart } from "@/context/CartContext";
```

- [ ] **Step 3: Update `ProductCard.jsx`**

```js
// Before
import { useCart } from "react-use-cart";

// After
import { useCart } from "@/context/CartContext";
```

- [ ] **Step 4: Update `ProductCardV2.jsx`**

```js
// Before
import { useCart } from "react-use-cart";

// After
import { useCart } from "@/context/CartContext";
```

- [ ] **Step 5: Update `IndividualProductItemPage.jsx`**

```js
// Before
import { useCart } from "react-use-cart";

// After
import { useCart } from "@/context/CartContext";
```

- [ ] **Step 6: Commit**

```bash
git add src/Components/NavigationBar/AddToCart.jsx \
        src/Components/NavigationBar/CartModal.jsx \
        src/Components/HelperComponents/ProductCard/ProductCard.jsx \
        src/Components/HelperComponents/ProductCard/ProductCardV2.jsx \
        src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx
git commit -m "refactor(cart): switch all useCart imports to CartContext hook"
```

---

## Task 7: Rewrite `CartCheckOutPage.jsx` — multi-step checkout

The current page is a single cart review that calls nothing on checkout. Replace with a two-step flow: Step 1 = cart review with "Proceed to Checkout" button, Step 2 = shipping address form with "Place Order" that creates the order and redirects to `/payment/:orderId`.

**Files:**
- Modify: `frontend/src/Pages/CartCheckoutPage/CartCheckOutPage.jsx`

- [ ] **Step 1: Replace the entire component**

```jsx
// frontend/src/Pages/CartCheckoutPage/CartCheckOutPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaArrowRight, FaShoppingBag,
  FaTruck, FaShieldAlt, FaCheckCircle, FaSpinner,
} from "react-icons/fa";
import { CartItem } from "../../Components/HelperComponents/CartItem/CartItem";
import { useCart } from "@/context/CartContext";
import { useToast } from "../../context/ToastContext";
import ordersApi from "../../Services/api/ordersApi";
import "./CartCheckOutPage.css";

const SHIPPING_FEE = 20;

const EMPTY_ADDRESS = {
  street: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
};

const CartCheckoutPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { items, cartTotal, totalItems, updateItemQuantity, removeItem, emptyCart } = useCart();

  const [step, setStep] = useState(1); // 1 = cart review, 2 = shipping
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [placing, setPlacing] = useState(false);

  const handleQuantityChange = (id, newQty) => updateItemQuantity(id, newQty);

  const handleRemoveItem = (id) => {
    removeItem(id);
  };

  const handleAddressChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const order = await ordersApi.createOrder({
        shippingAddress: address,
        paymentMethod: "stripe",
      });
      // Backend clears the DB cart; we clear the local cart too
      await emptyCart();
      navigate(`/payment/${order.data._id}`);
    } catch (err) {
      addToast(err?.message || "Failed to place order. Please try again.", "error");
    } finally {
      setPlacing(false);
    }
  };

  // ── Empty state ──
  if (items.length === 0 && step === 1) {
    return (
      <div className="cart-page">
        <motion.div
          className="cart-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="cart-empty-icon">
            <FaShoppingBag size={48} />
          </div>
          <h2 className="cart-empty-title">Your cart is empty</h2>
          <p className="cart-empty-text">
            Looks like you haven't added any items yet. Let's fix that.
          </p>
          <button
            type="button"
            className="cart-btn cart-btn--primary"
            onClick={() => navigate("/petshop")}
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  const subtotal = cartTotal;
  const total = subtotal + SHIPPING_FEE;

  return (
    <div className="cart-page">
      {/* Step indicator */}
      <div className="cart-steps">
        <span className={`cart-step ${step === 1 ? "cart-step--active" : "cart-step--done"}`}>
          1. Cart
        </span>
        <span className="cart-step-divider">›</span>
        <span className={`cart-step ${step === 2 ? "cart-step--active" : ""}`}>
          2. Shipping
        </span>
        <span className="cart-step-divider">›</span>
        <span className="cart-step">3. Payment</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            className="cart-grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Left — items */}
            <div className="cart-items-card">
              <div className="cart-items-header">
                <h1 className="cart-items-title">Shopping Cart</h1>
                <span className="cart-items-count">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="cart-items-list">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={{
                      ...item,
                      name: item.name || item.title,
                      image: item.image,
                      quantity: item.quantity || 1,
                      price: item.price,
                    }}
                    onIncreaseQuantity={(id) =>
                      handleQuantityChange(id, item.quantity + 1)
                    }
                    onDecreaseQuantity={(id) =>
                      handleQuantityChange(id, item.quantity - 1)
                    }
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>
            </div>

            {/* Right — summary */}
            <aside className="cart-summary-card">
              <h2 className="cart-summary-title">Order Summary</h2>
              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span>${SHIPPING_FEE.toFixed(2)}</span>
                </div>
                <div className="cart-summary-divider" />
                <div className="cart-summary-row cart-summary-row--total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="button"
                className="cart-btn cart-btn--primary cart-btn--block"
                onClick={() => setStep(2)}
              >
                Proceed to Checkout
                <FaArrowRight size={13} />
              </button>
              <ul className="cart-perks">
                <li><FaTruck size={13} /> Free delivery on orders over $100</li>
                <li><FaShieldAlt size={13} /> Secure encrypted checkout</li>
                <li><FaCheckCircle size={13} /> 100% satisfaction guarantee</li>
              </ul>
            </aside>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            className="cart-grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Left — shipping form */}
            <div className="cart-items-card">
              <button
                type="button"
                className="cart-back"
                onClick={() => setStep(1)}
              >
                <FaArrowLeft size={14} />
                <span>Back to Cart</span>
              </button>
              <h2 className="cart-items-title" style={{ marginTop: "1rem" }}>
                Shipping Address
              </h2>
              <form
                id="shipping-form"
                className="checkout-shipping-form"
                onSubmit={handlePlaceOrder}
              >
                <div className="checkout-field">
                  <label htmlFor="street">Street address</label>
                  <input
                    id="street"
                    name="street"
                    type="text"
                    value={address.street}
                    onChange={handleAddressChange}
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div className="checkout-field-row">
                  <div className="checkout-field">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={address.city}
                      onChange={handleAddressChange}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="state">State / Province</label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={address.state}
                      onChange={handleAddressChange}
                      placeholder="NY"
                      required
                    />
                  </div>
                </div>
                <div className="checkout-field-row">
                  <div className="checkout-field">
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={address.country}
                      onChange={handleAddressChange}
                      placeholder="United States"
                      required
                    />
                  </div>
                  <div className="checkout-field">
                    <label htmlFor="zipCode">ZIP / Postal code</label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={address.zipCode}
                      onChange={handleAddressChange}
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Right — summary + place order */}
            <aside className="cart-summary-card">
              <h2 className="cart-summary-title">Order Summary</h2>
              <div className="cart-summary-rows">
                {items.map((item) => (
                  <div key={item.id} className="cart-summary-row cart-summary-row--item">
                    <span>{item.name || item.title} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="cart-summary-divider" />
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span>${SHIPPING_FEE.toFixed(2)}</span>
                </div>
                <div className="cart-summary-divider" />
                <div className="cart-summary-row cart-summary-row--total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                form="shipping-form"
                className="cart-btn cart-btn--primary cart-btn--block"
                disabled={placing}
              >
                {placing ? (
                  <>
                    <FaSpinner className="spin" size={13} />
                    Placing Order…
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <FaArrowRight size={13} />
                  </>
                )}
              </button>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartCheckoutPage;
```

- [ ] **Step 2: Add CSS for new elements to `CartCheckOutPage.css`**

Append to the bottom of `frontend/src/Pages/CartCheckoutPage/CartCheckOutPage.css`:

```css
/* ── Step indicator ── */
.cart-steps {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #6b7280);
}

.cart-step { font-weight: 500; }
.cart-step--active { color: var(--color-primary, #3b82f6); font-weight: 600; }
.cart-step--done { color: var(--color-success, #10b981); }
.cart-step-divider { color: var(--color-border, #d1d5db); }

/* ── Shipping form ── */
.checkout-shipping-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }

.checkout-field { display: flex; flex-direction: column; gap: 0.35rem; }
.checkout-field label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-secondary, #374151); }
.checkout-field input {
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.checkout-field input:focus { border-color: var(--color-primary, #3b82f6); }

.checkout-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.cart-summary-row--item { font-size: 0.82rem; color: var(--color-text-secondary, #6b7280); }

/* ── Spinner ── */
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
```

- [ ] **Step 3: Commit**

```bash
git add src/Pages/CartCheckoutPage/CartCheckOutPage.jsx \
        src/Pages/CartCheckoutPage/CartCheckOutPage.css
git commit -m "feat(checkout): multi-step flow with shipping form and order creation"
```

---

## Task 8: Create `PaymentPage.jsx`

This page receives an `orderId` from the URL, initializes a Stripe PaymentIntent, shows the Stripe card form, and confirms payment.

**Files:**
- Create: `frontend/src/Pages/Payment/PaymentPage.jsx`
- Create: `frontend/src/Pages/Payment/PaymentPage.css`

- [ ] **Step 1: Create `PaymentPage.jsx`**

```jsx
// frontend/src/Pages/Payment/PaymentPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { FaLock, FaSpinner, FaCheckCircle } from "react-icons/fa";
import paymentsApi from "../../Services/api/paymentsApi";
import { useToast } from "../../context/ToastContext";
import "./PaymentPage.css";

// Load Stripe once outside of component render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: "inherit",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444" },
  },
};

// Inner component — must be inside <Elements> to call useStripe/useElements
function CheckoutForm({ orderId, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    // Confirm the payment on the Stripe side
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      addToast(error.message || "Payment failed. Please try again.", "error");
      setProcessing(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      try {
        // Tell our backend the payment succeeded
        await paymentsApi.confirmPayment(orderId, paymentIntent.id, "stripe");
        setSucceeded(true);
        setTimeout(() => navigate("/my-orders"), 2000);
      } catch {
        // Payment went through on Stripe but backend confirmation failed.
        // Order will be reconciled via webhook. Still navigate to orders.
        addToast(
          "Payment received! Your order will be confirmed shortly.",
          "success"
        );
        setTimeout(() => navigate("/my-orders"), 2000);
      }
    }
  };

  if (succeeded) {
    return (
      <div className="payment-success">
        <FaCheckCircle size={48} className="payment-success-icon" />
        <h2>Payment Successful!</h2>
        <p>Redirecting to your orders…</p>
      </div>
    );
  }

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <div className="payment-card-field">
        <label className="payment-card-label">Card details</label>
        <div className="payment-card-element">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <p className="payment-test-hint">
        <FaLock size={11} /> Test card: 4242 4242 4242 4242 · any future date · any CVC
      </p>

      <button
        type="submit"
        className="payment-btn"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <FaSpinner className="spin" size={14} />
            Processing…
          </>
        ) : (
          <>
            <FaLock size={13} />
            Pay Now
          </>
        )}
      </button>
    </form>
  );
}

// Outer component — initializes Stripe and fetches clientSecret
export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsApi
      .initializePayment(orderId)
      .then(({ clientSecret: cs }) => {
        setClientSecret(cs);
        setLoading(false);
      })
      .catch((err) => {
        addToast(err?.message || "Could not initialize payment.", "error");
        navigate("/checkout");
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="payment-page payment-page--loading">
        <FaSpinner className="spin" size={28} />
        <p>Initializing secure payment…</p>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <motion.div
        className="payment-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="payment-header">
          <FaLock size={16} />
          <h2>Secure Payment</h2>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm orderId={orderId} clientSecret={clientSecret} />
        </Elements>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Create `PaymentPage.css`**

```css
/* frontend/src/Pages/Payment/PaymentPage.css */
.payment-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.payment-page--loading {
  flex-direction: column;
  gap: 1rem;
  color: var(--color-text-secondary, #6b7280);
}

.payment-card {
  background: #fff;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.payment-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.75rem;
  color: var(--color-primary, #3b82f6);
}

.payment-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary, #111827);
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.payment-card-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary, #374151);
  margin-bottom: 0.4rem;
}

.payment-card-element {
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  background: #fff;
  transition: border-color 0.2s;
}

.payment-card-element:focus-within {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.payment-test-hint {
  font-size: 0.78rem;
  color: var(--color-text-secondary, #9ca3af);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.payment-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  background: var(--color-primary, #3b82f6);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}

.payment-btn:hover:not(:disabled) {
  background: var(--color-primary-dark, #2563eb);
}

.payment-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.payment-success {
  text-align: center;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.payment-success-icon { color: var(--color-success, #10b981); }
.payment-success h2 { margin: 0; color: var(--color-text-primary, #111827); }
.payment-success p { color: var(--color-text-secondary, #6b7280); margin: 0; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
```

- [ ] **Step 3: Commit**

```bash
git add src/Pages/Payment/PaymentPage.jsx src/Pages/Payment/PaymentPage.css
git commit -m "feat(payment): add Stripe Elements payment page with PaymentIntent flow"
```

---

## Task 9: Create `MyOrdersPage.jsx` — purchase history

**Files:**
- Create: `frontend/src/Pages/MyOrders/MyOrdersPage.jsx`
- Create: `frontend/src/Pages/MyOrders/MyOrdersPage.css`

- [ ] **Step 1: Create `MyOrdersPage.jsx`**

```jsx
// frontend/src/Pages/MyOrders/MyOrdersPage.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaSpinner, FaBan } from "react-icons/fa";
import ordersApi from "../../Services/api/ordersApi";
import { useToast } from "../../context/ToastContext";
import "./MyOrdersPage.css";

const STATUS_META = {
  pending:    { label: "Pending",    icon: <FaBox />,         cls: "order-badge--pending" },
  processing: { label: "Processing", icon: <FaSpinner className="spin" />, cls: "order-badge--processing" },
  shipped:    { label: "Shipped",    icon: <FaTruck />,        cls: "order-badge--shipped" },
  delivered:  { label: "Delivered",  icon: <FaCheckCircle />,  cls: "order-badge--delivered" },
  cancelled:  { label: "Cancelled",  icon: <FaTimesCircle />,  cls: "order-badge--cancelled" },
};

const PAYMENT_META = {
  pending:   { label: "Payment Pending",   cls: "pay-badge--pending" },
  completed: { label: "Paid",              cls: "pay-badge--paid" },
  failed:    { label: "Payment Failed",    cls: "pay-badge--failed" },
  refunded:  { label: "Refunded",          cls: "pay-badge--refunded" },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => addToast("Failed to load orders.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      await ordersApi.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );
      addToast("Order cancelled.", "success");
    } catch (err) {
      addToast(err?.message || "Could not cancel order.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="my-orders-loading">
        <FaSpinner className="spin" size={28} />
        <p>Loading your orders…</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-orders-empty">
        <FaBox size={48} />
        <h2>No orders yet</h2>
        <p>Once you place an order it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-header">
        <h1>My Orders</h1>
        <p>{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="my-orders-list">
        {orders.map((order, i) => {
          const status = STATUS_META[order.status] || STATUS_META.pending;
          const payment = PAYMENT_META[order.paymentStatus] || PAYMENT_META.pending;
          const canCancel = ["pending", "processing"].includes(order.status);
          const finalAmount =
            typeof order.finalAmount === "number"
              ? order.finalAmount
              : order.totalAmount - (order.discount || 0);

          return (
            <motion.div
              key={order._id}
              className="my-orders-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Card header */}
              <div className="orders-card-header">
                <div>
                  <span className="orders-card-id">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="orders-card-date">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="orders-card-badges">
                  <span className={`order-badge ${status.cls}`}>
                    {status.icon} {status.label}
                  </span>
                  <span className={`pay-badge ${payment.cls}`}>{payment.label}</span>
                </div>
              </div>

              {/* Items */}
              <div className="orders-card-items">
                {order.items?.map((item) => {
                  const product = item.product;
                  const name = product?.name || "Product";
                  const img = product?.images?.[0];
                  return (
                    <div key={item._id} className="orders-item-row">
                      {img && (
                        <img src={img} alt={name} className="orders-item-img" />
                      )}
                      <div className="orders-item-info">
                        <span className="orders-item-name">{name}</span>
                        <span className="orders-item-qty">× {item.quantity}</span>
                      </div>
                      <span className="orders-item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="orders-card-footer">
                <div className="orders-card-total">
                  <span>Total</span>
                  <strong>${finalAmount.toFixed(2)}</strong>
                </div>

                {order.trackingNumber && (
                  <div className="orders-tracking">
                    <FaTruck size={12} />
                    Tracking: <strong>{order.trackingNumber}</strong>
                    {order.estimatedDelivery && (
                      <> · Est. {new Date(order.estimatedDelivery).toLocaleDateString()}</>
                    )}
                  </div>
                )}

                {canCancel && (
                  <button
                    type="button"
                    className="orders-cancel-btn"
                    onClick={() => handleCancel(order._id)}
                    disabled={cancellingId === order._id}
                  >
                    {cancellingId === order._id ? (
                      <><FaSpinner className="spin" size={11} /> Cancelling…</>
                    ) : (
                      <><FaBan size={11} /> Cancel Order</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `MyOrdersPage.css`**

```css
/* frontend/src/Pages/MyOrders/MyOrdersPage.css */
.my-orders-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.my-orders-loading,
.my-orders-empty {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--color-text-secondary, #6b7280);
  text-align: center;
}

.my-orders-header {
  margin-bottom: 1.5rem;
}

.my-orders-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
  margin: 0 0 0.25rem;
}

.my-orders-header p {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #6b7280);
  margin: 0;
}

.my-orders-list { display: flex; flex-direction: column; gap: 1.25rem; }

.my-orders-card {
  background: #fff;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Header */
.orders-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  background: var(--color-surface, #f9fafb);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  gap: 0.75rem;
  flex-wrap: wrap;
}

.orders-card-id {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text-primary, #111827);
  margin-right: 0.75rem;
  font-family: monospace;
}

.orders-card-date {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #6b7280);
}

.orders-card-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }

/* Status badges */
.order-badge, .pay-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}

.order-badge--pending    { background: #fef3c7; color: #92400e; }
.order-badge--processing { background: #dbeafe; color: #1e40af; }
.order-badge--shipped    { background: #e0f2fe; color: #0369a1; }
.order-badge--delivered  { background: #d1fae5; color: #065f46; }
.order-badge--cancelled  { background: #fee2e2; color: #991b1b; }

.pay-badge--pending  { background: #fef9c3; color: #713f12; }
.pay-badge--paid     { background: #d1fae5; color: #065f46; }
.pay-badge--failed   { background: #fee2e2; color: #991b1b; }
.pay-badge--refunded { background: #ede9fe; color: #4c1d95; }

/* Items */
.orders-card-items {
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.orders-item-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.orders-item-img {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e5e7eb);
  flex-shrink: 0;
}

.orders-item-info { flex: 1; }
.orders-item-name { font-size: 0.88rem; font-weight: 500; color: var(--color-text-primary, #111827); display: block; }
.orders-item-qty  { font-size: 0.78rem; color: var(--color-text-secondary, #6b7280); }
.orders-item-price { font-size: 0.88rem; font-weight: 600; color: var(--color-text-primary, #111827); white-space: nowrap; }

/* Footer */
.orders-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-surface, #f9fafb);
}

.orders-card-total {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #6b7280);
}

.orders-card-total strong {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
}

.orders-tracking {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary, #6b7280);
}

.orders-cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.orders-cancel-btn:hover:not(:disabled) { background: #fecaca; }
.orders-cancel-btn:disabled { opacity: 0.55; cursor: not-allowed; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
```

- [ ] **Step 3: Commit**

```bash
git add src/Pages/MyOrders/MyOrdersPage.jsx src/Pages/MyOrders/MyOrdersPage.css
git commit -m "feat(orders): add purchase history page at /my-orders with status tracking and cancel"
```

---

## Task 10: Wire up new routes in `main.jsx`

**Files:**
- Modify: `frontend/src/main.jsx`

- [ ] **Step 1: Add imports at the top of `main.jsx`**

After the existing page imports, add:

```js
import PaymentPage from "./Pages/Payment/PaymentPage.jsx";
import MyOrdersPage from "./Pages/MyOrders/MyOrdersPage.jsx";
```

- [ ] **Step 2: Add new routes inside the `"/"` children array**

After the existing `checkout` route:

```js
{
  path: "checkout",
  element: (
    <ProtectedRoute>
      <CartCheckOutPage />
    </ProtectedRoute>
  ),
},
{
  path: "payment/:orderId",
  element: (
    <ProtectedRoute>
      <PaymentPage />
    </ProtectedRoute>
  ),
},
{
  path: "my-orders",
  element: (
    <ProtectedRoute>
      <MyOrdersPage />
    </ProtectedRoute>
  ),
},
```

> Note: also wrap the existing `checkout` route in `<ProtectedRoute>` as shown above — previously it was unprotected, but placing an order requires being logged in.

- [ ] **Step 3: Commit**

```bash
git add src/main.jsx
git commit -m "feat(routing): add /payment/:orderId and /my-orders routes, protect /checkout"
```

---

## Task 11: End-to-end verification

Manual test with the dev stack running (`npm run dev` in both backend and frontend).

> ⚠️ Requires real Stripe keys in both `.env` files before this step.

- [ ] **Step 1: Cart sync**
  - Log in as a customer.
  - Navigate to `/petshop`, add two different products to cart.
  - Open DevTools → Network tab. Confirm `POST /api/cart` fires for each add.
  - Refresh the page. Confirm cart items are still populated (fetched from backend on login).

- [ ] **Step 2: Checkout → shipping form**
  - Navigate to `/checkout`.
  - Confirm Step 1 shows the cart items.
  - Click "Proceed to Checkout". Confirm Step 2 (shipping form) appears.
  - Fill in all address fields.
  - Click "Proceed to Payment". Confirm a spinner appears, then you're redirected to `/payment/:orderId`.

- [ ] **Step 3: Payment page**
  - Confirm Stripe card form loads (no JS errors in console).
  - Enter test card `4242 4242 4242 4242`, any future date, any 3-digit CVC.
  - Click "Pay Now". Confirm "Payment Successful!" screen appears, then redirect to `/my-orders`.

- [ ] **Step 4: Admin sees the order**
  - Log in as admin.
  - Navigate to `/admin/orders`. Confirm the order placed in Step 2 appears with status `pending` and payment status `completed`.

- [ ] **Step 5: Purchase history**
  - Log back in as the customer.
  - Navigate to `/my-orders`. Confirm the order appears with correct items, amount, and status badge.
  - For a pending/processing order, confirm the "Cancel Order" button appears and works.

---

## Self-Review

### Spec coverage

| Requirement | Task |
|---|---|
| Cart syncs to backend on every mutation | Task 5 (CartContext) + Task 6 (imports) |
| Checkout creates order in DB | Task 7 (CartCheckOutPage) |
| Shipping address form | Task 7 |
| Payment page with Stripe | Task 8 (PaymentPage) |
| Payment initialize → confirm flow | Task 4 (paymentsApi) + Task 8 |
| `/my-orders` purchase history | Task 9 (MyOrdersPage) |
| Order status badges + tracking | Task 9 |
| Cancel pending/processing orders | Task 9 |
| Backend cart param bug fix | Task 2 |
| `/checkout` route protected | Task 10 |
| New routes registered | Task 10 |

### Placeholder scan

None found. All steps contain full code.

### Type consistency

- `cartApi.addToCart(item.id, quantity)` ← `item.id` is the MongoDB product `_id` string, same field used by backend `Cart.addToCart({ productId, quantity })`
- `ordersApi.createOrder({ shippingAddress, paymentMethod: "stripe" })` ← matches backend `createOrder` which reads `req.body.shippingAddress` and `req.body.paymentMethod`
- `paymentsApi.initializePayment(orderId)` → returns `{ clientSecret, paymentIntentId }` ← matches `payment.controller.js` response shape
- `paymentsApi.confirmPayment(orderId, paymentIntent.id, "stripe")` ← matches `payment.controller.js` which reads `req.body.paymentIntentId` and `req.body.paymentMethod`
- `ordersApi.getMyOrders()` → returns `{ data: orders[] }` ← matches `order.controller.js getMyOrders` which returns `{ success, data: orders }`
- `ordersApi.cancelOrder(id)` → `PATCH /orders/:id/cancel` ← matches `order.routes.js`
