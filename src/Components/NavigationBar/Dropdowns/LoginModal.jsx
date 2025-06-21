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
  FaKey,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaTimes,
  FaSignInAlt,
  FaExclamationCircle,
  FaEnvelope,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import AuthService from "../../../Services/authService";
import ForgotPasswordModal from "../../Auth/ForgotPasswordModal";
import "./LoginModal.css";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const LoginModal = ({
  show,
  onHide,
  showPassword,
  togglePasswordVisibility,
  onSignUpClick,
}) => {
  const { login } = useAuth();
  const { showAuthToast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
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
      const result = await login(formData.email, formData.password);
      if (result.success) {
        showAuthToast("login", "success");
        onHide();
      } else {
        setAlert({
          type: "error",
          message: result.error || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setAlert(null);
    try {
      const result = await AuthService.socialLogin(provider);
      if (result.success) {
        onHide();
      } else {
        setAlert({
          type: "error",
          message:
            result.error || `${provider} login failed. Please try again.`,
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Social login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      className="authModal loginModal"
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
          <Col className="p-3 w-100 pt-4">
            <h3 className="mb-4 text-center poppins-extrabold primary-color-font">
              Log In to VitalPaws
            </h3>
            {alert && (
              <Alert
                variant={alert.type}
                className="mb-3 d-flex align-items-center gap-2 custom-login-alert m-4"
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
              className="login-form poppins-regular p-4"
              onSubmit={handleSubmit}
            >
              <Form.Group className="mb-3">
                <InputGroup hasValidation>
                  <InputGroup.Text className="bg-white rounded-start-4">
                    <FaEnvelope className="text-primary " />
                  </InputGroup.Text>
                  <Form.Control
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="border-start-0 rounded-end-4"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <InputGroup hasValidation>
                  <InputGroup.Text className="bg-white rounded-start-4">
                    <FaKey className="text-primary " />
                  </InputGroup.Text>
                  <Form.Control
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="border-start-0"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password}
                  />
                  <InputGroup.Text
                    className="bg-white rounded-end-4"
                    style={{ cursor: "pointer" }}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="secondary-color-font" />
                    ) : (
                      <FaEye className="secondary-color-font" />
                    )}
                  </InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check
                  type="checkbox"
                  id="rememberMe"
                  label="Remember me"
                  className="text-primary"
                />
                <Button
                  variant="link"
                  className="text-primary text-decoration-none p-0"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </Button>
              </div>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  className="btn-primary d-flex align-items-center justify-content-center gap-3 p-0 pt-2 pb-2 rounded-5"
                  disabled={loading}
                >
                  <FaSignInAlt className="" />
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </div>
            </Form>

            <div className="social-login-divider">
              <span>Or Sign Up with</span>
            </div>

            <IconContext.Provider
              value={{ color: "var(--primary-blue-color)", size: "1.5rem" }}
            >
              <div className="social-icons">
                <FaGoogle onClick={() => handleSocialLogin("google")} />
                <FaFacebook onClick={() => handleSocialLogin("facebook")} />
              </div>
            </IconContext.Provider>

            <div className="signup-link">
              <p className="mt-4 text-primary">
                Don't have an account?{" "}
                <a href="#" onClick={onSignUpClick}>
                  Sign up
                </a>
              </p>
            </div>
          </Col>
        </Container>
      </Modal.Body>

      <ForgotPasswordModal
        show={showForgotPassword}
        onHide={() => setShowForgotPassword(false)}
        onLoginClick={() => setShowForgotPassword(false)}
      />
    </Modal>
  );
};

LoginModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  togglePasswordVisibility: PropTypes.func.isRequired,
  onSignUpClick: PropTypes.func.isRequired,
};

export default LoginModal;
