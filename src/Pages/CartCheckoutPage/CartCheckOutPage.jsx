import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingBag, FaTruck, FaShieldAlt, FaCheckCircle,
  FaSpinner, FaLock, FaArrowLeft,
} from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { CartItem } from "../../Components/HelperComponents/CartItem/CartItem";
import Price from "../../Components/HelperComponents/Price/Price";
import SubscriptionChooser from "../../Components/Subscriptions/SubscriptionChooser";
import { useCart } from "@/context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";
import ordersApi from "../../Services/api/ordersApi";
import paymentsApi from "../../Services/api/paymentsApi";
import subscriptionsApi from "../../Services/api/subscriptionsApi";
import settingsApi from "../../Services/api/settingsApi";
import { isIntervalValid } from "../../utils/subscriptionPricing";
import pawSvg from "@/assets/CartoonAssets/paw.svg";
import "./CartCheckOutPage.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SUB_DISCOUNT = Number(import.meta.env.VITE_SUBSCRIPTION_DISCOUNT_PERCENT) || 10;

const EMPTY_ADDRESS = { street: "", city: "", state: "", country: "", zipCode: "" };

const round2 = (n) => Math.round(n * 100) / 100;

// Mirrors order.service.js computeChargesFromSettings so preview matches invoice.
function computePreview(subtotal, settings) {
  if (!settings) return { shippingFee: null, tax: null, grandTotal: null };
  const flat = Number(settings.shippingFlatFee) || 0;
  const threshold = Number(settings.freeShippingThreshold) || 0;
  const rate = (Number(settings.taxRatePercent) || 0) / 100;
  const taxInclusive = settings.taxInclusive !== false;

  const shippingFee = subtotal >= threshold ? 0 : flat;
  let tax, grandTotal;
  if (taxInclusive) {
    tax = rate > 0 ? round2(subtotal - subtotal / (1 + rate)) : 0;
    grandTotal = round2(subtotal + shippingFee);
  } else {
    tax = round2(subtotal * rate);
    grandTotal = round2(subtotal + tax + shippingFee);
  }
  return { shippingFee, tax, grandTotal };
}

const CARD_OPTS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#001c10",
      fontFamily: "'Poppins', sans-serif",
      fontWeight: "500",
      "::placeholder": { color: "#b0b0b0" },
    },
    invalid: { color: "#ff6370" },
  },
};

