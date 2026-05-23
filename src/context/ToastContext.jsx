import { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaCheckCircle, FaExclamationCircle, FaInfoCircle,
  FaShoppingCart, FaCreditCard, FaBell, FaUserEdit, FaHeart, FaTimes,
} from "react-icons/fa";
import "./ToastContext.css";

const ToastContext = createContext();

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};

const DEFAULT_DURATION = 4000;

const ICON_FOR_TYPE = {
  success: FaCheckCircle,
  error:   FaExclamationCircle,
  warning: FaExclamationCircle,
  info:    FaInfoCircle,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", icon = null) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, icon }]);
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Predefined toasts ──

  const showCartToast = (action, productName) => {
    const msg = action === "add"
      ? `${productName} added to cart`
      : `${productName} removed from cart`;
    addToast(msg, "success", FaShoppingCart);
  };

  const showAuthToast = (action, status) => {
    const map = {
      login:     { success: "Welcome back!",                error: "Login failed. Check your credentials." },
      signup:    { success: "Account created successfully!", error: "Signup failed. Please try again." },
      logout:    { success: "Logged out. See you soon!",     error: "Error logging out." },
      passwordReset: {
        request: "Password reset link sent to your email.",
        success: "Password reset successful. Please log in with your new password.",
        error:   "Password reset failed. Please try again.",
      },
      loginRequired: {
        success: "You need to log in to access this page.",
        error:   "You need to log in to access this page.",
      },
    };
    const msg = map[action]?.[status] || "Notification";
    addToast(msg, status === "success" || status === "request" ? "success" : "error");
  };

  const showCheckoutToast = (status) => {
    if (status === "success") {
      addToast("Order placed successfully! Thank you for your purchase.", "success", FaCreditCard);
    } else {
      addToast("There was an error processing your order. Please try again.", "error", FaCreditCard);
    }
  };

  const showReviewToast = (action, status, errorMessage) => {
    const map = {
      submit: {
        success: "Review submitted. Thank you!",
        error: errorMessage || "Review submission failed. Please try again.",
      },
    };
    const msg = map[action]?.[status] || "Notification";
    addToast(msg, status, FaUserEdit);
  };

  const showProfileToast = (action, status) => {
    const map = {
      update: { success: "Profile updated successfully!",        error: "Failed to update profile." },
      avatar: { success: "Profile picture updated successfully!", error: "Failed to update profile picture." },
    };
    const msg = map[action]?.[status] || "Notification";
    addToast(msg, status, FaUserEdit);
  };

  const showWishlistToast = (action, productName) => {
    const msg = action === "add"
      ? `${productName} added to wishlist`
      : `${productName} removed from wishlist`;
    addToast(msg, "success", FaHeart);
  };

  const showNotificationToast = (message, type = "info") => {
    addToast(message, type, FaBell);
  };

  return (
    <ToastContext.Provider
      value={{
        addToast, removeToast,
        showCartToast, showAuthToast, showCheckoutToast,
        showReviewToast, showProfileToast, showWishlistToast, showNotificationToast,
      }}
    >
      {children}
      <ToastViewport toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

// ── Toast viewport (portal) ──

const ToastViewport = ({ toasts, onClose }) =>
  createPortal(
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => onClose(t.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );

const ToastCard = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);
  const Icon = toast.icon || ICON_FOR_TYPE[toast.type] || FaInfoCircle;

  useEffect(() => {
    let start;
    let frame;
    const tick = (ts) => {
      if (!start) start = ts;
      const pct = Math.max(0, 100 - ((ts - start) / DEFAULT_DURATION) * 100);
      setProgress(pct);
      if (pct > 0) frame = requestAnimationFrame(tick);
      else onClose();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      role="status"
      className={`toast-card toast-card--${toast.type}`}
      initial={{ opacity: 0, x: 60, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.96, transition: { duration: 0.22 } }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="toast-icon"><Icon size={18} /></div>
      <p className="toast-msg">{toast.message}</p>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        <FaTimes size={11} />
      </button>
      <div className="toast-progress" style={{ width: `${progress}%` }} />
    </motion.div>
  );
};
