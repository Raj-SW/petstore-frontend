import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import "./ProfileModals.css";

const ConfirmModal = ({ show, title, message, confirmLabel = "Delete", onConfirm, onCancel }) => {
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className="pm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
        >
          <motion.div
            className="pm-modal"
            style={{ maxWidth: 400 }}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="pm-header">
              <div className="pm-header-icon" style={{ background: "#fef2f2", color: "#c0392b" }}>
                <FaExclamationTriangle size={15} />
              </div>
              <h3 className="pm-title">{title}</h3>
              <button type="button" className="pm-close" onClick={onCancel} aria-label="Close">
                <FaTimes size={13} />
              </button>
            </div>

            <div className="pm-body">
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "#555", margin: 0, lineHeight: 1.6 }}>
                {message}
              </p>
            </div>

            <div className="pm-footer">
              <button type="button" className="pm-btn pm-btn--ghost" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="pm-btn"
                style={{ background: "#c0392b", color: "#fff", border: "none" }}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;
