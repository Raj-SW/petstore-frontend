import React, { useState } from "react";
import "./AppointmentPage.css";
//Component Imports
import { Container, Col, Row, Card, Tab, Nav } from "react-bootstrap";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import AppointmentCalendar from "./AppointmentCalendar/appointmentCalendar";
import VeterinarianList from "./VeterinarianList/VeterinarianList";
import GroomerList from "./GroomerList/GroomerList";

const AppointmentPage = () => {
  const [key, setKey] = useState("dashboard");

  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Appointments Dashboard", path: "/appointments" },
  ];

  return (
    <>
      <Container className="pt-5 breadcrumb-container">
        <Row className="breadcrumb-row">
          <Breadcrumb items={breadcrumbItems} />
        </Row>
      </Container>
      <Container className="dashboard-container d-flex ">
        <Tab.Container activeKey={key} onSelect={(k) => setKey(k)}>
          <Row className="dashboard-row ">
            <Col
              xs={12}
              lg={3}
              className="appointment-page-left-col poppins-regular"
            >
              <div className="dashboard-navigation-desktop rounded-3 p-1">
                <div className="">
                  <div className="d-flex flex-row align-items-center justify-evenly mb-3">
                    <div className="user-info">
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          backgroundColor: "#ffffff",
                          borderRadius: "50%",
                        }}
                      ></div>
                      <div>
                        <p
                          className="secondary-color-font"
                          style={{ fontSize: "1rem" }}
                        >
                          Appointment Manager
                        </p>
                        <br />{" "}
                        <p
                          className=" secondary-color-font"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Manage your petcare schedule
                        </p>
                      </div>
                    </div>
                  </div>
                  <Nav className="flex-column appointmentNavTabs">
                    <Nav.Item>
                      <Nav.Link
                        eventKey="dashboard"
                        className={key === "dashboard" ? "active" : ""}
                      >
                        Dashboard
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        eventKey="vet"
                        className={key === "vet" ? "active" : ""}
                      >
                        Veterinaries
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        eventKey="grooming"
                        className={key === "grooming" ? "active" : ""}
                      >
                        Groomers
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
                <hr />
                <div className="user-info">
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      backgroundColor: "#ffffff",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <div>
                    <p
                      className="secondary-color-font "
                      style={{ fontSize: "1rem" }}
                    >
                      John Doe
                    </p>
                    <br />{" "}
                    <p
                      className="secondary-color-font"
                      style={{ fontSize: "0.8rem" }}
                    >
                      123 Main Street, Anytown USA
                    </p>
                  </div>
                </div>
              </div>
            </Col>
            <Col
              className="appointment-page-right-col"
              style={{
                minHeight: "100vh",
              }}
            >
              <Tab.Content>
                <Tab.Pane eventKey="dashboard">
                  <AppointmentCalendar />
                </Tab.Pane>
                <Tab.Pane eventKey="vet">
                  <VeterinarianList />
                </Tab.Pane>
                <Tab.Pane eventKey="grooming">
                  <GroomerList />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </>
  );
};

export default AppointmentPage;
