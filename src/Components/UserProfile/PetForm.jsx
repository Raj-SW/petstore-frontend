import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaPaw } from "react-icons/fa";
import "./ProfileModals.css";

const EMPTY_FORM = {
  name: "", type: "", breed: "", age: "", gender: "", color: "", description: "",
};

const PetForm = ({ show, onHide, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    setFormData(initialData
      ? {
          name: initialData.name || "",
          type: initialData.type || "",
          breed: initialData.breed || "",
          age: initialData.age ?? "",
          gender: initialData.gender || "",
          color: initialData.color || "",
          description: initialData.description || "",
        }
      : EMPTY_FORM
    );
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, age: Number(formData.age) });
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
                <FaPaw size={15} />
              </div>
              <h3 className="pm-title">{initialData ? "Edit Pet" : "Add New Pet"}</h3>
              <button type="button" className="pm-close" onClick={onHide} aria-label="Close">
                <FaTimes size={13} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="pm-body">
                <p className="pm-section">Basic Info</p>

                <div className="pm-field-row">
                  <div className="pm-field">
                    <label className="pm-label">Pet Name *</label>
                    <input
                      className="pm-input"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Buddy"
                      required
                    />
                  </div>
                  <div className="pm-field">
                    <label className="pm-label">Type *</label>
                    <select
                      className="pm-select"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Fish">Fish</option>
                      <option value="Small Pets">Small Pets</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pm-field-row">
                  <div className="pm-field">
                    <label className="pm-label">Breed *</label>
                    <input
                      className="pm-input"
                      type="text"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      placeholder="e.g. Golden Retriever"
                      required
                    />
                  </div>
                  <div className="pm-field">
                    <label className="pm-label">Color *</label>
                    <input
                      className="pm-input"
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="e.g. Golden"
                      required
                    />
                  </div>
                </div>

                <div className="pm-field-row">
                  <div className="pm-field">
                    <label className="pm-label">Age (years) *</label>
                    <input
                      className="pm-input"
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div className="pm-field">
                    <label className="pm-label">Gender *</label>
                    <select
                      className="pm-select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="pm-field">
                  <label className="pm-label">Description</label>
                  <textarea
                    className="pm-textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us a little about your pet…"
                    rows={3}
                  />
                </div>
              </div>

              <div className="pm-footer">
                <button type="button" className="pm-btn pm-btn--ghost" onClick={onHide}>
                  Cancel
                </button>
                <button type="submit" className="pm-btn pm-btn--primary" disabled={isLoading}>
                  {isLoading
                    ? <><span className="pm-spinner" /> Saving…</>
                    : initialData ? "Save Changes" : "Add Pet"
                  }
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

export { PetForm as default };
