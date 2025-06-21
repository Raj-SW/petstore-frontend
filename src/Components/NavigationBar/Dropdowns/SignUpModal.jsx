import { useState } from "react";
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
  FaExclamationCircle,
  FaUserPlus,
  FaTimes,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import "./SignUpModal.css";

const SignUpModal = ({
  show,
  onHide,
  showPassword,
  togglePasswordVisibility,
  onLoginClick,
}) => {
  const { signup } = useAuth();
  const { showAuthToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s-]{8,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setAlert(null);

    try {
      const result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });

      if (result.success) {
        showAuthToast("signup", "success");
        onHide();
      } else {
        setAlert({
          type: "error",
          message: result.error || "Signup failed. Please try again.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: `An unexpected error occurred. Please try again. \n${error.message}`,
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
      size="md"
      centered
    >
      <Modal.Header className="border-0 d-flex justify-content-end p-2">
        <Button
          variant="link"
          className="primary-color-font login-close-button"
          onClick={onHide}
        >
          <FaTimes className="" size={24} />
        </Button>
      </Modal.Header>
      <Modal.Body className="authModal-body d-flex">
        <Container className="d-flex p-0 m-0 loginContainer">
          <Col className="w-100 pt-2">
            <h3 className="mb-2 text-center poppins-extrabold secondary-color-font">
              Create Your Account
            </h3>
            {alert && (
              <Alert
                variant="danger"
                className="d-flex align-items-center gap-2 custom-login-alert"
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
                  name="name"
                  type="text"
                  placeholder="Name"
                  className="border-start-0 rounded-end-4 outlined-input"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
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
                  <FaPhone />
                </InputGroup.Text>
                <Form.Control
                  name="phoneNumber"
                  type="tel"
                  placeholder="Phone Number"
                  className="border-start-0 rounded-end-4 outlined-input"
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </InputGroup>

              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-white rounded-start-4 secondary-color-font">
                  <FaMapMarkerAlt />
                </InputGroup.Text>
                <Form.Control
                  name="address"
                  type="text"
                  placeholder="Address"
                  className="border-start-0 rounded-end-4 outlined-input"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  isInvalid={!!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
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
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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
                  type="submit"
                  className="btn-primary d-flex align-items-center justify-content-center gap-2 rounded-5 signup-btn w-75 mx-auto"
                  disabled={loading}
                >
                  <FaUserPlus className="mb-1" />
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </div>
            </Form>

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
