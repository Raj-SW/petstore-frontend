import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FaTimes, FaExclamationCircle, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./AuthModals.css";

const ForgotPasswordModal = ({ show, onHide, onLoginClick }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setAlert({
          type: "danger",
          message:
            data.message || "Failed to send reset email. Please try again.",
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
    <Modal show={show} onHide={onHide} className="authModal" size="md" centered>
      <Modal.Header className="border-0 position-relative">
        <Button
          variant="link"
          className="position-absolute primary-color-font close-button"
          onClick={onHide}
        >
          <FaTimes size={22} />
        </Button>
      </Modal.Header>
      <Modal.Body className="authModal-body">
        <div className="text-center mb-4">
          <h3 className="poppins-extrabold primary-color-font">
            Reset Password
          </h3>
          <p className="text-muted">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        {alert && (
          <Alert
            variant={alert.type}
            className="mb-3 d-flex align-items-center gap-2"
            style={{ background: "var(--error-light)", border: "none" }}
          >
            <FaExclamationCircle
              className="flex-shrink-0"
              size={22}
              style={{ color: "#D32F2F" }}
            />
            <div className="flex-grow-1">{alert.message}</div>
          </Alert>
        )}

        {success ? (
          <div className="text-center">
            <Alert variant="success">
              Password reset instructions have been sent to your email.
            </Alert>
            <Button
              variant="link"
              className="text-primary"
              onClick={onLoginClick}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} className="p-4">
            <Form.Group className="mb-4">
              <Form.Label>Email Address</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaEnvelope className="text-primary" />
                </span>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </div>

            <div className="text-center mt-3">
              <Button
                variant="link"
                className="text-primary"
                onClick={onLoginClick}
              >
                Back to Login
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ForgotPasswordModal;
