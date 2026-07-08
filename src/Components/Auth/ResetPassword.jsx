import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import AuthField from "./AuthField";
import "./AuthModals.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {
      setAlert({ type: "error", message: "Invalid or missing reset link. Please request a new one." });
    }
    setToken(t);
  }, [searchParams]);

  const validate = () => {
    const e = {};
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (password !== confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 3000);
      } else {
        setAlert({ type: "error", message: data.message || "Failed to reset password. Please try again." });
      }
    } catch (err) {
      setAlert({ type: "error", message: `An error occurred. Please try again. ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      <div className="auth-modal" style={{ maxWidth: 440, margin: "6rem auto" }}>
        <div className="auth-modal-body">
          <div className="auth-modal-header">
            <h2 className="auth-modal-title">Set your password</h2>
            <p className="auth-modal-subtitle">
              {success
                ? "Your password has been set. Redirecting you to the home page…"
                : "Choose a strong password for your VitalPaws account."}
            </p>
          </div>

          {alert && (
            <div className={`auth-alert${alert.type === "success" ? " auth-alert--success" : ""}`} role="alert">
              {alert.type === "success" ? <FaCheckCircle size={16} style={{ flexShrink: 0 }} /> : <FaExclamationCircle size={16} style={{ flexShrink: 0 }} />}
              <span>{alert.message}</span>
            </div>
          )}

          {success ? (
            <div className="auth-alert auth-alert--success" role="status">
              <FaCheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>Password set successfully! Redirecting…</span>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <AuthField
                label="New Password"
                name="password"
                type={showPw ? "text" : "password"}
                icon={FaLock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                error={errors.password}
                required
                rightAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted, #888)", display: "flex", alignItems: "center" }}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
              />

              <AuthField
                label="Confirm Password"
                name="confirm"
                type="password"
                icon={FaLock}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                error={errors.confirm}
                required
              />

              <button type="submit" className="auth-submit" disabled={loading || !token}>
                {loading ? <><span className="auth-spinner" /> Setting password…</> : "Set Password"}
              </button>
            </form>
          )}

          <Link to="/" className="auth-link" style={{ alignSelf: "center" }}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
