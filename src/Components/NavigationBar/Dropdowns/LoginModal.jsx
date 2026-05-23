import { useState } from "react";
import PropTypes from "prop-types";
import {
  FaKey, FaEye, FaEyeSlash, FaSignInAlt,
  FaExclamationCircle, FaEnvelope,
} from "react-icons/fa";
import AuthModal from "../../Auth/AuthModal";
import AuthField from "../../Auth/AuthField";
import ForgotPasswordModal from "../../Auth/ForgotPasswordModal";
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

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showForgot, setShowForgot] = useState(false);
  const [remember, setRemember] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAlert(null);
    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        showAuthToast("login", "success");
        onHide();
      } else {
        setAlert(res.error || "Login failed. Please try again.");
      }
    } catch {
      setAlert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthModal
        show={show}
        onHide={onHide}
        title="Welcome Back"
        subtitle="Log in to your VitalPaws account to continue."
      >
        {alert && (
          <div className="auth-alert" role="alert">
            <FaExclamationCircle size={16} style={{ flexShrink: 0 }} />
            <span>{alert}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthField
            label="Email"
            name="email"
            type="email"
            icon={FaEnvelope}
            value={formData.email}
            onChange={onChange}
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          <AuthField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            icon={FaKey}
            value={formData.password}
            onChange={onChange}
            placeholder="••••••••"
            error={errors.password}
            required
            rightAdornment={
              <span onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            }
          />

          <div className="auth-row">
            <label className="auth-checkbox-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className="auth-link"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" />
                Logging in...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Log In
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?
          <button type="button" className="auth-link" onClick={onSignUpClick}>
            Sign up
          </button>
        </p>
      </AuthModal>

      <ForgotPasswordModal
        show={showForgot}
        onHide={() => setShowForgot(false)}
        onLoginClick={() => setShowForgot(false)}
      />
    </>
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
