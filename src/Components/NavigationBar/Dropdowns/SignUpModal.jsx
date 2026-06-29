import { useState } from "react";
import PropTypes from "prop-types";
import {
  FaUser, FaEnvelope, FaKey, FaEye, FaEyeSlash,
  FaExclamationCircle, FaUserPlus, FaPhone, FaMapMarkerAlt,
} from "react-icons/fa";
import AuthModal from "../../Auth/AuthModal";
import AuthField from "../../Auth/AuthField";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

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
    name: "", email: "", password: "", confirmPassword: "",
    phoneNumber: "", address: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [terms, setTerms] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.phoneNumber) e.phoneNumber = "Phone number is required";
    else if (!/^\+?[\d\s-]{8,}$/.test(formData.phoneNumber)) e.phoneNumber = "Enter a valid phone number";
    if (!formData.address.trim()) e.address = "Address is required";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password))
      e.password = "Must include uppercase, lowercase, number, and special character";
    if (!formData.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!terms) e.terms = "You must accept the terms";
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
      const res = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });
      if (res.success) {
        showAuthToast("signup", "success");
        onHide();
      } else {
        setAlert(res.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setAlert(`Unexpected error: ${err.message}`);
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
    <AuthModal
      show={show}
      onHide={handleClose}
      title="Create Your Account"
      subtitle="Join the VitalPaws family and give your pet the care they deserve."
      maxWidth={500}
    >
      {alert && (
        <div className="auth-alert" role="alert">
          <FaExclamationCircle size={16} style={{ flexShrink: 0 }} />
          <span>{alert}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthField name="name" icon={FaUser} placeholder="Full name"
          value={formData.name} onChange={onChange} error={errors.name} required />
        <AuthField name="email" type="email" icon={FaEnvelope} placeholder="Email address"
          value={formData.email} onChange={onChange} error={errors.email} required />
        <AuthField name="phoneNumber" type="tel" icon={FaPhone} placeholder="Phone number"
          value={formData.phoneNumber} onChange={onChange} error={errors.phoneNumber} required />
        <AuthField name="address" icon={FaMapMarkerAlt} placeholder="Address"
          value={formData.address} onChange={onChange} error={errors.address} required />

        <AuthField
          name="password" type={showPassword ? "text" : "password"} icon={FaKey}
          placeholder="Password"
          value={formData.password} onChange={onChange} error={errors.password} required
          rightAdornment={
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        <AuthField
          name="confirmPassword" type={showConfirm ? "text" : "password"} icon={FaKey}
          placeholder="Confirm password"
          value={formData.confirmPassword} onChange={onChange} error={errors.confirmPassword} required
          rightAdornment={
            <button type="button" aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"} onClick={() => setShowConfirm((p) => !p)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        <label className="auth-checkbox-row" style={{ marginTop: "0.3rem" }}>
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          />{" "}
          I agree to all <a href="#" className="auth-link" style={{ marginLeft: 4 }}>Terms &amp; Conditions</a>
        </label>
        {errors.terms && <span className="auth-field-error">{errors.terms}</span>}

        <button type="submit" className="auth-submit auth-submit--accent" disabled={loading}>
          {loading ? (
            <>
              <span className="auth-spinner" />{" "}
              Creating account...
            </>
          ) : (
            <>
              <FaUserPlus />{" "}
              Sign Up
            </>
          )}
        </button>
      </form>

      <p className="auth-footer">
        {"Already have an account?"}{" "}
        <button type="button" className="auth-link" onClick={onLoginClick}>
          Log in
        </button>
      </p>
    </AuthModal>
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
