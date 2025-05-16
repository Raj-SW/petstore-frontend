import React from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { Card } from "react-bootstrap";
import "./TimeSlotGrid.css";

const TimeSlotGrid = ({ selectedDate, appointments, onTimeSlotClick }) => {
  // Generate time slots from 9 AM to 5 PM
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = Math.floor((i + 18) / 2);
    const minute = (i + 18) % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  // Get appointments for the selected date
  const dayAppointments = appointments.filter((appointment) =>
    isSameDay(parseISO(appointment.datetimeISO), selectedDate)
  );

  return (
    <div className="time-slot-grid">
      {timeSlots.map((time) => {
        const appointment = dayAppointments.find(
          (appt) => format(parseISO(appt.datetimeISO), "HH:mm") === time
        );

        return (
          <Card
            key={time}
            className={`time-slot ${appointment ? "has-appointment" : ""}`}
            onClick={() => onTimeSlotClick(time)}
          >
            <Card.Body>
              <div className="time-slot-header">
                <span className="time">
                  {format(new Date(`2000-01-01T${time}`), "h:mm a")}
                </span>
                {appointment && (
                  <span
                    className={`badge status-${appointment.status.toLowerCase()}`}
                  >
                    {appointment.status}
                  </span>
                )}
              </div>
              {appointment && (
                <div className="appointment-details">
                  <h6>{appointment.title}</h6>
                  <p className="mb-0">{appointment.description}</p>
                  <small className="text-muted">{appointment.location}</small>
                </div>
              )}
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default TimeSlotGrid;
