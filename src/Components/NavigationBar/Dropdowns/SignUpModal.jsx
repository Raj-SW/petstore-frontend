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
} from "react-icons/fa";
import { IconContext } from "react-icons";
import brandLogoV2 from "../../../assets/Decoratives/BrandV2.png";
import dogLogin from "../../../assets/Decoratives/DogPic.png";
import { useAuth } from "../../../context/AuthContext";
import AuthService from "../../../Services/authService";

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
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  className="border-start-0"
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
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </InputGroup>

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

              <div className="text-center">
                <Button
                  variant="success"
                  type="submit"
                  className="w-100 rounded-pill signup-btn"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
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
