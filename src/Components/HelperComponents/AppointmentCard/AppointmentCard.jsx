import React from "react";
import { format, parseISO } from "date-fns";
import { Button, ButtonGroup } from "react-bootstrap";
import { FaEdit, FaTrash, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import "./AppointmentCard.css";

const AppointmentCard = ({
  title,
  datetimeISO,
  description,
  status,
  role,
  location,
  icon,
  onEdit,
  onDelete,
}) => {
  // parse + format date/time
  const formatted = datetimeISO
    ? format(parseISO(datetimeISO), "eee, MMM d, h:mm a")
    : "No date set";

  // Generate UI Avatar URL as fallback
  const getAvatarUrl = () => {
    const name =
      role === "Veterinarian"
        ? "Dr. " + title.split(" ")[0]
        : title.split(" ")[0];
    const bgColor = role === "Veterinarian" ? "74B49B" : "5C8D89";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
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
          <h3 className="appointment-title">{title}</h3>
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
            {location}
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
                variant="outline-primary"
                onClick={onEdit}
                className="action-button"
              >
                <FaEdit /> Edit
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline-danger"
                onClick={onDelete}
                className="action-button"
              >
                <FaTrash /> Delete
              </Button>
            </motion.div>
          </ButtonGroup>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AppointmentCard;
