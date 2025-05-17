import React, { useState } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaNotesMedical,
} from "react-icons/fa";
import "./ProfessionalCalendar.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const ProfessionalCalendar = ({ onBack, professional }) => {
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Handle slot selection to book an appointment
  const handleDateSelect = (selectInfo) => {
    let title = `Appointment with ${professional.name}`;
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    // Add new event
    setCalendarEvents((prevEvents) => [
      ...prevEvents,
      {
        id: String(Date.now()),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      },
    ]);
  };

  // Optionally handle event click (e.g., show details or cancel)
  const handleEventClick = (clickInfo) => {
    // For now, do nothing or show alert
    alert(
      `Appointment: ${
        clickInfo.event.title
      }\n${clickInfo.event.start.toLocaleString()}`
    );
  };

  return (
    <Container>
      <div className="professional-calendar-content">
        <Row>
          <Col>
            <Button
              onClick={onBack}
              className="back-button mb-3 rounded-5"
              variant="outline-primary"
            >
              <FaArrowLeft className="me-2" /> Back to List
            </Button>
          </Col>
        </Row>
        <div className="professional-details-card">
          <div className="professional-details-flex">
            <img
              src={professional.image}
              alt={professional.name}
              className="professional-image"
            />
            <div className="professional-details-info">
              <h3 className="professional-name">{professional.name}</h3>
              <div className="professional-detail-row">
                <span className="icon">
                  <FaMapMarkerAlt />
                </span>
                <span className="detail-text">
                  Location: {professional.location}
                </span>
              </div>
              <div className="professional-detail-row">
                <span className="icon">
                  <FaPhone />
                </span>
                <span className="detail-text">{professional.phone}</span>
              </div>
              <div className="professional-detail-row">
                <span className="icon">
                  <FaNotesMedical />
                </span>
                <span className="detail-text">
                  Specialities: {professional.specialization}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Row className="professional-calendar-header-row">
          <Col>
            <h4 className="mb-4 professional-calendar-header-title">
              {professional.name} schedule
            </h4>
          </Col>
          <Col className="d-flex justify-content-end">
            <Button
              className="book-appointment-btn rounded-5"
              onClick={() => setShowAppointmentForm(true)}
            >
              Book Appointment
            </Button>
          </Col>
        </Row>
        <Container fluid>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="calendar-container"
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={calendarEvents}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="08:00:00"
              slotMaxTime="18:00:00"
              allDaySlot={false}
              slotDuration="00:30:00"
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
            />
          </motion.div>
        </Container>
        <Container fluid></Container>
      </div>
    </Container>
  );
};

export default ProfessionalCalendar;
