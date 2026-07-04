import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaPencilAlt } from "react-icons/fa";
import "./ProfileModals.css";

const ProfileForm = ({ show, onHide, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "", email: "", phoneNumber: "", address: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        address: initialData.address || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
          onClick={onHide}
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
                <FaPencilAlt size={15} />
              </div>
              <h3 className="pm-title">Edit Profile</h3>
              <button type="button" className="pm-close" onClick={onHide} aria-label="Close">
                <FaTimes size={13} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="pm-body">
                <div className="pm-field">
                  <label className="pm-label" htmlFor="prof-name">Full Name</label>
                  <input
                    id="prof-name"
                    className="pm-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="pm-field">
                  <label className="pm-label" htmlFor="prof-email">Email Address</label>
                  <input
                    id="prof-email"
                    className="pm-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="pm-field-row">
                  <div className="pm-field">
                    <label className="pm-label" htmlFor="prof-phone">Phone Number</label>
                    <input
                      id="prof-phone"
                      className="pm-input"
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="pm-field">
                    <label className="pm-label" htmlFor="prof-address">Address</label>
                    <input
                      id="prof-address"
                      className="pm-input"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="pm-footer">
                <button type="button" className="pm-btn pm-btn--ghost" onClick={onHide}>
                  Cancel
                </button>
                <button type="submit" className="pm-btn pm-btn--primary" disabled={isLoading}>
                  {isLoading ? <><span className="pm-spinner" /> Saving…</> : "Save Changes"}
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

export default ProfileForm;
