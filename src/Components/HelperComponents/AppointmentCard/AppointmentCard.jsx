import { format, parseISO } from "date-fns";
import { Button, ButtonGroup } from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaClock,
  FaMapMarkerAlt,
  FaPaw,
} from "react-icons/fa";
import { motion } from "framer-motion";
import "./AppointmentCard.css";

const AppointmentCard = ({
  professionalName,
  title,
  dateTime,
  description,
  status,
  role,
  location,
  petName,
  appointmentType,
  icon,
  onEdit,
  onDelete,
}) => {
  // parse + format date/time with error handling
  const getFormattedDate = () => {
    if (!dateTime) {
      console.log("No datetimeISO provided", dateTime);
      return "No date set";
    }

    try {
      const parsed = parseISO(dateTime);
      if (isNaN(parsed.getTime())) {
        console.log("Invalid dateTime format:", dateTime);
        return "Invalid date";
      }
      return format(parsed, "eee, MMM d, h:mm a");
    } catch (error) {
      console.log("Error parsing dateTime:", error, dateTime);
      return "Date error";
    }
  };

  const formatted = getFormattedDate();

  // Generate UI Avatar URL as fallback
  const getAvatarUrl = () => {
    const bgColor = role === "Veterinarian" ? "74B49B" : "5C8D89";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      professionalName
    )}&background=${bgColor}&color=fff&size=128`;
  };

  return (
    <motion.div
      className="appointment-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Avatar/Icon */}
      <motion.div
        className="appointment-avatar"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {icon ? (
          <img src={icon} alt={`${title} avatar`} className="avatar-image" />
        ) : (
          <img
            src={getAvatarUrl()}
            alt={`${title} avatar`}
            className="avatar-image"
          />
        )}
      </motion.div>

      {/* Content */}
      <div className="appointment-content">
        {/* Header: title + badges */}
        <motion.div
          className="appointment-header"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="appointment-title">
            {professionalName} - {appointmentType}
          </h3>
          <div className="badge-group">
            {role && (
              <motion.span
                className={`badge role-badge role-${role.toLowerCase()}`}
                whileHover={{ scale: 1.05 }}
              >
                {role}
              </motion.span>
            )}
            {status && (
              <motion.span
                className={`badge status-badge status-${status.toLowerCase()}`}
                whileHover={{ scale: 1.05 }}
              >
                {status}
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Date/Time */}
        <motion.div
          className="appointment-schedule"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FaClock className="schedule-icon" />
          {formatted}
        </motion.div>

        {/* Location */}
        {location && (
          <motion.div
            className="appointment-location"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FaMapMarkerAlt className="location-icon" />
            <span>{location}</span>
          </motion.div>
        )}

        {/* Pet Name */}
        {petName && (
          <motion.div
            className="appointment-pet"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <FaPaw className="pet-icon" />
            <span>{petName}</span>
          </motion.div>
        )}

        {/* Description */}
        {description && (
          <motion.p
            className="appointment-description"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {description}
          </motion.p>
        )}

        {/* Action Buttons */}
        <motion.div
          className="appointment-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ButtonGroup size="sm">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline-danger"
                onClick={onDelete}
                className="action-button"
                disabled={
                  status?.toLowerCase() === "cancelled" ||
                  status?.toLowerCase() === "rejected"
                }
                title={
                  status?.toLowerCase() === "cancelled" ||
                  status?.toLowerCase() === "rejected"
                    ? "Cannot delete cancelled/rejected appointments"
                    : "Delete appointment"
                }
              >
                <FaTrash /> Cancel
              </Button>
            </motion.div>
          </ButtonGroup>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AppointmentCard;
