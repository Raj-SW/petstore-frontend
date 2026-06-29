import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaKey, FaExclamationCircle } from "react-icons/fa";
import "./ProfileModals.css";

const PasswordChangeForm = ({ show, onHide, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (formData.newPassword.length < 6) {
      setValidationError("New password must be at least 6 characters.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError("New passwords do not match.");
      return;
    }

    onSubmit({
      oldPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const handleClose = () => {
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setValidationError("");
    onHide();
  };

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className="pm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <motion.div
            className="pm-modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="pm-header">
              <div className="pm-header-icon">
                <FaKey size={15} />
              </div>
              <h3 className="pm-title">Change Password</h3>
              <button type="button" className="pm-close" onClick={handleClose} aria-label="Close">
                <FaTimes size={13} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="pm-body">
                {validationError && (
                  <div className="pm-global-err">
                    <FaExclamationCircle size={14} />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="pm-field">
                  <label className="pm-label" htmlFor="pcf-current-password">Current Password</label>
                  <input
                    id="pcf-current-password"
                    className="pm-input"
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <p className="pm-section">New Password</p>

                <div className="pm-field">
                  <label className="pm-label" htmlFor="pcf-new-password">New Password</label>
                  <input
                    id="pcf-new-password"
                    className="pm-input"
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div className="pm-field">
                  <label className="pm-label" htmlFor="pcf-confirm-password">Confirm New Password</label>
                  <input
                    id="pcf-confirm-password"
                    className="pm-input"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat new password"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="pm-footer">
                <button type="button" className="pm-btn pm-btn--ghost" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="pm-btn pm-btn--primary" disabled={isLoading}>
                  {isLoading ? <><span className="pm-spinner" /> Updating…</> : "Change Password"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export { PasswordChangeForm as default };
