import { useState, useEffect } from "react";
// CSS
import "./appointmentCalendar.css";
import "@/styles/calendarStyles.css";
// Components
import {
  Container,
  Row,
  Tab,
  Nav,
  Form,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AppointmentCard from "@/Components/HelperComponents/AppointmentCard/AppointmentCard";
import AppointmentForm from "@/Components/HelperComponents/AppointmentForm/AppointmentForm";
import AppointmentService from "../../../Services/localServices/appointmentService";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";

const AppointmentCalendar = () => {
  const { addToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [activeKey, setActiveKey] = useState("calendar-view");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch appointments on component mount
  useEffect(() => {
    if (!authLoading) {
      fetchAppointments();
    }
  }, [filter, authLoading]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      let appointments;

      if (filter === "all") {
        appointments = await AppointmentService.getAllMyAppointments();
      } else {
        appointments = await AppointmentService.getByType(filter);
      }

      const formattedEvents = appointments.map((appointment) => ({
        id: appointment._id,
        title: appointment.title,
        start: new Date(appointment.datetimeISO),
        end: new Date(
          new Date(appointment.datetimeISO).getTime() +
            appointment.duration * 60000
        ),
        backgroundColor: appointment.type === "vet" ? "#28a745" : "#007bff",
        borderColor: appointment.type === "vet" ? "#28a745" : "#007bff",
        textColor: "#ffffff",
        extendedProps: {
          description: appointment.description,
          status: appointment.status,
          location: appointment.location,
          role: appointment.role,
          petName: appointment.petName,
          ownerName: appointment.ownerName,
          duration: appointment.duration,
          notes: appointment.notes,
        },
      }));

      setAppointments(formattedEvents);
    } catch (err) {
      setError(err.message);
      addToast("Failed to fetch appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filtered = appointments
    .filter((a) => filter === "all" || a.type === filter)
    .filter((a) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.location.toLowerCase().includes(query)
      );
    });

  const handleSelect = (eventKey) => {
    setFilter(eventKey);
  };

  const handleAppointmentSubmit = async (appointmentData) => {
    try {
      if (editingAppointment) {
        // Update existing appointment
        const updated = await AppointmentService.update(
          editingAppointment.id,
          appointmentData
        );
        setAppointments((prev) =>
          prev.map((appt) => (appt.id === updated.id ? updated : appt))
        );
      } else {
        // Create new appointment
        const newAppointment = await AppointmentService.create(appointmentData);
        setAppointments((prev) => [...prev, newAppointment]);
      }
      setEditingAppointment(null);
      setShowAppointmentForm(false);
    } catch (err) {
      console.error("Error saving appointment:", err);
      // You might want to show an error message to the user here
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await AppointmentService.delete(appointmentId);
      setAppointments((prev) =>
        prev.filter((appt) => appt.id !== appointmentId)
      );
    } catch (err) {
      console.error("Error deleting appointment:", err);
      // You might want to show an error message to the user here
    }
  };

  const handleDateSelect = (selectInfo) => {
    setEditingAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEventClick = (clickInfo) => {
    const appointment = appointments.find(
      (appt) => appt.id === parseInt(clickInfo.event.id)
    );
    if (appointment) {
      handleEditAppointment(appointment);
    }
  };

  const filterLabel = {
    all: "All Appointments",
    vet: "Vet Appointments",
    grooming: "Grooming Appointments",
  }[filter];

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedEvent?._id) {
        await AppointmentService.update(selectedEvent._id, formData);
        addToast("Appointment updated successfully", "success");
      } else {
        const newAppointment = await AppointmentService.create(formData);
        setAppointments((prev) => [...prev, newAppointment]);
        addToast("Appointment created successfully", "success");
      }
      setShowAppointmentForm(false);
      fetchAppointments();
    } catch (err) {
      addToast(err.message || "Failed to save appointment", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await AppointmentService.delete(id);
      addToast("Appointment deleted successfully", "success");
      setShowDetails(false);
      fetchAppointments();
    } catch (err) {
      addToast(err.message || "Failed to delete appointment", "error");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await AppointmentService.updateStatus(id, newStatus);
      addToast("Appointment status updated successfully", "success");
      setShowDetails(false);
      fetchAppointments();
    } catch (err) {
      addToast(err.message || "Failed to update appointment status", "error");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
      </div>
    );
  }

  return (
    <Container>
      <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
        <Row className=" dashboard-header-row w-100">
          <Nav className="dashboardNavTabs poppins-medium">
            <Nav.Item>
              <Nav.Link eventKey="calendar-view">Calendar View</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="list-view">List View</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="history-view">History</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="appointment-calendar-content">
            {/* 1) Calendar View */}
            <Tab.Pane eventKey="calendar-view">
              <div
                // initial={{ opacity: 0, scale: 0.95 }}
                // animate={{ opacity: 1, scale: 1 }}
                // transition={{ duration: 0.3 }}
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
                  events={appointments}
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
              </div>
            </Tab.Pane>

            {/* 2) List View */}
            <Tab.Pane eventKey="list-view" className="">
              <div className="appointment-list-header">
                <h4>Upcoming Appointments</h4>
                <InputGroup className="search-bar">
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </div>
              {filtered.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  title={appt.title}
                  datetimeISO={appt.start.toISOString()}
                  description={appt.extendedProps.description}
                  status={appt.extendedProps.status}
                  role={appt.extendedProps.role}
                  location={appt.extendedProps.location}
                  onEdit={() => handleEditAppointment(appt)}
                  onDelete={() => handleDeleteAppointment(appt.id)}
                />
              ))}
            </Tab.Pane>

            {/* 3) History View */}
            <Tab.Pane eventKey="history-view">
              <div className="appointment-list-header">
                <h4>Past Appointments</h4>
                <InputGroup className="search-bar">
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </div>
              {filtered
                .filter((appt) => new Date(appt.datetimeISO) < new Date())
                .map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    title={appt.title}
                    datetimeISO={appt.start.toISOString()}
                    description={appt.extendedProps.description}
                    status={appt.extendedProps.status}
                    role={appt.extendedProps.role}
                    location={appt.extendedProps.location}
                    onEdit={() => handleEditAppointment(appt)}
                    onDelete={() => handleDeleteAppointment(appt.id)}
                  />
                ))}
            </Tab.Pane>
          </Tab.Content>
        </Row>
      </Tab.Container>

      {/* Appointment Form Modal */}
      <AppointmentForm
        show={showAppointmentForm}
        handleClose={() => {
          setShowAppointmentForm(false);
          setEditingAppointment(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAppointment}
      />

      <Modal show={showDetails} onHide={() => setShowDetails(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <AppointmentCard
              appointment={selectedEvent}
              onDelete={() => handleDelete(selectedEvent.id)}
              onStatusUpdate={(status) =>
                handleStatusUpdate(selectedEvent.id, status)
              }
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AppointmentCalendar;
