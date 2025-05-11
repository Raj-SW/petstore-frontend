import React from "react";
import { format, parseISO } from "date-fns";
import "./AppointmentCard.css";

const AppointmentCard = ({
  title,
  datetimeISO,
  description,
  status,
  role,
  location,
  icon,
}) => {
  // parse + format date/time
  const dt = parseISO(datetimeISO);
  const formatted = format(dt, "eee, MMM d, h:mm a");

  return (
    <div className="appointment-card">
      {/* Avatar/Icon */}
      <div className="appointment-avatar">
        {icon ? (
          <img src={icon} alt={`${title} avatar`} />
        ) : (
          <div className="avatar-placeholder" />
        )}
      </div>

      {/* Content */}
      <div className="appointment-content">
        {/* Header: title + badges */}
        <div className="appointment-header">
          <h3 className="appointment-title">{title}</h3>
          <div className="badge-group">
            {role && (
              <span className={`badge role-badge role-${role.toLowerCase()}`}>
                {role}
              </span>
            )}
            {status && (
              <span
                className={`badge status-badge status-${status.toLowerCase()}`}
              >
                {status}
              </span>
            )}
          </div>
        </div>

        {/* Date/Time */}
        <div className="appointment-schedule">
          <i className="icon-clock" aria-hidden="true" />
          {formatted}
        </div>

        {/* Location */}
        {location && (
          <div className="appointment-location">
            <i className="icon-map-pin" aria-hidden="true" />
            {location}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="appointment-description">{description}</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
