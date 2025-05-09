import React from "react";
import PropTypes from "prop-types";
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
import brandLogoV2 from "../../../assets/Decoratives/BrandV2.png";
import dogLogin from "../../../assets/Decoratives/DogPic.png";
import useFormValidation from "../../../Pages/AuthenticationPages/useFormValidation";

const SignUpModal = ({
  show,
  onHide,
  showPassword,
  togglePasswordVisibility,
  onLoginClick,
}) => {
  const { formData, errors, handleInputChange } = useFormValidation({
    fullName: "",
    email: "",
    password: "",
  });

  return (
    <Modal
      show={show}
      onHide={onHide}
      className="authModal signUpModal"
      size="lg"
    >
      <Modal.Body className="authModal-body d-flex">
        <Container className="d-flex p-0 m-0 loginContainer">
          <Col className="signUpDecoWrapper d-none d-lg-flex flex-column align-items-center justify-content-center">
            <div className="p-4 d-flex justify-content-center">
              <img src={brandLogoV2} alt="Brand Logo" />
            </div>
            <div className="d-flex justify-content-center align-items-center">
              <img src={dogLogin} alt="Login Dog" className="signup-dog-img" />
            </div>
          </Col>
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
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  className="border-start-0"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {errors.fullName && (
                <div className="form-error">{errors.fullName}</div>
              )}
              {/* Email Input */}
              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-white">
                  <FaEnvelope className="text-success" />
                </InputGroup.Text>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="E-mail"
                  className="border-start-0"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {errors.email && <div className="form-error">{errors.email}</div>}
              {/* Password Input */}
              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-white">
                  <FaKey className="text-success" />
                </InputGroup.Text>
                <Form.Control
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="border-start-0"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
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
              {errors.password && (
                <div className="form-error">{errors.password}</div>
              )}
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
                  className="w-100 rounded-pill signup-btn"
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
            <IconContext.Provider value={{ color: "#74B49B", size: "1.5rem" }}>
              <div className="d-flex justify-content-center gap-3 my-3 pt-4 pb-4">
                <FaGoogle />
                <FaFacebook />
              </div>
            </IconContext.Provider>
            {/* Already Have an Account */}
            <div className="text-center pb-4 poppins-regular">
              <p className="mt-4">
                Already have an account?{" "}
                <a href="#" style={{ color: "#76c7c0" }} onClick={onLoginClick}>
                  Log in
                </a>
              </p>
            </div>
          </Col>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

SignUpModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  togglePasswordVisibility: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
};

export default SignUpModal;
