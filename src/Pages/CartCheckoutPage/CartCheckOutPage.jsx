// frontend/src/Pages/CartCheckoutPage/CartCheckOutPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaArrowRight, FaShoppingBag,
  FaTruck, FaShieldAlt, FaCheckCircle, FaSpinner,
} from "react-icons/fa";
import { CartItem } from "../../Components/HelperComponents/CartItem/CartItem";
import CheckoutStepper from "../../Components/HelperComponents/CheckoutStepper/CheckoutStepper";
import Price from "../../Components/HelperComponents/Price/Price";
import { useCart } from "@/context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";
import ordersApi from "../../Services/api/ordersApi";
import subscriptionsApi from "../../Services/api/subscriptionsApi";
import cartApi from "../../Services/api/cartApi";
import pawSvg from "@/assets/CartoonAssets/paw.svg";
import "./CartCheckOutPage.css";

const SHIPPING_FEE = 20;
const EMPTY_ADDRESS = { street: "", city: "", state: "", country: "", zipCode: "" };

// Direction-aware variants — custom = +1 (forward) or -1 (back)
const stepVariants = {
  enter:  (dir) => ({ x: dir * 70, opacity: 0 }),
  center: {
    x: 0, opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
  exit: (dir) => ({
    x: dir * -70, opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" },
  }),
};

const btnSpring = { type: "spring", stiffness: 420, damping: 14 };

const CartCheckoutPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { items, cartTotal, totalItems, updateItemQuantity, removeItem, emptyCart } = useCart();

  const [step, setStep]       = useState(1);
  const [stepDir, setStepDir] = useState(1);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [placing, setPlacing] = useState(false);
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [recurUnit, setRecurUnit]   = useState("week");
  const [recurCount, setRecurCount] = useState(4);

  const goNext = () => { setStepDir(1);  setStep(s => s + 1); };
  const goBack = () => { setStepDir(-1); setStep(s => s - 1); };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cartTotal;
  const total    = subtotal + SHIPPING_FEE;
  const { selectedCurrency } = useCurrency();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      // Sync local cart → backend before creating the order
      await cartApi.clearCart();
      await Promise.all(items.map(item => cartApi.addToCart(item.id, item.quantity)));

      const res = await ordersApi.createOrder({
        shippingAddress: address,
        paymentMethod: "stripe",
      });

      // Optionally turn this order into a recurring subscription — non-fatal:
      // the order already succeeded even if subscription creation fails.
      if (makeRecurring) {
        try {
          await subscriptionsApi.create({
            items: items.map((i) => ({ product: i.id, quantity: i.quantity })),
            shippingAddress: address,
            paymentMethod: "stripe",
            intervalUnit: recurUnit,
            intervalCount: Number(recurCount),
            source: "checkout",
          });
        } catch {
          // ignore — order succeeded
        }
      }

      await emptyCart();

      // Pass order summary to PaymentPage via location state (no extra API call needed)
      navigate(`/payment/${res.data._id}`, {
        state: { items, subtotal, shipping: SHIPPING_FEE, total },
      });
    } catch (err) {
      addToast(err?.message || "Failed to place order. Please try again.", "error");
    } finally {
      setPlacing(false);
    }
  };

  // ── Empty cart state ──
  if (items.length === 0 && step === 1) {
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
            transition={btnSpring}
          >
            Continue Shopping <FaArrowRight size={13} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* ── Stepper ── */}
      <div className="cart-stepper-wrap">
        <CheckoutStepper currentStep={step} />
      </div>

      {/* ── Step panels ── */}
      <div className="cart-step-viewport">
        <AnimatePresence mode="wait" custom={stepDir}>

          {/* ─────── STEP 1 — Cart Review ─────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              className="cart-grid"
              custom={stepDir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Left — item list */}
              <div className="cart-items-card">
                <div className="cart-items-header">
                  <h1 className="cart-items-title">Shopping Cart</h1>
                  <span className="cart-items-count">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="cart-items-list">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <CartItem
                        key={item.id}
                        item={{
                          ...item,
                          name:     item.variantLabel
                            ? `${item.name || item.title} · ${item.variantLabel}`
                            : (item.name || item.title),
                          quantity: item.quantity || 1,
                        }}
                        onIncreaseQuantity={id => updateItemQuantity(id, item.quantity + 1)}
                        onDecreaseQuantity={id => updateItemQuantity(id, item.quantity - 1)}
                        onRemoveItem={removeItem}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right — summary */}
              <aside className="cart-summary-card">
                <h2 className="cart-summary-title">Order Summary</h2>

                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <Price amount={subtotal} />
                  </div>
                  <div className="cart-summary-row">
                    <span>Shipping</span>
                    <Price amount={SHIPPING_FEE} />
                  </div>
                  <div className="cart-summary-divider" />
                  <div className="cart-summary-row cart-summary-row--total">
                    <span>Total</span>
                    <Price amount={total} showMur={selectedCurrency !== 'MUR'} />
                  </div>
                  {selectedCurrency !== 'MUR' && (
                    <p style={{ fontSize: '0.75rem', color: '#6b7b6b', marginTop: '0.5rem', textAlign: 'right' }}>
                      Charged as Rs {Math.round(total).toLocaleString()} MUR via Stripe
                    </p>
                  )}
                </div>

                <motion.button
                  type="button"
                  className="cart-btn cart-btn--primary cart-btn--block"
                  onClick={goNext}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.96, y: 0 }}
                  transition={btnSpring}
                >
                  Proceed to Checkout <FaArrowRight size={13} />
                </motion.button>

                <ul className="cart-perks">
                  <li><FaTruck size={13} />Free delivery on orders over $100</li>
                  <li><FaShieldAlt size={13} />Secure encrypted checkout</li>
                  <li><FaCheckCircle size={13} />100% satisfaction guarantee</li>
                </ul>
              </aside>
            </motion.div>
          )}

          {/* ─────── STEP 2 — Shipping ─────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              className="cart-grid"
              custom={stepDir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Left — shipping form */}
              <div className="cart-items-card">
                <motion.button
                  type="button"
                  className="cart-back"
                  onClick={goBack}
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={btnSpring}
                >
                  <FaArrowLeft size={13} /> Back to Cart
                </motion.button>

                <h2 className="cart-items-title cart-items-title--sub">
                  Shipping Address
                </h2>

                <form
                  id="shipping-form"
                  className="checkout-shipping-form"
                  onSubmit={handlePlaceOrder}
                  noValidate
                >
                  <div className="checkout-field">
                    <label htmlFor="street">Street address</label>
                    <input
                      id="street" name="street" type="text"
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
                        id="city" name="city" type="text"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div className="checkout-field">
                      <label htmlFor="state">State / Province</label>
                      <input
                        id="state" name="state" type="text"
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
                        id="country" name="country" type="text"
                        value={address.country}
                        onChange={handleAddressChange}
                        placeholder="United States"
                        required
                      />
                    </div>
                    <div className="checkout-field">
                      <label htmlFor="zipCode">ZIP / Postal code</label>
                      <input
                        id="zipCode" name="zipCode" type="text"
                        value={address.zipCode}
                        onChange={handleAddressChange}
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Right — frozen summary + place order */}
              <aside className="cart-summary-card">
                <h2 className="cart-summary-title">Order Summary</h2>

                <div className="cart-summary-rows">
                  {items.map(item => (
                    <div key={item.id} className="cart-summary-row cart-summary-row--item">
                      <span className="cart-summary-item-name">
                        {item.name || item.title}{item.variantLabel ? ` · ${item.variantLabel}` : ""} × {item.quantity}
                      </span>
                      <Price amount={item.price * item.quantity} />
                    </div>
                  ))}
                  <div className="cart-summary-divider" />
                  <div className="cart-summary-row">
                    <span>Subtotal</span>
                    <Price amount={subtotal} />
                  </div>
                  <div className="cart-summary-row">
                    <span>Shipping</span>
                    <Price amount={SHIPPING_FEE} />
                  </div>
                  <div className="cart-summary-divider" />
                  <div className="cart-summary-row cart-summary-row--total">
                    <span>Total</span>
                    <Price amount={total} showMur={selectedCurrency !== 'MUR'} />
                  </div>
                  {selectedCurrency !== 'MUR' && (
                    <p style={{ fontSize: '0.75rem', color: '#6b7b6b', marginTop: '0.5rem', textAlign: 'right' }}>
                      Charged as Rs {Math.round(total).toLocaleString()} MUR via Stripe
                    </p>
                  )}
                </div>

                <div className="cart-recurring">
                  <label className="cart-recurring-toggle">
                    <input
                      type="checkbox"
                      checked={makeRecurring}
                      onChange={(e) => setMakeRecurring(e.target.checked)}
                    />
                    <span>Make this a recurring order &amp; save</span>
                  </label>
                  {makeRecurring && (
                    <div className="cart-recurring-row">
                      <span>Every</span>
                      <input
                        type="number"
                        min="1"
                        value={recurCount}
                        onChange={(e) => setRecurCount(e.target.value)}
                        className="cart-recurring-count"
                      />
                      <select value={recurUnit} onChange={(e) => setRecurUnit(e.target.value)}>
                        <option value="day">day(s)</option>
                        <option value="week">week(s)</option>
                      </select>
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  form="shipping-form"
                  className="cart-btn cart-btn--primary cart-btn--block"
                  disabled={placing}
                  whileHover={!placing ? { y: -4 } : {}}
                  whileTap={!placing ? { scale: 0.96, y: 0 } : {}}
                  transition={btnSpring}
                >
                  {placing ? (
                    <><FaSpinner className="spin" size={13} /> Creating Order…</>
                  ) : (
                    <>Proceed to Payment <FaArrowRight size={13} /></>
                  )}
                </motion.button>

                {placing && (
                  <motion.p
                    className="cart-placing-hint"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Securing your order, hang tight…
                  </motion.p>
                )}
              </aside>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default CartCheckoutPage;
