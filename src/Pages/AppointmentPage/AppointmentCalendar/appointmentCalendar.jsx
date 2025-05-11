import React, { useState } from "react";
import { Container, Row, Col, Tab, Nav, Dropdown } from "react-bootstrap";
import Calendar from "react-calendar";
import SearchBar from "@/Components/HelperComponents/SearchBar/SearchBar";
import "react-calendar/dist/Calendar.css";
import "./appointmentCalendar.css";

const AppointmentCalendar = () => {
  const [activeKey, setActiveKey] = useState("calendar-view");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState("all");

  const handleSelect = (eventKey) => {
    setFilter(eventKey);
    // …your filtering logic here…
  };

  const filterLabel = {
    all: "All Appointments",
    vet: "Vet Appointments",
    grooming: "Grooming Appointments",
  }[filter];

  return (
    <Container fluid>
      <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
        {/* Header row: Nav | Dropdown | Search */}
        <Row className="align-items-top mb-4  dashboard-header-row">
          {/* 1) Nav pills, auto-width */}
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

          {/* 2) Filter dropdown, auto-width */}
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

        {/* Content */}
        <Row>
          <Col>
            <Tab.Content>
              <Tab.Pane eventKey="calendar-view">
                {/* Replace with your week-view scheduler */}
                <div className="d-flex">
                  <div className="flex-grow-1">
                    <p>
                      (Insert your full-calendar or big-calendar week view here)
                    </p>
                  </div>
                  <div style={{ width: 250, marginLeft: 20 }}>
                    <Calendar onChange={setSelectedDate} value={selectedDate} />
                  </div>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="list-view">
                <h4>Upcoming Appointments</h4>
                <ul className="list-group">
                  <li className="list-group-item">Vet – March 1, 10:00 AM</li>
                  <li className="list-group-item">
                    Grooming – March 3, 2:00 PM
                  </li>
                  <li className="list-group-item">
                    Check-up – March 10, 9:00 AM
                  </li>
                </ul>
              </Tab.Pane>

              <Tab.Pane eventKey="history-view">
                <h4>Past Appointments</h4>
                <p>(Show completed appointments here.)</p>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default AppointmentCalendar;
