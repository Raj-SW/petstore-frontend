import React, { useState } from "react";
// CSS
import "react-calendar/dist/Calendar.css";
import "./appointmentCalendar.css";
// Components
import { Container, Row, Col, Tab, Nav, Dropdown } from "react-bootstrap";
import Calendar from "react-calendar";
import AppointmentCard from "@/Components/HelperComponents/AppointmentCard/AppointmentCard";

const AppointmentCalendar = () => {
  const [activeKey, setActiveKey] = useState("calendar-view");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState("all");

  // 1) Mock appointments using a single ISO datetime
  const appointments = [
    {
      id: 1,
      title: "Vet Checkup",
      datetimeISO: "2025-05-16T09:00:00",
      description: "Annual wellness exam for Bella",
      status: "Confirmed",
      type: "vet",
      role: "Veterinarian",
      location: "Trou Aux Biches",
      icon: "/images/vet-avatar-1.jpg",
    },
    {
      id: 2,
      title: "Grooming Session",
      datetimeISO: "2025-05-16T11:00:00",
      description: "Full groom and nail trim",
      status: "Pending",
      type: "grooming",
      role: "Groomer",
      location: "Grand Baie",
      icon: "/images/groomer-avatar-1.jpg",
    },
    {
      id: 3,
      title: "Vaccination",
      datetimeISO: "2025-05-17T14:00:00",
      description: "Rabies booster for Max",
      status: "Confirmed",
      type: "vet",
      role: "Veterinarian",
      location: "Pamplemousses",
      icon: "/images/vet-avatar-2.jpg",
    },
    {
      id: 4,
      title: "Bath & Blow-Dry",
      datetimeISO: "2025-05-18T10:00:00",
      description: "Deluxe bath with conditioning treatment",
      status: "Cancelled",
      type: "grooming",
      role: "Groomer",
      location: "Trou Aux Biches",
      icon: "/images/groomer-avatar-2.jpg",
    },
  ];

  // 2) Filter logic
  const filtered =
    filter === "all"
      ? appointments
      : appointments.filter((a) => a.type === filter);

  const handleSelect = (eventKey) => {
    setFilter(eventKey);
  };

  const filterLabel = {
    all: "All Appointments",
    vet: "Vet Appointments",
    grooming: "Grooming Appointments",
  }[filter];

  return (
    <Container fluid>
      <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
        {/* HEADER: pills + dropdown */}
        <Row className="align-items-center mb-4 dashboard-header-row">
          <Col xs="auto">
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

          <Col xs="auto">
            <Dropdown onSelect={handleSelect}>
              <Dropdown.Toggle
                variant="outline-secondary"
                id="appointment-filter-dd"
              >
                {filterLabel}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="all">All Appointments</Dropdown.Item>
                <Dropdown.Item eventKey="vet">Vet Appointments</Dropdown.Item>
                <Dropdown.Item eventKey="grooming">
                  Grooming Appointments
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

        {/* CONTENT */}
        <Row>
          <Col>
            <Tab.Content>
              {/* 1) Calendar View */}
              <Tab.Pane eventKey="calendar-view">
                <div className="d-flex ">
                  <div className="flex-grow-1 gap-3 d-flex flex-wrap mb-3">
                    {filtered.length === 0 ? (
                      <p>No appointments found.</p>
                    ) : (
                      filtered.map((appt) => (
                        <AppointmentCard
                          key={appt.id}
                          title={appt.title}
                          datetimeISO={appt.datetimeISO}
                          description={appt.description}
                          status={appt.status}
                          role={appt.role}
                          location={appt.location}
                          icon={appt.icon}
                        />
                      ))
                    )}
                  </div>

                  {/* Mini calendar */}
                  <div style={{ width: 250, marginLeft: 20 }}>
                    <Calendar onChange={setSelectedDate} value={selectedDate} />
                  </div>
                </div>
              </Tab.Pane>

              {/* 2) List View */}
              <Tab.Pane eventKey="list-view">
                <h4>Upcoming Appointments</h4>
                {filtered.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    title={appt.title}
                    datetimeISO={appt.datetimeISO}
                    description={appt.description}
                    status={appt.status}
                    role={appt.role}
                    location={appt.location}
                    icon={appt.icon}
                  />
                ))}
              </Tab.Pane>

              {/* 3) History View */}
              <Tab.Pane eventKey="history-view">
                <h4>Past Appointments</h4>
                <p>(Display past/archived appointments here.)</p>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default AppointmentCalendar;
