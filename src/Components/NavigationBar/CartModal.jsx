import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { CartItem } from "../HelperComponents/CartItem/CartItem";
import Price from "../HelperComponents/Price/Price";
import "./CartModal.css";

const CartModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const { items, cartTotal, totalItems, updateItemQuantity, removeItem } = useCart();
  const { showCartToast } = useToast();

  useEffect(() => {
    if (!show) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onHide(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [show, onHide]);

  const handleViewCart = () => { onHide(); navigate("/checkout"); };

  const handleRemoveItem = (id) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      showCartToast("remove", item.name || item.title);
      removeItem(id);
    }
  };

  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="cm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onHide}
          />
          <motion.aside
            className="cm-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <header className="cm-header">
              <div className="cm-header-title">
                <h3>Shopping Cart</h3>
                <span className="cm-count">{totalItems} item{totalItems === 1 ? "" : "s"}</span>
              </div>
              <button
                type="button"
                className="cm-close"
                onClick={onHide}
                aria-label="Close cart"
              >
                <FaTimes size={16} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="cm-empty">
                <div className="cm-empty-icon">
                  <FaShoppingBag size={36} />
                </div>
                <h4>Your cart is empty</h4>
                <p>Browse our products and start adding items.</p>
                <button
                  type="button"
                  className="cm-btn cm-btn--primary"
                  onClick={() => { onHide(); navigate("/petshop"); }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cm-body">
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
                      onIncreaseQuantity={(id) => updateItemQuantity(id, item.quantity + 1)}
                      onDecreaseQuantity={(id) => updateItemQuantity(id, item.quantity - 1)}
                      onRemoveItem={handleRemoveItem}
                    />
                  ))}
                </div>

                <footer className="cm-footer">
                  <div className="cm-summary">
                    {/* Shipping/tax come from store settings and are computed
                        at checkout (incl. free-shipping threshold) — quoting a
                        hardcoded fee here disagreed with the checkout total. */}
                    <div className="cm-summary-row cm-summary-row--total">
                      <span>Subtotal</span>
                      <Price amount={cartTotal} />
                    </div>
                    <p className="cm-summary-note">
                      Shipping &amp; taxes calculated at checkout
                    </p>
                  </div>

                  <button
                    type="button"
                    className="cm-btn cm-btn--primary cm-btn--block"
                    onClick={handleViewCart}
                  >
                    View Cart &amp; Checkout
                    <FaArrowRight size={13} />
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CartModal;
