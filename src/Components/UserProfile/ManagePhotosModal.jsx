import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiStar, FiTrash2, FiPlus } from "react-icons/fi";
import petApi from "../../Services/api/petApi";
import { useToast } from "../../context/ToastContext";
import "./ManagePhotosModal.css";

const MAX = 6;

const ManagePhotosModal = ({ pet, onClose, onChange }) => {
  const { addToast } = useToast();
  const inputRef = useRef(null);
  const [images, setImages] = useState(pet.images || []);
  const [busy, setBusy] = useState(false);

  const petId = pet._id || pet.id;
  const atCap = images.length >= MAX;

  const sync = (updatedPet) => {
    setImages(updatedPet.images || []);
    if (onChange) onChange(updatedPet);
  };

  const MAX_BYTES = 15 * 1024 * 1024; // 15 MB — matches server limit

  const onAdd = async (e) => {
    // Snapshot into an array BEFORE clearing the input — e.target.files is a
    // live FileList that resetting value="" empties, which would drop the files.
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    if (images.length + files.length > MAX) {
      addToast(`A pet can have at most ${MAX} photos.`, "error");
      return;
    }
    const oversized = files.find((f) => f.size > MAX_BYTES);
    if (oversized) {
      addToast(`"${oversized.name}" is too large. Please use images under 15 MB.`, "error");
      return;
    }
    try {
      setBusy(true);
      const res = await petApi.addPetImages(petId, files);
      sync(res.data);
      addToast("Photos added", "success");
    } catch (err) {
      addToast(err?.message || "Failed to add photos", "error");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (publicId) => {
    try {
      setBusy(true);
      const res = await petApi.deletePetImage(petId, publicId);
      sync(res.data);
      addToast("Photo removed", "success");
    } catch (err) {
      addToast(err?.message || "Failed to remove photo", "error");
    } finally {
      setBusy(false);
    }
  };

  const onSetCover = async (publicId) => {
    try {
      setBusy(true);
      const res = await petApi.setPrimaryPetImage(petId, publicId);
      sync(res.data);
      addToast("Cover updated", "success");
    } catch (err) {
      addToast(err?.message || "Failed to set cover", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="mpm-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="mpm-modal"
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mpm-header">
            <h3>{pet.name} — Photos <span className="mpm-count">{images.length}/{MAX}</span></h3>
            <button className="mpm-close" onClick={onClose} aria-label="Close"><FiX /></button>
          </div>

          {images.length === 0 ? (
            <p className="mpm-empty">No photos yet. Add up to {MAX}.</p>
          ) : (
            <div className="mpm-grid">
              {images.map((img, i) => (
                <div key={img.publicId} className={`mpm-thumb${i === 0 ? " mpm-thumb-cover" : ""}`}>
                  <img src={img.url} alt="" loading="lazy" />
                  {i === 0 && <span className="mpm-cover-tag">Cover</span>}
                  <div className="mpm-thumb-actions">
                    {i !== 0 && (
                      <button title="Set as cover" disabled={busy} onClick={() => onSetCover(img.publicId)}>
                        <FiStar size={14} />
                      </button>
                    )}
                    <button title="Delete" disabled={busy} onClick={() => onDelete(img.publicId)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="mpm-add"
            disabled={busy || atCap}
            onClick={() => inputRef.current?.click()}
          >
            <FiPlus size={15} /> {atCap ? "Maximum reached" : "Add photos"}
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onAdd} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ManagePhotosModal;
