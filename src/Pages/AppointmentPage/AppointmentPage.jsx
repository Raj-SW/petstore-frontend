import React, { useState, us } from "react";
import "./AppointmentPage.css";
import AppointmentCard from "@/Components/HelperComponents/AppointmentCard/AppointmentCard";
//Component Imports
import { Container, Col, Row, Button } from "react-bootstrap";
import { HiMenuAlt2 } from "react-icons/hi";

const AppointmentPage = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <>
      <Container fluid>
        {/* Toggle button visible only on mobile */}
        <Button
          variant="light"
          className="d-lg-none position-fixed"
          onClick={toggleSidebar}
          style={{ zIndex: 1030, top: "1rem", left: "1rem" }}
        >
          <HiMenuAlt2 size={24} />
        </Button>

        <Row>
          {/* Left Column / Sidebar */}
          <Col
            xs={12}
            lg={3}
            className={`appointment-page-left-col ${
              showSidebar ? "show" : ""
            } d-lg-block`}
          >
            <h1>Appointments</h1>
          </Col>

          {/* Main Content Area */}
          <Col
            xs={12}
            lg={9}
            className="appointment-page-right-col"
            style={{
              minHeight: "100vh",
              backgroundColor: "#ffffff",
              paddingLeft: "2rem",
              paddingRight: "2rem",
            }}
          >
            <h1>Appointments</h1>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AppointmentPage;
