import React from "react";
import "./AppointmentCard.css";

const AppointmentCard = ({ title, date, time, description, status }) => {
  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <h3>{title}</h3>
        <span className={`status-badge ${status?.toLowerCase()}`}>
          {status}
        </span>
      </div>
      <div className="appointment-details">
        <div className="appointment-datetime">
          <p className="date">{date}</p>
          <p className="time">{time}</p>
        </div>
        <p className="description">{description}</p>
      </div>
    </div>
  );
};

export default AppointmentCard;
