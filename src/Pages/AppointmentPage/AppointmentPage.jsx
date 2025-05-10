import React, { useState } from "react";
import "./AppointmentPage.css";
import AppointmentCard from "@/Components/HelperComponents/AppointmentCard/AppointmentCard";
//Component Imports
import { Container, Col, Row, Card, Tab, Nav } from "react-bootstrap";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";

const AppointmentPage = () => {
  const [key, setKey] = useState("dashboard");

  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Appointments Dashboard", path: "/appointments" },
  ];

  return (
    <>
      <Container fluid>
        <Container className="pt-5 ">
          <Row>
            <Breadcrumb items={breadcrumbItems} />
          </Row>
        </Container>
        <Container className="p-0 ">
          <Tab.Container activeKey={key} onSelect={(k) => setKey(k)}>
            <Row>
              <Col
                xs={12}
                lg={3}
                className="appointment-page-left-col poppins-regular"
              >
                <div className="w-100 rounded-3 dashboard-navigation-desktop p-3">
                  <div className="">
                    <div className="d-flex flex-row align-items-center justify-evenly mb-3">
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          backgroundColor: "#ffffff",
                          borderRadius: "50%",
                        }}
                      ></div>
                      <div>
                        <span className="" style={{ fontSize: "1rem" }}>
                          Appointment Manager
                        </span>
                        <br />{" "}
                        <span className="" style={{ fontSize: "0.8rem" }}>
                          Manage your pet care schedule
                        </span>
                      </div>
                    </div>
                    <Nav variant="pills" className="flex-column">
                      <Nav.Item>
                        <Nav.Link
                          eventKey="dashboard"
                          style={{ color: "#ffffff" }}
                        >
                          Dashboard
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="vet" style={{ color: "#ffffff" }}>
                          Vet Appointments
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link
                          eventKey="grooming"
                          style={{ color: "#ffffff" }}
                        >
                          Grooming Appointments
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link
                          eventKey="settings"
                          style={{ color: "#ffffff" }}
                        >
                          Settings
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>
                </div>
              </Col>
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
                <Tab.Content>
                  <Tab.Pane eventKey="dashboard">
                    <h5>Dashboard</h5>
                  </Tab.Pane>
                  <Tab.Pane eventKey="vet">
                    <h5>Vet Appointments</h5>
                  </Tab.Pane>
                  <Tab.Pane eventKey="grooming">
                    <h5>Grooming Appointments</h5>
                  </Tab.Pane>
                  <Tab.Pane eventKey="settings">
                    <h5>Settings</h5>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Container>
      </Container>
    </>
  );
};

export default AppointmentPage;
