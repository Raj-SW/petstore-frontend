import React, { useState } from "react";
import loginLottie from "../../assets/AuthenticationAssets/loginLottie.json";
import Lottie from "react-lottie";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FaGoogle } from "react-icons/fa";
import Container from "react-bootstrap/Container";
import "./LoginForm.css";
const LoginForm = () => {
  return (
    <>
      <div className="loginFormWrapper">
        <div className="formContainer">
          <Row className=" ">
            <div className="CreateAccountText text-center p-2">
              <h4>Hello there!</h4>
              <p>Glad you are back</p>
            </div>
          </Row>
          <Form className="loginform-container p-4">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
              />
              <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
              <Form.Control.Feedback type="valid">
                Looks good!
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
              />
              <Form.Control.Feedback type="invalid"></Form.Control.Feedback>
              <Form.Control.Feedback type="valid">
                Looks good!
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="justify-content-center">
              <Button variant="primary" type="submit" className=" w-50">
                Log In
              </Button>
            </Row>
          </Form>
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
              <span>Sign In with Google </span>
              <FaGoogle />
            </Button>
          </Row>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
