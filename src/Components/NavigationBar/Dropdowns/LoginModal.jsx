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
  FaKey,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import brandLogoV2 from "../../../assets/Decoratives/BrandV2.png";
import catLogin from "../../../assets/Decoratives/Cat with Log In.png";
import { useAuth } from "../../../context/AuthContext";
import AuthService from "../../../Services/authService";

const LoginModal = ({
  show,
  onHide,
  showPassword,
  togglePasswordVisibility,
  onSignUpClick,
}) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
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
      const result = await login(formData.username, formData.password);
      if (result.success) {
        onHide();
      } else {
        setAlert({
          type: "danger",
          message: result.error || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message: error.message || "An error occurred during login.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setAlert(null);

    try {
      // Implement social login logic here
      const result = await AuthService.socialLogin(provider);
      if (result.success) {
        onHide();
      } else {
        setAlert({
          type: "danger",
          message:
            result.error || `${provider} login failed. Please try again.`,
        });
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message: error.message || `An error occurred during ${provider} login.`,
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
      size="lg"
    >
      <Modal.Body className="authModal-body d-flex">
        <Container className="d-flex p-0 m-0 loginContainer">
          <Col className="p-3 w-100 pt-5">
            <h3 className="mb-4 text-center poppins-extrabold secondary-color-font">
              Log In to VitalPaws
            </h3>
            {alert && (
              <Alert variant={alert.type} className="mb-3">
                {alert.message}
              </Alert>
            )}
            <Form className="poppins-regular p-4" onSubmit={handleSubmit}>
              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-white">
                  <FaUser className="text-success" />
                </InputGroup.Text>
                <Form.Control
                  name="username"
                  type="text"
                  placeholder="SamanthaSmith"
                  className="border-start-0"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  isInvalid={!!errors.username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </InputGroup>

              <InputGroup className="mb-2">
                <InputGroup.Text className="bg-white">
                  <FaKey className="text-success" />
                </InputGroup.Text>
                <Form.Control
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="border-start-0"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  isInvalid={!!errors.password}
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
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
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
                  className="w-25 rounded-pill login-btn"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </Form>

            <div className="d-flex align-items-center my-3 pt-4 poppins-regular">
              <div className="flex-grow-1 border-bottom"></div>
              <span className="mx-2 custom-text-color">Or Sign Up with</span>
              <div className="flex-grow-1 border-bottom"></div>
            </div>

            <IconContext.Provider value={{ color: "#74B49B", size: "1.5rem" }}>
              <div className="d-flex justify-content-center gap-3 my-3 pt-4 pb-4">
                <FaGoogle
                  onClick={() => handleSocialLogin("google")}
                  style={{ cursor: "pointer" }}
                />
                <FaFacebook
                  onClick={() => handleSocialLogin("facebook")}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </IconContext.Provider>

            <div className="text-center pb-4 poppins-regular">
              <p className="mt-4">
                Don't have an account?{" "}
                <a
                  href="#"
                  style={{ color: "#76c7c0" }}
                  onClick={onSignUpClick}
                >
                  Sign up
                </a>
              </p>
            </div>
          </Col>

          <Col className="loginDecoWrapper d-none d-lg-flex flex-column align-items-center justify-content-center">
            <Col className="loginDecoWrapper">
              <div className="p-4 d-flex justify-content-center">
                <img src={brandLogoV2} alt="Brand Logo" />
              </div>
              <div className="d-flex justify-content-center">
                <img src={catLogin} alt="Login Cat" />
              </div>
            </Col>
          </Col>
        </Container>
      </Modal.Body>
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
