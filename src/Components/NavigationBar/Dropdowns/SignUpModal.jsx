import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Alert,
} from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaExclamationCircle,
  FaUserPlus,
  FaTimes,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import brandLogoV2 from "../../../assets/Decoratives/BrandV2.png";
import dogLogin from "../../../assets/Decoratives/DogPic.png";
import { useAuth } from "../../../context/AuthContext";
import AuthService from "../../../Services/authService";
import "./SignUpModal.css";
const SignUpModal = ({
  show,
  onHide,
  showPassword,
  togglePasswordVisibility,
  onLoginClick,
}) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setAlert(null);

    try {
      const result = await signup(formData);
      if (result.success) {
        onHide();
      } else {
        setAlert({
          type: "danger",
          message: result.error || "Signup failed. Please try again.",
        });
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message: error.message || "An error occurred during signup.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    setLoading(true);
    setAlert(null);

    try {
      // Implement social signup logic here
      const result = await AuthService.socialSignup(provider);
      if (result.success) {
        onHide();
      } else {
        setAlert({
          type: "danger",
          message:
            result.error || `${provider} signup failed. Please try again.`,
        });
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message:
          error.message || `An error occurred during ${provider} signup.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setAlert(null);
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="authModal signUpModal"
      size="lg"
    >
      <Modal.Header
        className="border-0 position-relative m-2 p-0"
        style={{ minHeight: 0 }}
      >
        <Button
          variant="link"
          className="position-absolute signup-close-button"
          style={{ right: 10, top: 10, zIndex: 2 }}
          onClick={handleClose}
          aria-label="Close"
        >
          <FaTimes size={22} />
        </Button>
      </Modal.Header>
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
            {alert && (
              <Alert
                variant="danger"
                className="mb-3 d-flex align-items-center gap-2 custom-login-alert"
                style={{ background: "var(--error-light)", border: "none" }}
                role="alert"
              >
                <FaExclamationCircle
                  className="flex-shrink-0"
                  size={22}
                  style={{ color: "#D32F2F" }}
                />
                <div className="flex-grow-1">{alert.message}</div>
              </Alert>
            )}
            <Form
              className="poppins-regular p-4 signup-form"
              onSubmit={handleSubmit}
            >
              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-white rounded-start-4 secondary-color-font">
                  <FaUser />
                </InputGroup.Text>
                <Form.Control
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  className="border-start-0 rounded-end-4 outlined-input"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  isInvalid={!!errors.fullName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fullName}
                </Form.Control.Feedback>
              </InputGroup>

              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-white rounded-start-4 secondary-color-font">
                  <FaEnvelope />
                </InputGroup.Text>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="E-mail"
                  className="border-start-0 rounded-end-4 outlined-input"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </InputGroup>

              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-white rounded-start-4 secondary-color-font">
                  <FaKey />
                </InputGroup.Text>
                <Form.Control
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="border-start-0 outlined-input"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  isInvalid={!!errors.password}
                />
                <InputGroup.Text
                  className="bg-white rounded-end-4 secondary-color-font"
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </InputGroup>

              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-white rounded-start-4 secondary-color-font">
                  <FaKey />
                </InputGroup.Text>
                <Form.Control
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="border-start-0 outlined-input"
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  isInvalid={!!errors.confirmPassword}
                />
                <InputGroup.Text
                  className="bg-white rounded-end-4 secondary-color-font"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  style={{ cursor: "pointer" }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </InputGroup>

              <Form.Group className="mb-4 d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  id="terms"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  isInvalid={!!errors.terms}
                />
                <Form.Label htmlFor="terms" className="ms-2 mb-0">
                  I agree to all{" "}
                  <a href="#" className="text-primary">
                    Terms & Conditions
                  </a>
                </Form.Label>
                <Form.Control.Feedback type="invalid">
                  {errors.terms}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  className="btn-primary d-flex align-items-center justify-content-center gap-2 rounded-5 signup-btn "
                  disabled={loading}
                >
                  <FaUserPlus className="mb-1" />
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </div>
            </Form>

            <div className="d-flex align-items-center  poppins-regular">
              <div className="flex-grow-1 border-bottom"></div>
              <span className="mx-2 primary-color-font">Or Sign Up with</span>
              <div className="flex-grow-1 border-bottom"></div>
            </div>

            <IconContext.Provider value={{ size: "1.5rem" }}>
              <div className="d-flex justify-content-center gap-3 my-3  ">
                <FaGoogle
                  onClick={() => handleSocialSignup("google")}
                  style={{ cursor: "pointer" }}
                />
                <FaFacebook
                  onClick={() => handleSocialSignup("facebook")}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </IconContext.Provider>

            <div className="text-center pb-4 poppins-regular">
              <p className="mt-4 login-link">
                Already have an account?{" "}
                <a href="#" onClick={onLoginClick}>
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
