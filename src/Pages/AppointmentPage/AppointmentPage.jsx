import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./AppointmentPage.css";
//Component Imports
import { Container, Col, Row, Tab, Nav } from "react-bootstrap";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import AppointmentCalendar from "./AppointmentCalendar/appointmentCalendar";
import ProfessionalList from "@/Components/HelperComponents/ProfessionalList/ProfessionalList";
import { useAuth } from "@/context/AuthContext";

const AppointmentPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Get initial tab from URL or default to veterinarians
  const initialTab = searchParams.get("tab") || "veterinarians";
  const [key, setKey] = useState(initialTab);

  // Effect to handle tab changes when user logs out
  useEffect(() => {
    if (!user && key === "dashboard") {
      setKey("veterinarians");
      setSearchParams({ tab: "veterinarians" });
    }
  }, [user, key, setSearchParams]);

  // Update URL when tab changes
  const handleTabChange = (tabKey) => {
    setKey(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // Sync tab with URL changes
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== key) {
      // Validate tab exists
      const validTabs = ["dashboard", "veterinarians", "groomers"];
      if (validTabs.includes(urlTab)) {
        // Only allow dashboard for authenticated users
        if (urlTab === "dashboard" && !user) {
          setKey("veterinarians");
          setSearchParams({ tab: "veterinarians" });
        } else {
          setKey(urlTab);
        }
      }
    }
  }, [searchParams, key, user, setSearchParams]);

  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Appointments Dashboard", path: "/appointments" },
  ];

  return (
    <>
      <Container className="pt-5 breadcrumb-container mb-5">
        <Row className="breadcrumb-row">
          <Breadcrumb items={breadcrumbItems} />
        </Row>
      </Container>
      <Container className="dashboard-container d-flex ">
        <Tab.Container activeKey={key} onSelect={handleTabChange}>
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
                  <Nav
                    className="flex-column appointmentNavTabs"
                    role="tablist"
                    aria-label="Appointment navigation"
                  >
                    {user && (
                      <Nav.Item role="presentation">
                        <Nav.Link
                          eventKey="dashboard"
                          className={key === "dashboard" ? "active" : ""}
                          role="tab"
                          aria-selected={key === "dashboard"}
                          aria-controls="dashboard-panel"
                        >
                          Dashboard
                        </Nav.Link>
                      </Nav.Item>
                    )}
                    <Nav.Item role="presentation">
                      <Nav.Link
                        eventKey="veterinarians"
                        className={key === "veterinarians" ? "active" : ""}
                        role="tab"
                        aria-selected={key === "veterinarians"}
                        aria-controls="veterinarians-panel"
                      >
                        Veterinarians
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item role="presentation">
                      <Nav.Link
                        eventKey="groomers"
                        className={key === "groomers" ? "active" : ""}
                        role="tab"
                        aria-selected={key === "groomers"}
                        aria-controls="groomers-panel"
                      >
                        Groomers
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item role="presentation">
                      <Nav.Link
                        eventKey="trainers"
                        className={key === "trainer" ? "active" : ""}
                        role="tab"
                        aria-selected={key === "trainer"}
                        aria-controls="trainer-panel"
                      >
                        Trainers
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item role="presentation">
                      <Nav.Link
                        eventKey="petTaxi"
                        className={key === "petTaxi" ? "active" : ""}
                        role="tab"
                        aria-selected={key === "petTaxi"}
                        aria-controls="petTaxi-panel"
                      >
                        Pet Taxi
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
                <hr />
                <div className="user-info">
                  <div
                    className="user-avatar"
                    style={{
                      width: "3rem",
                      height: "3rem",
                      backgroundColor: "#ffffff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "var(--secondary-color)",
                    }}
                  >
                    {user ? user.name?.charAt(0).toUpperCase() : "G"}
                  </div>
                  <div>
                    <p
                      className="secondary-color-font "
                      style={{ fontSize: "1rem" }}
                    >
                      {user ? user.name : "Guest User"}
                    </p>
                    <br />{" "}
                    <p
                      className="secondary-color-font"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {user
                        ? user.address || "Address not provided"
                        : "Please login to view your address"}
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
                {user && (
                  <Tab.Pane
                    eventKey="dashboard"
                    id="dashboard-panel"
                    role="tabpanel"
                    aria-labelledby="dashboard-tab"
                  >
                    <AppointmentCalendar />
                  </Tab.Pane>
                )}
                <Tab.Pane
                  eventKey="veterinarians"
                  id="veterinarians-panel"
                  role="tabpanel"
                  aria-labelledby="veterinarians-tab"
                >
                  <ProfessionalList
                    role="veterinarian"
                    className="veterinarian-list-container"
                  />
                </Tab.Pane>
                <Tab.Pane
                  eventKey="groomers"
                  id="groomers-panel"
                  role="tabpanel"
                  aria-labelledby="groomers-tab"
                >
                  <ProfessionalList
                    role="groomer"
                    className="groomer-list-container"
                  />
                </Tab.Pane>
                <Tab.Pane
                  eventKey="trainers"
                  id="trainers-panel"
                  role="tabpanel"
                  aria-labelledby="trainers-tab"
                >
                  <ProfessionalList
                    role="trainer"
                    className="trainer-list-container"
                  />
                </Tab.Pane>
                <Tab.Pane
                  eventKey="petTaxi"
                  id="petTaxi-panel"
                  role="tabpanel"
                  aria-labelledby="petTaxi-tab"
                >
                  <ProfessionalList
                    role="petTaxi"
                    className="petTaxi-list-container"
                  />
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
