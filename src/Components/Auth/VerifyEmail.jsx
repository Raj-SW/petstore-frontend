import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import authApi from "../../Services/api/authApi";
import "./AuthModals.css";
import "./VerifyEmail.css";

/**
 * Landing page for the emailed verification link
 * (frontendUrl(`verify-email/<token>`) built by the backend).
 */
const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err?.message || "This verification link is invalid or has expired.");
      });
  }, [token]);

  return (
    <main className="ve-page">
      <div className="ve-card" role="status" aria-live="polite">
        {status === "verifying" && (
          <>
            <span className="auth-spinner ve-spinner" aria-hidden="true" />
            <h1 className="ve-title">Verifying your email…</h1>
            <p className="ve-text">Hang tight, this only takes a second.</p>
          </>
        )}

        {status === "success" && (
          <>
            <FaCheckCircle className="ve-icon ve-icon--success" aria-hidden="true" />
            <h1 className="ve-title">Email verified!</h1>
            <p className="ve-text">
              Your email address is confirmed. You can now log in to your
              VitalPaws account.
            </p>
            <Link to="/home" className="ve-cta">Go to homepage</Link>
          </>
        )}

        {status === "error" && (
          <>
            <FaExclamationCircle className="ve-icon ve-icon--error" aria-hidden="true" />
            <h1 className="ve-title">Verification failed</h1>
            <p className="ve-text">{message}</p>
            <p className="ve-text">
              You can request a new link from your profile after logging in.
            </p>
            <Link to="/home" className="ve-cta">Go to homepage</Link>
          </>
        )}
      </div>
    </main>
  );
};

export default VerifyEmail;
