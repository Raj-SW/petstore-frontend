import React, { useState } from "react";
import { motion } from "framer-motion";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import authPageBackgroundImage from "../../assets/AuthenticationAssets/authpagebg.png";
import authPageBackgroundImage2 from "../../assets/AuthenticationAssets/authpagebg2.png";
import "./AuthenticationPage.css";
import RegistrationForm from "./RegistrationForm";
import Tab from "react-bootstrap/Tab";
import LoginForm from "./LoginForm";
import Nav from "react-bootstrap/Nav";

const AuthenticationPage = () => {
  const [key, setKey] = useState("register");

  const backgroundImage =
    key === "register" ? authPageBackgroundImage : authPageBackgroundImage2;

  return (
    <>
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
        className="d-none d-md-flex "
      >
        <motion.div
          key={backgroundImage}
          initial={{ x: key === "register" ? 300 : -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: key === "register" ? -300 : 300, opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
          }}
        />
        <Container>
          <Row className="justify-content-lg-end justify-content-center authRowContainer">
            <Col
              xs={12}
              sm={10}
              md={8}
              lg={5}
              className="text-start bg-white p-4 authRoundedCol shadow"
            >
              <Tab.Container
                defaultActiveKey="register"
                activeKey={key}
                onSelect={(k) => setKey(k)}
              >
                <Row className="justify-content-center px-4">
                  <Nav className="d-flex justify-content-around w-100 authNav rounded">
                    <Nav.Item>
                      <Nav.Link eventKey="register">Register</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="login">Login</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Row>
                <Tab.Content>
                  <Tab.Pane eventKey="register">
                    <RegistrationForm />
                  </Tab.Pane>
                  <Tab.Pane eventKey="login">
                    <LoginForm />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="d-block d-md-none text-white p-3">
        <Col xs={12} sm={10} md={8} lg={5} className="text-start bg-white p-4 ">
          <Tab.Container
            defaultActiveKey="register"
            activeKey={key}
            onSelect={(k) => setKey(k)}
          >
            <Row className="justify-content-center px-4">
              <Nav className="d-flex justify-content-around w-100 authNav rounded">
                <Nav.Item>
                  <Nav.Link eventKey="register">Register</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="login">Login</Nav.Link>
                </Nav.Item>
              </Nav>
            </Row>
            <Tab.Content>
              <Tab.Pane eventKey="register">
                <RegistrationForm />
              </Tab.Pane>
              <Tab.Pane eventKey="login">
                <LoginForm />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </div>
    </>
  );
};

export default AuthenticationPage;
