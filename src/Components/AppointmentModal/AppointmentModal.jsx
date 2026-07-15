import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FaTimes,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./AppointmentModal.css";

export const WHATSAPP_NUMBER = "23057580480";
const CLINIC_MAP_URL = "https://maps.app.goo.gl/YQRTJz6vFe3K9Z6UA";

const HOUSE_EASE = [0.25, 0.46, 0.45, 0.94];

const waUrl = (msg) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

export const BOOKING_PRESET = {
  title: "Book Your Appointment",
  intro: "We're excited to care for your pet.",
  hours: ["Monday", "Wednesday", "Thursday", "Saturday"].map(
    (d) => `${d} – 4:30 PM – 6:00 PM`
  ),
  note: "Need another time? Home visits and special appointments may be available upon request.",
  fields: [
    { key: "petName", label: "Pet's Name", type: "text" },
    { key: "petType", label: "Pet Type", type: "select", options: ["Dog", "Cat", "Other"] },
    { key: "reason", label: "Reason for Visit", type: "text" },
    { key: "day", label: "Preferred Day", type: "select", options: ["Monday", "Wednesday", "Thursday", "Saturday"] },
    { key: "time", label: "Preferred Time", type: "text", placeholder: "e.g. 5:00 PM" },
    { key: "owner", label: "Owner's Name", type: "text" },
  ],
  buildMessage: (v) =>
    `Hello VitalPaws 🐾\nI would like to book an appointment.\n• Pet's Name: ${v.petName || ""}\n• Dog / Cat / Other: ${v.petType || ""}\n• Reason for Visit: ${v.reason || ""}\n• Preferred Consultation Day: ${v.day || ""}\n• Preferred Time: ${v.time || ""}\n• Owner's Name: ${v.owner || ""}\nThank you.`,
  primaryLabel: "Continue with WhatsApp",
  secondary: { type: "clinic" },
  footnote: "We usually reply within a few minutes during business hours.",
};

export const MOBILE_VET_PRESET = {
  title: "Need a veterinarian at your location?",
  intro: "Our mobile veterinary service brings professional care directly to your home when appropriate.",
  checklist: [
    "Sick pets",
    "Elderly pets",
    "Pets unable to travel",
    "Vaccinations",
    "Follow-up consultations",
    "Emergency assistance (subject to availability)",
  ],
  fields: [
    { key: "petName", label: "Pet Name", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "reason", label: "Reason", type: "text" },
    { key: "time", label: "Preferred Time", type: "text" },
  ],
  buildMessage: (v) =>
    `Hello VitalPaws,\nI would like to request a mobile veterinary visit.\nPet Name: ${v.petName || ""}\nLocation: ${v.location || ""}\nReason: ${v.reason || ""}\nPreferred Time: ${v.time || ""}`,
  primaryLabel: "Book Mobile Visit",
  secondary: { type: "call" },
};

export const TRAVEL_PRESET = {
  title: "Book a Relocation Consultation",
  intro: "Tell us where your pet is travelling and we'll guide you through every requirement.",
  fields: [
    { key: "petName", label: "Pet Name", type: "text" },
    { key: "petType", label: "Pet Type", type: "select", options: ["Dog", "Cat", "Other"] },
    { key: "destination", label: "Destination Country", type: "text" },
    { key: "month", label: "Travel Month", type: "text", placeholder: "e.g. March" },
  ],
  buildMessage: (v) =>
    `Hello VitalPaws 🐾\nI would like to plan pet travel.\nPet Name: ${v.petName || ""}\nPet Type: ${v.petType || ""}\nDestination: ${v.destination || ""}\nTravel Month: ${v.month || ""}\nThank you.`,
  primaryLabel: "Continue with WhatsApp",
  secondary: { type: "clinic" },
};

const AppointmentModal = ({ open, onClose, preset }) => {
  const [values, setValues] = useState({});
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!preset) return null;

  const setField = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const panelMotion = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
      };

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
            aria-label={preset.title}
            className="am-modal"
            {...panelMotion}
            transition={{ duration: 0.25, ease: HOUSE_EASE }}
          >
            <button
              type="button"
              className="am-close-btn"
              aria-label="Close"
              onClick={onClose}
            >
              <FaTimes size={18} />
            </button>

            <h3 className="am-title">{preset.title}</h3>
            {preset.intro && <p className="am-description">{preset.intro}</p>}

            {preset.hours && preset.hours.length > 0 && (
              <ul className="am-hours">
                {preset.hours.map((line) => (
                  <li key={line}>
                    <FaCalendarAlt size={13} className="am-hours-icon" />
                    {line}
                  </li>
                ))}
              </ul>
            )}

            {preset.checklist && preset.checklist.length > 0 && (
              <ul className="am-checklist">
                {preset.checklist.map((item) => (
                  <li key={item}>
                    <FaCheckCircle size={13} className="am-check-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {preset.note && <p className="am-note">{preset.note}</p>}

            <form className="am-form" onSubmit={(e) => e.preventDefault()}>
              {preset.fields.map((field) => {
                const id = `am-field-${field.key}`;
                return (
                  <div className="am-field" key={field.key}>
                    <label htmlFor={id}>{field.label}</label>
                    {field.type === "select" ? (
                      <select
                        id={id}
                        value={values[field.key] || ""}
                        onChange={setField(field.key)}
                      >
                        <option value="" disabled hidden />
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={id}
                        type="text"
                        placeholder={field.placeholder}
                        value={values[field.key] || ""}
                        onChange={setField(field.key)}
                      />
                    )}
                  </div>
                );
              })}
            </form>

            <div className="am-actions">
              <a
                href={waUrl(preset.buildMessage(values))}
                target="_blank"
                rel="noopener noreferrer"
                className="am-btn am-btn-primary"
              >
                <FaWhatsapp size={20} />
                {preset.primaryLabel}
              </a>
              {preset.secondary?.type === "clinic" && (
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
              {preset.secondary?.type === "call" && (
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="am-btn am-btn-outline"
                >
                  <FaPhoneAlt size={16} />
                  Call Now
                </a>
              )}
              <button type="button" className="am-btn am-btn-close" onClick={onClose}>
                Close
              </button>
            </div>

            {preset.footnote && <p className="am-footnote">{preset.footnote}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentModal;
