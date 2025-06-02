import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./AuthModals.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setAlert({
        type: "danger",
        message:
          "Invalid or expired reset token. Please request a new password reset.",
      });
    }
    setToken(token);
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setAlert({
        type: "danger",
        message: "Password must be at least 8 characters long.",
      });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setAlert({
        type: "danger",
        message: "Passwords do not match.",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({
          type: "success",
          message:
            "Password has been reset successfully. You can now login with your new password.",
        });
        // Optionally auto-login the user
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setAlert({
          type: "danger",
          message:
            data.message || "Failed to reset password. Please try again.",
        });
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message: "An error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="poppins-extrabold primary-color-font">
                  Reset Your Password
                </h3>
                <p className="text-muted">
                  Please enter your new password below.
                </p>
              </div>

              {alert && (
                <Alert
                  variant={alert.type}
                  className="mb-3 d-flex align-items-center gap-2"
                  style={{ background: "var(--error-light)", border: "none" }}
                >
                  <div className="flex-grow-1">{alert.message}</div>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <FaLock className="text-primary" />
                    </span>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      className="bg-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <FaLock className="text-primary" />
                    </span>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </div>

                <div className="text-center mt-3">
                  <Button
                    variant="link"
                    className="text-primary"
                    onClick={() => navigate("/login")}
                  >
                    Back to Login
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
