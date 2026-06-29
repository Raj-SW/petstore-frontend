import { useState } from "react";
import { FaExclamationCircle, FaEnvelope, FaCheckCircle } from "react-icons/fa";
import AuthModal from "./AuthModal";
import AuthField from "./AuthField";

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
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setAlert(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      setAlert(`An error occurred. Please try again later. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal
      show={show}
      onHide={onHide}
      title="Reset Password"
      subtitle="Enter your email address and we'll send you instructions to reset your password."
    >
      {alert && (
        <div className="auth-alert" role="alert">
          <FaExclamationCircle size={16} style={{ flexShrink: 0 }} />
          <span>{alert}</span>
        </div>
      )}

      {success ? (
        <>
          <div className="auth-alert auth-alert--success" role="status">
            <FaCheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>Password reset instructions have been sent to your email.</span>
          </div>
          <button type="button" className="auth-link" onClick={onLoginClick} style={{ alignSelf: "center" }}>
            Back to Login
          </button>
        </>
      ) : (
        <>
          <form className="auth-form" onSubmit={handleSubmit}>
            <AuthField
              label="Email Address"
              name="email"
              type="email"
              icon={FaEnvelope}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" />{" "}
                  Sending...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>

          <button
            type="button"
            className="auth-link"
            onClick={onLoginClick}
            style={{ alignSelf: "center" }}
          >
            Back to Login
          </button>
        </>
      )}
    </AuthModal>
  );
};

export default ForgotPasswordModal;
