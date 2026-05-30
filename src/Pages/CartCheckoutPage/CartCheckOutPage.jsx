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
import cartApi from "../../Services/api/cartApi";
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

  const handleRemoveItem = (id) => removeItem(id);

  const handleAddressChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      // Safety net: ensure backend cart matches local cart before placing order.
      // This handles the case where items were added before login (pre-login guest cart).
      await cartApi.clearCart();
      await Promise.all(
        items.map((item) => cartApi.addToCart(item.id, item.quantity))
      );

      const res = await ordersApi.createOrder({
        shippingAddress: address,
        paymentMethod: "stripe",
      });
      // Backend clears the DB cart; we clear local cart too
      await emptyCart();
      navigate(`/payment/${res.data._id}`);
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
                    <span>{(item.name || item.title)} × {item.quantity}</span>
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
