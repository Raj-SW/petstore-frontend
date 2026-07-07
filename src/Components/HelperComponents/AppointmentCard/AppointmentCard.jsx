import { format, parseISO } from "date-fns";
import { FaClock, FaMapMarkerAlt, FaPaw, FaBan } from "react-icons/fa";
import { motion } from "framer-motion";
import "./AppointmentCard.css";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='280'%3E%3Crect width='400' height='280' fill='%23f0ebe4'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='64' fill='%23c9baa8'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";

const STATUS_COLOR = {
  confirmed: "#2e7d4f",
  pending:   "#b57c1a",
  cancelled: "#c0392b",
  rejected:  "#c0392b",
};

const AppointmentCard = ({
  professionalName,
  appointmentType,
  dateTime,
  status,
  role,
  location,
  petName,
  icon,
  onDelete,
}) => {
  let formatted = "No date set";
  if (dateTime) {
    try {
      const parsed = parseISO(dateTime);
      if (!Number.isNaN(parsed.getTime())) formatted = format(parsed, "eee, MMM d · h:mm a");
    } catch {
      formatted = "Date error";
    }
  }

  const isClosed = ["cancelled", "rejected"].includes(status?.toLowerCase());
  const statusColor = STATUS_COLOR[status?.toLowerCase()] ?? "#8a7d6e";

  return (
    <motion.article
      className="appt-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: "easeOut" } }}
    >
      <div className="appt-img-wrap">
        <img
          src={icon || PLACEHOLDER}
          alt={professionalName}
          className="appt-img"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />
        {status && (
          <span className="appt-status-pill" style={{ background: statusColor }}>
            {status}
          </span>
        )}
      </div>

      <div className="appt-info">
        <p className="appt-name">{professionalName}</p>
        {appointmentType && <p className="appt-type">{appointmentType}</p>}

        <div className="appt-meta">
          <span><FaClock size={11} aria-hidden="true" /> {formatted}</span>
          {location && <span><FaMapMarkerAlt size={11} aria-hidden="true" /> {location}</span>}
          {petName  && <span><FaPaw size={11} aria-hidden="true" /> {petName}</span>}
          {role     && <span className="appt-role">{role}</span>}
        </div>

        <button
          type="button"
          className="appt-cancel-btn"
          onClick={onDelete}
          disabled={isClosed}
          title={isClosed ? "Cannot cancel a closed appointment" : "Cancel appointment"}
        >
          <FaBan size={12} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </motion.article>
  );
};

export default AppointmentCard;
