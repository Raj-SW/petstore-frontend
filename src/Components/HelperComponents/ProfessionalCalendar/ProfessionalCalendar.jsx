import { useState, useEffect } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaNotesMedical,
} from "react-icons/fa";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AppointmentForm from "@/Components/HelperComponents/AppointmentForm/AppointmentForm";
import AppointmentService from "@/Services/localServices/appointmentService";
import "./ProfessionalCalendar.css";

const ProfessionalCalendar = ({ onBack, professional }) => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments for this professional
  useEffect(() => {
    fetchAppointments();
  }, [professional._id]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await AppointmentService.getByProfessionalId(
        professional._id
      );
      setCalendarEvents(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch appointments");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle slot selection to book an appointment
  const handleDateSelect = (selectInfo) => {
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  };

  // Handle event click for editing/deleting
  const handleEventClick = (clickInfo) => {
    const appointment = calendarEvents.find(
      (appt) => appt.id === parseInt(clickInfo.event.id)
    );
    if (appointment) {
      handleEditAppointment(appointment);
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await appointmentService.delete(appointmentId);
      setCalendarEvents((prev) =>
        prev.filter((appt) => appt.id !== appointmentId)
      );
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const handleAppointmentSubmit = async (appointmentData) => {
    try {
      if (editingAppointment) {
        // Update existing appointment
        const updated = await appointmentService.update(
          editingAppointment.id,
          appointmentData
        );
        setCalendarEvents((prev) =>
          prev.map((appt) => (appt.id === updated.id ? updated : appt))
        );
      } else {
        // Create new appointment
        const newAppointment = await appointmentService.create({
          ...appointmentData,
          professionalId: professional.id,
          professionalName: professional.name,
        });
        setCalendarEvents((prev) => [...prev, newAppointment]);
      }
      setEditingAppointment(null);
      setShowAppointmentForm(false);
    } catch (err) {
      console.error("Error saving appointment:", err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

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
              onClick={() => {
                setEditingAppointment(null);
                setShowAppointmentForm(true);
              }}
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

        {/* Appointment Form Modal */}
        <AppointmentForm
          show={showAppointmentForm}
          handleClose={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(null);
          }}
          onSubmit={handleAppointmentSubmit}
          initialData={editingAppointment}
          professional={professional}
        />
      </div>
    </Container>
  );
};

export default ProfessionalCalendar;
