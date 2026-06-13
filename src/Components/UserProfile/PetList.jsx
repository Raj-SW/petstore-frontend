import { motion, AnimatePresence } from "framer-motion";
import { FaPencilAlt, FaTrash, FaDog, FaCat, FaDove, FaFish, FaPaw } from "react-icons/fa";

const TYPE_ICON = {
  Dog:        <FaDog size={18} />,
  Cat:        <FaCat size={18} />,
  Bird:       <FaDove size={18} />,
  Fish:       <FaFish size={18} />,
};

const PetList = ({ pets, onEdit, onDelete, onManagePhotos }) => {
  if (!pets?.length) {
    return (
      <div className="pl-empty">
        <FaPaw size={32} />
        <p>No pets added yet.</p>
      </div>
    );
  }

  return (
    <div className="pl-list">
      <AnimatePresence initial={false}>
        {pets.map((pet) => (
          <motion.div
            key={pet.id || pet._id}
            className="pl-card"
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="pet-cover">
              {pet.images && pet.images.length > 0 ? (
                <img src={pet.images[0].url} alt={pet.name} />
              ) : (
                <span className="pet-cover-placeholder">🐾</span>
              )}
            </div>

            <div className="pl-avatar">
              {TYPE_ICON[pet.type] || <FaPaw size={18} />}
            </div>

            <div className="pl-info">
              <h4 className="pl-name">{pet.name}</h4>
              <p className="pl-meta">
                {[pet.breed, pet.age != null && `${pet.age} yr${pet.age !== 1 ? "s" : ""}`, pet.type]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {pet.description && (
                <p className="pl-desc">{pet.description}</p>
              )}
            </div>

            <div className="pl-actions">
              <button
                type="button"
                className="pl-btn pl-btn--edit"
                onClick={() => onEdit(pet)}
                aria-label={`Edit ${pet.name}`}
              >
                <FaPencilAlt size={13} />
              </button>
              <button
                type="button"
                className="pl-btn pl-btn--delete"
                onClick={() => onDelete(pet.id || pet._id)}
                aria-label={`Delete ${pet.name}`}
              >
                <FaTrash size={13} />
              </button>
              <button
                type="button"
                className="pet-photos-btn"
                onClick={() => onManagePhotos(pet)}
              >
                Photos{pet.images?.length ? ` (${pet.images.length})` : ""}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { PetList as default };
