import React, { useState } from "react";
import {
  Modal,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
} from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
} from "react-icons/fa";

import { IconContext } from "react-icons";
import { RxAvatar } from "react-icons/rx";

import "./SignUpDropdown.css";
import brandLogoV2 from "../../../assets/Decoratives/BrandV2.png";
import catLogin from "../../../assets/Decoratives/Cat with Log In.png";
import dogLogin from "../../../assets/Decoratives/DogPic.png";

const SignUpDropdown = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toggles for password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Functions to handle modal toggling
  const handleOpenLoginModal = () => {
    setShowSignUpModal(false);
    setShowLoginModal(true);
  };

  const handleOpenSignUpModal = () => {
    setShowLoginModal(false);
    setShowSignUpModal(true);
  };

  return (
    <>
      {/* Avatar Icon to Open Login Modal */}
      <div className="avatar-padding on-hover-pointer">
        <IconContext.Provider
          value={{
            color: "white",
            className: "global-class-name",
            size: "2.5rem",
          }}
        >
          <RxAvatar onClick={handleOpenLoginModal} />
        </IconContext.Provider>
      </div>

      {/* Login Modal */}
      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        className="authModal loginModal"
        size="lg"
      >
        <Modal.Body className="authModal-body d-flex">
          <Container className="d-flex p-0 m-0 loginContainer">
            <Col className="p-3 w-100 pt-5">
              <h3 className="mb-4 text-center poppins-extrabold secondary-color-font">
                Log In to VitalPaws
              </h3>
              <Form className="poppins-regular p-4">
                <InputGroup className="mb-3">
                  <InputGroup.Text className="bg-white">
                    <FaUser className="text-success" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="SamanthaSmith"
                    className="border-start-0"
                    required
                  />
                </InputGroup>
                <InputGroup className="mb-2">
                  <InputGroup.Text className="bg-white">
                    <FaKey className="text-success" />
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="border-start-0"
                    required
                  />
                  <InputGroup.Text
                    className="bg-white"
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    {showPassword ? (
                      <FaEye className="text-muted" />
                    ) : (
                      <FaEyeSlash className="text-muted" />
                    )}
                  </InputGroup.Text>
                </InputGroup>
                <div className="text-end mb-3">
                  <a href="#" className="text-success">
                    Forgot Password?
                  </a>
                </div>
                <Form.Group className="mb-4 text-start d-flex align-items-center">
                  <Form.Check type="checkbox" id="rememberMe" />
                  <Form.Label htmlFor="rememberMe" className="ms-2">
                    Keep me logged in
                  </Form.Label>
                </Form.Group>
                <div className="text-center">
                  <Button
                    variant="success"
                    type="submit"
                    className="w-25 rounded-pill"
                    style={{ backgroundColor: "#74B49B", border: "none" }}
                  >
                    Log In
                  </Button>
                </div>
              </Form>
              <div className="d-flex align-items-center my-3 pt-4 poppins-regular">
                <div className="flex-grow-1 border-bottom"></div>
                <span className="mx-2 custom-text-color">Or Sign Up with</span>
                <div className="flex-grow-1 border-bottom"></div>
              </div>
              <IconContext.Provider
                value={{ color: "#74B49B", size: "1.5rem" }}
              >
                <div className="d-flex justify-content-center gap-3 my-3 pt-4 pb-4">
                  <FaGoogle />
                  <FaFacebook />
                </div>
              </IconContext.Provider>
              <div className="text-center pb-4 poppins-regular">
                <p className="mt-4">
                  Don't have an account?{" "}
                  <a
                    href="#"
                    style={{ color: "#76c7c0" }}
                    onClick={handleOpenSignUpModal}
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </Col>
            <Col className="loginDecoWrapper">
              <div className="p-4 d-flex justify-content-center">
                <img src={brandLogoV2} alt="" />
              </div>
              <div className="d-flex justify-content-center">
                <img src={catLogin} alt="" />
              </div>
            </Col>
          </Container>
        </Modal.Body>
      </Modal>

      {/* Sign Up Modal */}
      <Modal
        show={showSignUpModal}
        onHide={() => setShowSignUpModal(false)}
        className="authModal signUpModal"
        size="lg"
      >
        <Modal.Body className="authModal-body d-flex">
          <Container className="d-flex p-0 m-0 loginContainer">
            {/* Left Image Column */}
            <Col className="signUpDecoWrapper">
              <div className="p-4 d-flex justify-content-center">
                <img src={brandLogoV2} alt="Brand Logo" />
              </div>
              <div className="d-flex justify-content-center pt-5">
                <img src={dogLogin} alt="Cat with Log In" />
              </div>
            </Col>

            {/* Signup Form Column */}
            <Col className="p-3 w-100 pt-5">
              <h3 className="mb-4 text-center poppins-extrabold secondary-color-font">
                Create Your Account
              </h3>
              <Form className="poppins-regular p-4">
                {/* Full Name Input */}
                <InputGroup className="mb-3">
                  <InputGroup.Text className="bg-white">
                    <FaUser className="text-success" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Full Name"
                    className="border-start-0"
                    required
                  />
                </InputGroup>

                {/* Email Input */}
                <InputGroup className="mb-3">
                  <InputGroup.Text className="bg-white">
                    <FaEnvelope className="text-success" />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="E-mail"
                    className="border-start-0"
                    required
                  />
                </InputGroup>

                {/* Password Input */}
                <InputGroup className="mb-3">
                  <InputGroup.Text className="bg-white">
                    <FaKey className="text-success" />
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="border-start-0"
                    required
                  />
                  <InputGroup.Text
                    className="bg-white"
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    {showPassword ? (
                      <FaEye className="text-muted" />
                    ) : (
                      <FaEyeSlash className="text-muted" />
                    )}
                  </InputGroup.Text>
                </InputGroup>

                {/* Terms and Conditions */}
                <Form.Group className="mb-4 d-flex align-items-center">
                  <Form.Check type="checkbox" id="terms" required />
                  <Form.Label htmlFor="terms" className="ms-2 mb-0">
                    I agree to all{" "}
                    <a href="#" className="text-primary">
                      Terms & Conditions
                    </a>
                  </Form.Label>
                </Form.Group>

                {/* Sign Up Button */}
                <div className="text-center">
                  <Button
                    variant="success"
                    type="submit"
                    className="w-100 rounded-pill"
                    style={{ backgroundColor: "#74B49B", border: "none" }}
                  >
                    Sign Up
                  </Button>
                </div>
              </Form>

              {/* Divider with Social Login */}
              <div className="d-flex align-items-center my-3 pt-4 poppins-regular">
                <div className="flex-grow-1 border-bottom"></div>
                <span className="mx-2 custom-text-color">Or Sign Up with</span>
                <div className="flex-grow-1 border-bottom"></div>
              </div>

              {/* Social Media Buttons */}
              <IconContext.Provider
                value={{ color: "#74B49B", size: "1.5rem" }}
              >
                <div className="d-flex justify-content-center gap-3 my-3 pt-4 pb-4">
                  <FaGoogle />
                  <FaFacebook />
                </div>
              </IconContext.Provider>

              {/* Already Have an Account */}
              <div className="text-center pb-4 poppins-regular">
                <p className="mt-4">
                  Already have an account?{" "}
                  <a
                    href="#"
                    style={{ color: "#76c7c0" }}
                    onClick={handleOpenLoginModal}
                  >
                    Log in
                  </a>
                </p>
              </div>
            </Col>
          </Container>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SignUpDropdown;
