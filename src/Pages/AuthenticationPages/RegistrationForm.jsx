import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { FaGoogle } from "react-icons/fa";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  return (
    <>
      <Container>
        <Row className=" ">
          <div className="CreateAccountText text-center p-2">
            <h4>Welcome</h4>
            <p>Lets Get Started by creating your account</p>
          </div>
        </Row>
        <Row>
          <Form className="p-3 registrationForm">
            <Form.Group className="mb-3" controlId="formBasicUserName">
              {/* <Form.Label>User Name</Form.Label> */}
              <Form.Control
                type="text"
                placeholder="Enter User name"
                name="firstName"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              {/* <Form.Label>Email address</Form.Label> */}
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              {/* <Form.Label>Password</Form.Label> */}
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Accept Terms of Services" />
            </Form.Group>
            <Row className="justify-content-center">
              <Button variant="primary" type="submit" className=" w-50">
                Register
              </Button>
            </Row>
          </Form>
        </Row>
        <div class="divider">
          <span class="divider-text">or</span>
        </div>
        <Row className="justify-content-center p-5">
          <Button
            variant="primary"
            type="submit"
            className="d-flex align-items-center justify-content-center w-50"
            style={{ gap: "0.5rem" }}
          >
            <span>Sign Up with Google </span>
            <FaGoogle />
          </Button>
        </Row>
      </Container>
    </>
  );
};

export default RegistrationForm;
