import React, { useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserEdit,
  FaSave,
  FaUserCircle,
  FaCamera,
  FaInfoCircle,
} from "react-icons/fa";
import "./UserProfile.css";
import Breadcrumb from "../Components/HelperComponents/Breadcrumb/Breadcrumb";

const UserProfile = () => {
  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Profile", path: "/profile" },
  ];

  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    address: "123 Main St, City, Country",
    avatar: null,
  });

  const [form, setForm] = useState({
    name: user.name,
    address: user.address,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatar: user.avatar,
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Name is required";
    }

    if (!form.address.trim()) {
      errors.address = "Address is required";
    }

    // Password validation only if any password field is filled
    if (form.oldPassword || form.newPassword || form.confirmPassword) {
      if (!form.oldPassword) {
        errors.oldPassword = "Current password is required";
      }
      if (!form.newPassword) {
        errors.newPassword = "New password is required";
      } else if (form.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters";
      }
      if (!form.confirmPassword) {
        errors.confirmPassword = "Please confirm your new password";
      } else if (form.newPassword !== form.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, avatar: reader.result }));
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUser((prev) => ({
        ...prev,
        name: form.name,
        address: form.address,
        avatar: form.avatar,
      }));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Clear password fields after successful save
      setForm((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (
    name,
    label,
    type = "text",
    required = true,
    tooltip = ""
  ) => (
    <Form.Group className="mb-3">
      <Form.Label className="d-flex align-items-center gap-2">
        {label}
        {tooltip && (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{tooltip}</Tooltip>}
          >
            <FaInfoCircle className="text-secondary" size={14} />
          </OverlayTrigger>
        )}
      </Form.Label>
      <Form.Control
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required={required}
        isInvalid={!!validationErrors[name]}
        disabled={name === "email"}
        aria-describedby={`${name}-feedback`}
      />
      <Form.Control.Feedback type="invalid">
        {validationErrors[name]}
      </Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <Container className="profile-container">
      <Row className="justify-content-center mb-4">
        <Col md={8} lg={6}>
          <div className="breadcrumb-container">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="profile-card">
              <Card.Body className="profile-form">
                <div className="profile-header">
                  <FaUserEdit size={28} className="text-success" />
                  <h2 className="caveat-Heading">User Profile</h2>
                </div>

                {/* Avatar Upload Section */}
                <div className="avatar-container">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="position-relative"
                  >
                    {form.avatar ? (
                      <img
                        src={form.avatar}
                        alt="User avatar"
                        className="avatar-image"
                      />
                    ) : (
                      <FaUserCircle
                        size={96}
                        color="var(--neutral-color-60)"
                        className="avatar-image"
                      />
                    )}
                    <label
                      htmlFor="avatar-upload"
                      className="avatar-upload-button"
                      title="Upload new avatar"
                    >
                      <FaCamera size={20} color="white" />
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        ref={fileInputRef}
                      />
                    </label>
                  </motion.div>
                  <div className="helper-text text-center">
                    Click the camera to upload a new avatar (max 5MB)
                  </div>
                </div>

                {/* Success Alert */}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Alert variant="success" className="alert">
                        <FaSave size={18} />
                        Profile updated successfully!
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="alert">
                    <FaInfoCircle size={18} />
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSave}>
                  <div className="form-section">
                    <h3 className="form-section-title">Personal Information</h3>
                    {renderFormField(
                      "name",
                      "Full Name",
                      "text",
                      true,
                      "Enter your full name"
                    )}
                    {renderFormField(
                      "email",
                      "Email Address",
                      "email",
                      true,
                      "Your email address cannot be changed"
                    )}
                    {renderFormField(
                      "address",
                      "Address",
                      "text",
                      true,
                      "Enter your current address"
                    )}
                  </div>

                  <div className="section-divider" />

                  <div className="password-section">
                    <h3 className="password-section-title">Change Password</h3>
                    <div className="helper-text mb-3">
                      Leave these fields empty if you don't want to change your
                      password
                    </div>
                    {renderFormField(
                      "oldPassword",
                      "Current Password",
                      "password",
                      false,
                      "Enter your current password"
                    )}
                    {renderFormField(
                      "newPassword",
                      "New Password",
                      "password",
                      false,
                      "Enter a new password (min. 8 characters)"
                    )}
                    {renderFormField(
                      "confirmPassword",
                      "Confirm New Password",
                      "password",
                      false,
                      "Confirm your new password"
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="save-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
