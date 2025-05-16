import React, { useState, useEffect } from "react";
// CSS
import "./appointmentCalendar.css";
// Components
import {
  Container,
  Row,
  Col,
  Tab,
  Nav,
  Dropdown,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion } from "framer-motion";
import AppointmentCard from "@/Components/HelperComponents/AppointmentCard/AppointmentCard";
import AppointmentForm from "@/Components/HelperComponents/AppointmentForm/AppointmentForm";
import { appointmentService } from "@/Services/localServices/appointmentService";

const AppointmentCalendar = () => {
  const [activeKey, setActiveKey] = useState("calendar-view");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAll();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch appointments");
      console.error("Error fetching appointments:", err);
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
        const updated = await appointmentService.update(
          editingAppointment.id,
          appointmentData
        );
        setAppointments((prev) =>
          prev.map((appt) => (appt.id === updated.id ? updated : appt))
        );
      } else {
        // Create new appointment
        const newAppointment = await appointmentService.create(appointmentData);
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
      await appointmentService.delete(appointmentId);
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

  // Convert appointments to FullCalendar events
  const calendarEvents = filtered.map((appt) => ({
    id: appt.id.toString(),
    title: appt.title,
    start: appt.datetimeISO,
    end: new Date(new Date(appt.datetimeISO).getTime() + appt.duration * 60000),
    backgroundColor: appt.type === "vet" ? "#28a745" : "#007bff",
    borderColor: appt.type === "vet" ? "#28a745" : "#007bff",
    textColor: "#ffffff",
    extendedProps: {
      description: appt.description,
      status: appt.status,
      location: appt.location,
      role: appt.role,
    },
  }));

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container fluid>
        <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
          <Row className="align-items-center mb-4 dashboard-header-row">
            <Col>
              <Nav variant="pills" className="dashboardNavTabs poppins-medium">
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
            </Col>
          </Row>

          <Row>
            <Col>
              <Tab.Content>
                {/* 1) Calendar View */}
                <Tab.Pane eventKey="calendar-view">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="calendar-container"
                  >
                    <FullCalendar
                      plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin,
                      ]}
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
                </Tab.Pane>

                {/* 2) List View */}
                <Tab.Pane eventKey="list-view">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
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
                        {...appt}
                        onEdit={() => handleEditAppointment(appt)}
                        onDelete={() => handleDeleteAppointment(appt.id)}
                      />
                    ))}
                  </motion.div>
                </Tab.Pane>

                {/* 3) History View */}
                <Tab.Pane eventKey="history-view">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
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
                          {...appt}
                          onEdit={() => handleEditAppointment(appt)}
                          onDelete={() => handleDeleteAppointment(appt.id)}
                        />
                      ))}
                  </motion.div>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>

        {/* Appointment Form Modal */}
        <AppointmentForm
          show={showAppointmentForm}
          handleClose={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(null);
          }}
          onSubmit={handleAppointmentSubmit}
          initialData={editingAppointment}
        />
      </Container>
    </motion.div>
  );
};

export default AppointmentCalendar;
