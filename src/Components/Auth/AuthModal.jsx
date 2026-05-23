import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import "./AuthModals.css";

const AuthModal = ({ show, onHide, title, subtitle, children, maxWidth = 460 }) => {
  // Lock body scroll while open + esc to close
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

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className="auth-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => { if (e.target.classList.contains("auth-modal-backdrop")) onHide(); }}
        >
          <motion.div
            className="auth-modal"
            style={{ maxWidth }}
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="auth-modal-close"
              onClick={onHide}
              aria-label="Close"
              type="button"
            >
              <FaTimes size={18} />
            </button>

            <div className="auth-modal-body">
              {title && <h2 className="auth-modal-title">{title}</h2>}
              {subtitle && <p className="auth-modal-subtitle">{subtitle}</p>}
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
