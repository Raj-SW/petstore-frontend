import { useState, useEffect } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaArrowLeft, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AppointmentForm from "@/Components/HelperComponents/AppointmentForm/AppointmentForm";
import appointmentsApi from "@/Services/api/appointmentsApi";
import professionalsApi from "@/Services/api/professionalsApi";
import "./ProfessionalCalendar.css";
import {useAuth} from "@/context/AuthContext";
import { useToast } from "../../../context/ToastContext";


const ProfessionalCalendar = ({ onBack, professional }) => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [professionalInfo, setProfessionalInfo] = useState(null);
  const [professionalAppointments, setProfessionalAppointments] = useState([]);
  // Fetch appointments for this professional
  useEffect(() => {
    fetchAppointments();
  }, [professional._id]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const professionalData = await professionalsApi.getProfessionalById(
        professional._id
      );
      console.log(professionalData);
      setProfessionalInfo(professionalData);

      const appointments =
        await appointmentsApi.getProfessionalPublicAppointments(
          professional._id
        );
      setProfessionalAppointments(appointments);

      setCalendarEvents(professionalAppointments);
      setError(null);
    } catch (err) {
      setError("Failed to fetch appointments", err.message);
    } finally {
      setLoading(false);
    }
  };
  const getAvatarUrl = () => {
    const bgColor = "74B49B";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      professionalInfo?.name ?? "N A"
    )}&background=${bgColor}&color=fff&size=128`;
  };

  // Handle slot selection to book an appointment
  const handleDateSelect = (selectInfo) => {
    
    if(user==null){
      addToast("You need to log in to book an appointment.", "warning");
      return;
    }
    if(user.pets.length==0){
      addToast("You need to add a pet to your account to book an appointment.", "warning");
      return;
    }
    setEditingAppointment({
      professionalId: professionalInfo._id,
      professionalName: professionalInfo.name,
      role: professionalInfo.role,
      specialization: professionalInfo.specialization,
      phoneNumber: professionalInfo.phoneNumber,
      address: professionalInfo.address,
      profileImage: professionalInfo.profileImage,
      datetimeISO: selectInfo.startStr || selectInfo.start.toISOString(),
      // add other fields as needed
    });
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
    } catch (err) {}
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
        <div
          className="professional-details-card d-flex justify-content-between align-items-start"
          style={{ position: "relative" }}
        >
          <div className="professional-details-info" style={{ flex: 1 }}>
            <h3 className="professional-name mb-1">{professionalInfo.name}</h3>
            <div className="d-flex align-items-center mb-2">
              <span className="me-2">{professionalInfo.specialization}</span>
              <span className="badge bg-success ms-2">
                {professionalInfo.role}
              </span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <span className="me-2">
                ⭐ {professionalInfo.rating} ({professionalInfo.reviewCount}{" "}
                reviews)
              </span>
              <span className="ms-2">
                Experience: {professionalInfo.experience} yrs
              </span>
            </div>
            <div className="mb-2">
              <strong>Qualifications:</strong>{" "}
              {professionalInfo.qualifications &&
              professionalInfo.qualifications.length > 0
                ? professionalInfo.qualifications.join(", ")
                : "N/A"}
            </div>
            <div className="d-flex align-items-center mb-2">
              <span className="icon me-2">
                <FaPhone />
              </span>
              <span>{professionalInfo.phoneNumber}</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <span className="icon me-2">
                <FaMapMarkerAlt />
              </span>
              <span>{professionalInfo.address}</span>
            </div>
            {professionalInfo.bio && (
              <div className="mb-2">
                <strong>Bio:</strong>{" "}
                <span style={{ color: "#666" }}>{professionalInfo.bio}</span>
              </div>
            )}
            {professionalInfo.services &&
              professionalInfo.services.length > 0 && (
                <div className="mb-2">
                  <strong>Services:</strong>{" "}
                  {professionalInfo.services.map((s) => s.name).join(", ")}
                </div>
              )}
          </div>
          <img
            src={getAvatarUrl()}
            alt="Profile of professional"
            className="professional-image"
            style={{
              width: 120,
              height: 120,
              objectFit: "cover",
              borderRadius: "50%",
              marginLeft: 32,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          />
        </div>
        <Row className="professional-calendar-header-row">
          <Col>
            <h4 className="mb-4 professional-calendar-header-title">
              {professionalInfo.name} schedule
            </h4>
          </Col>
          <Col className="d-flex justify-content-end">
            <Button
              className="book-appointment-btn rounded-5"
              onClick={() => {
                if(user==null){
                  addToast("You need to log in to book an appointment.", "warning");
                  return;
                }
                if(user.pets.length==0){
                  addToast("You need to add a pet to your account to book an appointment.", "warning");
                  return;
                }
                setEditingAppointment({
                  professionalId: professionalInfo._id,
                  professionalName: professionalInfo.name,
                  role: professionalInfo.role,
                  specialization: professionalInfo.specialization,
                  phoneNumber: professionalInfo.phoneNumber,
                  address: professionalInfo.address,
                  profileImage: professionalInfo.profileImage,
                  datetimeISO: new Date().toISOString(),
                });
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
          professionalInfo={professionalInfo}
        />
      </div>
    </Container>
  );
};

export default ProfessionalCalendar;
