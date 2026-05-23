import { useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import { motion } from "framer-motion";
import {
  FaArrowLeft, FaArrowRight, FaShoppingBag,
  FaTruck, FaShieldAlt, FaCheckCircle,
} from "react-icons/fa";
import { CartItem } from "../../Components/HelperComponents/CartItem/CartItem";
import { useToast } from "../../context/ToastContext";
import "./CartCheckOutPage.css";

const SHIPPING_FEE = 20;

const CartCheckoutPage = () => {
  const navigate = useNavigate();
  const { showCartToast, showCheckoutToast } = useToast();
  const { items, cartTotal, totalItems, updateItemQuantity, removeItem, emptyCart } = useCart();

  const handleQuantityChange = (id, newQty) => updateItemQuantity(id, newQty);

  const handleRemoveItem = (id) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      showCartToast("remove", item.title);
      removeItem(id);
    }
  };

  const handleCheckout = () => {
    showCheckoutToast("success");
    emptyCart();
    navigate("/");
  };

  // ── Empty state ──
  if (items.length === 0) {
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

  const total = cartTotal + SHIPPING_FEE;

  return (
    <div className="cart-page">
      <motion.div
        className="cart-back"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/petshop")}
      >
        <FaArrowLeft size={14} />
        <span>Continue Shopping</span>
      </motion.div>

      <div className="cart-grid">

        {/* Left — items */}
        <motion.div
          className="cart-items-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="cart-items-header">
            <h1 className="cart-items-title">Shopping Cart</h1>
            <span className="cart-items-count">
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </span>
          </div>

          <div className="cart-items-list">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={{
                  ...item,
                  name: item.title,
                  image: item.image,
                  quantity: item.quantity || 1,
                  price: item.price,
                }}
                onIncreaseQuantity={(id) => handleQuantityChange(id, item.quantity + 1)}
                onDecreaseQuantity={(id) => handleQuantityChange(id, item.quantity - 1)}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>
        </motion.div>

        {/* Right — order summary */}
        <motion.aside
          className="cart-summary-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <h2 className="cart-summary-title">Order Summary</h2>

          <div className="cart-summary-rows">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
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
            onClick={handleCheckout}
          >
            Check Out
            <FaArrowRight size={13} />
          </button>

          <ul className="cart-perks">
            <li><FaTruck size={13} /> Free delivery on orders over $100</li>
            <li><FaShieldAlt size={13} /> Secure encrypted checkout</li>
            <li><FaCheckCircle size={13} /> 100% satisfaction guarantee</li>
          </ul>
        </motion.aside>
      </div>
    </div>
  );
};

export default CartCheckoutPage;
