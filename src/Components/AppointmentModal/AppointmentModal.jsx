import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
import "./AppointmentModal.css";

const WHATSAPP_NUMBER = "23057580480";
const CLINIC_MAP_URL = "https://maps.app.goo.gl/YQRTJz6vFe3K9Z6UA";

const AppointmentModal = ({
  open,
  onClose,
  title,
  description,
  hours,
  waMessage,
  primaryLabel = "Continue on WhatsApp",
  showFindClinic = true,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage || "")}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="am-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="am-modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <button
              type="button"
              className="am-close-btn"
              aria-label="Close"
              onClick={onClose}
            >
              <FaTimes size={18} />
            </button>

            <h3 className="am-title">{title}</h3>
            {description && <p className="am-description">{description}</p>}

            {hours && hours.length > 0 && (
              <ul className="am-hours">
                {hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}

            <div className="am-actions">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="am-btn am-btn-primary"
              >
                <FaWhatsapp size={20} />
                {primaryLabel}
              </a>
              {showFindClinic && (
                <a
                  href={CLINIC_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="am-btn am-btn-outline"
                >
                  <FaMapMarkerAlt size={18} />
                  Find Our Clinic
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentModal;