// ── Inner checkout form (needs useStripe / useElements) ───────────────────────
function CheckoutContent() {
  const stripe   = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { selectedCurrency } = useCurrency();
  const { items, cartTotal, totalItems, updateItemQuantity, removeItem, emptyCart } = useCart();

  const [settings, setSettings]     = useState(null);
  const [address, setAddress]       = useState(EMPTY_ADDRESS);
  const [notes, setNotes]           = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [placing, setPlacing]       = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const [makeRecurring, setMakeRecurring] = useState(false);
  const [recurUnit, setRecurUnit]   = useState("week");
  const [recurCount, setRecurCount] = useState(4);

  useEffect(() => {
    settingsApi.getSettings().then(setSettings).catch(() => {});
  }, []);

  const { shippingFee, tax, grandTotal } = useMemo(
    () => computePreview(cartTotal, settings),
    [cartTotal, settings],
  );

  const handleAddressChange = useCallback((e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }));
  }, [fieldErrors]);

  const validate = () => {
    const e = {};
    if (!address.street.trim())  e.street  = "Required";
    if (!address.city.trim())    e.city    = "Required";
    if (!address.state.trim())   e.state   = "Required";
    if (!address.country.trim()) e.country = "Required";
    if (!address.zipCode.trim()) e.zipCode = "Required";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!stripe || !elements) return;
    if (makeRecurring && !isIntervalValid(recurUnit, recurCount)) {
      addToast("Minimum subscription interval is 7 days", "error");
      return;
    }

    setPlacing(true);
    try {
      // ── Step 1: Create order (skip on retry after card decline) ──
      let orderId = pendingOrderId;
      if (!orderId) {
        const res = await ordersApi.createOrder({
          shippingAddress: address,
          paymentMethod: "stripe",
          notes: notes.trim() || undefined,
        });
        orderId = res.data._id;
        setPendingOrderId(orderId);

        // Optional subscription — non-fatal
        if (makeRecurring) {
          subscriptionsApi.create({
            items: items.map((i) => ({ product: i.productId || i.id, quantity: i.quantity })),
            shippingAddress: address,
            paymentMethod: "stripe",
            intervalUnit: recurUnit,
            intervalCount: Number(recurCount),
            source: "checkout",
          }).catch(() => {});
        }

        await emptyCart();
      }

      // ── Step 2: Get Stripe client secret ──
      const { clientSecret } = await paymentsApi.initializePayment(orderId);

      // ── Step 3: Client-side card confirmation ──
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (error) {
        // Order exists — store orderId so retry skips recreation
        addToast(error.message || "Payment failed. Please try again.", "error");
        return;
      }

      // ── Step 4: Server-side confirmation ──
      if (paymentIntent.status === "succeeded") {
        try {
          await paymentsApi.confirmPayment(orderId, paymentIntent.id, "stripe");
        } catch {
          // Stripe webhook will reconcile if this fails
        }
        navigate(`/order-confirmed/${orderId}`, {
          state: { orderId, items, total: grandTotal ?? cartTotal },
        });
      }
    } catch (err) {
      addToast(
        err?.response?.data?.message || err?.message || "Failed to place order. Please try again.",
        "error",
      );
    } finally {
      setPlacing(false);
    }
  };

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="cart-page cart-page--empty">
        <motion.div
          className="cart-empty"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          <img src={pawSvg} className="cart-empty-paw" aria-hidden="true" alt="" />
          <motion.div
            className="cart-empty-icon"
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeInOut" }}
          >
            <FaShoppingBag size={44} />
          </motion.div>
          <h2 className="cart-empty-title">Your cart is empty!</h2>
          <p className="cart-empty-text">
            Looks like you haven't added any items yet. Your furry friend is waiting!
          </p>
          <motion.button
            type="button"
            className="cart-btn cart-btn--primary"
            onClick={() => navigate("/petshop")}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const isMUR = selectedCurrency === "MUR";
  const displayTotal = grandTotal ?? cartTotal;

  return (
    <div className="co-page">
      <div className="co-header">
        <Link to="/petshop" className="co-back">
          <FaArrowLeft size={13} /> Continue Shopping
        </Link>
        <h1 className="co-title">Checkout</h1>
        <span className="co-item-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
      </div>

      <form id="co-form" className="co-layout" onSubmit={handleSubmit} noValidate>
        {/* ── LEFT: Shipping Details ── */}
        <div className="co-form-col">
          <section className="co-section">
            <h2 className="co-section-title">Shipping Details</h2>

            <div className="co-field">
              <label htmlFor="street">Street address</label>
              <input
                id="street" name="street" type="text"
                value={address.street} onChange={handleAddressChange}
                placeholder="123 Main St" autoComplete="street-address"
              />
              {fieldErrors.street && <span className="co-field-err">{fieldErrors.street}</span>}
            </div>

            <div className="co-field-row">
              <div className="co-field">
                <label htmlFor="city">City</label>
                <input
                  id="city" name="city" type="text"
                  value={address.city} onChange={handleAddressChange}
                  placeholder="Port Louis" autoComplete="address-level2"
                />
                {fieldErrors.city && <span className="co-field-err">{fieldErrors.city}</span>}
              </div>
              <div className="co-field">
                <label htmlFor="state">State / District</label>
                <input
                  id="state" name="state" type="text"
                  value={address.state} onChange={handleAddressChange}
                  placeholder="Plaines Wilhems" autoComplete="address-level1"
                />
                {fieldErrors.state && <span className="co-field-err">{fieldErrors.state}</span>}
              </div>
            </div>

            <div className="co-field-row">
              <div className="co-field">
                <label htmlFor="country">Country</label>
                <input
                  id="country" name="country" type="text"
                  value={address.country} onChange={handleAddressChange}
                  placeholder="Mauritius" autoComplete="country-name"
                />
                {fieldErrors.country && <span className="co-field-err">{fieldErrors.country}</span>}
              </div>
              <div className="co-field">
                <label htmlFor="zipCode">Postal code</label>
                <input
                  id="zipCode" name="zipCode" type="text"
                  value={address.zipCode} onChange={handleAddressChange}
                  placeholder="00000" autoComplete="postal-code"
                />
                {fieldErrors.zipCode && <span className="co-field-err">{fieldErrors.zipCode}</span>}
              </div>
            </div>
          </section>

          <section className="co-section">
            <h2 className="co-section-title">Order Notes <span className="co-optional">(optional)</span></h2>
            <textarea
              className="co-notes"
              rows={3}
              placeholder="Special instructions for your order, e.g. delivery times, pet name…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>

          {/* Cart items — visible on mobile below form */}
          <section className="co-section co-items-mobile">
            <h2 className="co-section-title">Your Items</h2>
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={{
                    ...item,
                    name: item.variantLabel
                      ? `${item.name || item.title} · ${item.variantLabel}`
                      : (item.name || item.title),
                    quantity: item.quantity || 1,
                  }}
                  onIncreaseQuantity={(id) => updateItemQuantity(id, item.quantity + 1)}
                  onDecreaseQuantity={(id) => updateItemQuantity(id, item.quantity - 1)}
                  onRemoveItem={removeItem}
                />
              ))}
            </AnimatePresence>
          </section>
        </div>

        {/* ── RIGHT: Order Summary + Payment ── */}
        <aside className="co-sidebar">
          {/* Order summary */}
          <section className="co-sidebar-section">
            <h2 className="co-section-title">Your Order</h2>

            {/* Items list — desktop only */}
            <div className="co-order-items co-items-desktop">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={{
                      ...item,
                      name: item.variantLabel
                        ? `${item.name || item.title} · ${item.variantLabel}`
                        : (item.name || item.title),
                      quantity: item.quantity || 1,
                    }}
                    onIncreaseQuantity={(id) => updateItemQuantity(id, item.quantity + 1)}
                    onDecreaseQuantity={(id) => updateItemQuantity(id, item.quantity - 1)}
                    onRemoveItem={removeItem}
                    compact
                  />
                ))}
              </AnimatePresence>
            </div>

            <div className="co-divider" />

            <div className="co-totals">
              <div className="co-totals-row">
                <span>Subtotal</span>
                <Price amount={cartTotal} />
              </div>
              <div className="co-totals-row">
                <span>Shipping</span>
                {shippingFee === null ? (
                  <span className="co-loading-dot">…</span>
                ) : shippingFee === 0 ? (
                  <span className="co-free">Free</span>
                ) : (
                  <Price amount={shippingFee} />
                )}
              </div>
              {settings && !settings.taxInclusive && tax > 0 && (
                <div className="co-totals-row">
                  <span>Tax ({settings.taxRatePercent}%)</span>
                  <Price amount={tax} />
                </div>
              )}
              {settings?.taxInclusive && tax > 0 && (
                <div className="co-totals-row co-totals-row--muted">
                  <span>Incl. VAT ({settings.taxRatePercent}%)</span>
                  <Price amount={tax} />
                </div>
              )}
              <div className="co-divider" />
              <div className="co-totals-row co-totals-row--total">
                <span>Total</span>
                <Price amount={displayTotal} />
              </div>
              {!isMUR && (
                <p className="co-currency-note">
                  Charged as Rs {Math.round(displayTotal).toLocaleString()} MUR via Stripe
                </p>
              )}
            </div>
          </section>

          {/* Subscription */}
          <section className="co-sidebar-section co-recurring">
            <SubscriptionChooser
              basePrice={cartTotal}
              discountPercent={SUB_DISCOUNT}
              mode={makeRecurring ? "subscribe" : "onetime"}
              onModeChange={(m) => setMakeRecurring(m === "subscribe")}
              intervalCount={recurCount}
              intervalUnit={recurUnit}
              onIntervalCountChange={setRecurCount}
              onIntervalUnitChange={setRecurUnit}
            />
          </section>

          {/* Payment */}
          <section className="co-sidebar-section">
            <h2 className="co-section-title">
              <FaLock size={13} style={{ marginRight: "0.4rem", opacity: 0.6 }} />
              Secure Payment
            </h2>
            <div className="co-card-wrap">
              <CardElement options={CARD_OPTS} />
            </div>
            {import.meta.env.DEV && (
              <p className="co-test-hint">
                Test: 4242 4242 4242 4242 · any future date · any CVC
              </p>
            )}
          </section>

          {/* Retry notice */}
          {pendingOrderId && (
            <motion.p
              className="co-retry-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Your order was saved — just re-enter your card details and try again.
            </motion.p>
          )}

          {/* CTA */}
          <motion.button
            type="submit"
            form="co-form"
            className="co-place-btn"
            disabled={placing || !stripe}
            whileHover={placing ? {} : { y: -3 }}
            whileTap={placing ? {} : { scale: 0.97, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
          >
            {placing ? (
              <><FaSpinner className="spin" size={14} /> Processing…</>
            ) : (
              <>
                <FaLock size={13} />
                Place Order
                {grandTotal != null && (
                  <span className="co-place-amount">
                    {" · "}
                    <Price amount={grandTotal} inline />
                  </span>
                )}
              </>
            )}
          </motion.button>

          {placing && (
            <motion.p
              className="co-placing-hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Securing your order, please don't close this page…
            </motion.p>
          )}

          <ul className="co-perks">
            <li><FaTruck size={13} /> Free delivery on orders over Rs {Number(settings?.freeShippingThreshold || 100).toLocaleString()}</li>
            <li><FaShieldAlt size={13} /> SSL encrypted checkout</li>
            <li><FaCheckCircle size={13} /> 100% satisfaction guarantee</li>
          </ul>
        </aside>
      </form>
    </div>
  );
}

// ── Outer page — provides Stripe Elements context ─────────────────────────────
export default function CartCheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
}
