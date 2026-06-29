import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaPaw } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
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

  const petFormBtnLabel = isLoading
    ? <><span className="pm-spinner" /> Saving…</>
    : (initialData ? "Save Changes" : "Add Pet");

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
                    <label className="pm-label" htmlFor="pf-name">Pet Name *</label>
                    <input
                      id="pf-name"
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
                    <p className="pm-label">Type *</p>
                    <Select
                      value={formData.type || undefined}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                    >
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Fish">Fish</SelectItem>
                        <SelectItem value="Small Pets">Small Pets</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pm-field-row">
                  <div className="pm-field">
                    <label className="pm-label" htmlFor="pf-breed">Breed *</label>
                    <input
                      id="pf-breed"
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
                    <label className="pm-label" htmlFor="pf-color">Color *</label>
                    <input
                      id="pf-color"
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
                    <label className="pm-label" htmlFor="pf-age">Age (years) *</label>
                    <input
                      id="pf-age"
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
                    <p className="pm-label">Gender *</p>
                    <Select
                      value={formData.gender || undefined}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v }))}
                    >
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pm-field">
                  <label className="pm-label" htmlFor="pf-description">Description</label>
                  <textarea
                    id="pf-description"
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
                  {petFormBtnLabel}
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
