import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../../context/ToastContext";
import "./AdminSettings.css";

const TABS = ["General", "Appearance", "Notifications", "Security"];

const THEME_OPTIONS = [
  { id: "forest", label: "Forest Green", color: "#001C10" },
  { id: "ocean", label: "Ocean Blue", color: "#0D3B5E" },
  { id: "amber", label: "Warm Amber", color: "#D99A2B" },
];

const AdminSettings = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("General");

  // General
  const [general, setGeneral] = useState({
    siteName: "VitalPaws",
    contactEmail: "support@vitalpaws.com",
    supportPhone: "+1 (800) 555-0199",
    address: "123 Pet Lane, San Francisco, CA 94102",
    currency: "USD",
  });

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: "forest",
    fontSize: "medium",
    showHeroBanner: true,
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    newOrders: true,
    newAppointments: true,
    lowStock: true,
    userSignups: false,
    emailAddress: "admin@vitalpaws.com",
  });

  // Security
  const [security, setSecurity] = useState({
    sessionTimeout: "60",
    twoFactorAuth: false,
  });

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveGeneral = () => {
    addToast("General settings saved.", "success");
  };

  const handleSaveAppearance = () => {
    addToast("Appearance settings saved.", "success");
  };

  const handleSaveNotifications = () => {
    addToast("Notification preferences saved.", "success");
  };

  const handleSaveSecurity = () => {
    addToast("Security settings saved.", "success");
  };

  const handleChangePassword = () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      addToast("Please fill in both password fields.", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast("Passwords do not match.", "error");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      addToast("Password must be at least 8 characters.", "error");
      return;
    }
    addToast("Password changed successfully.", "success");
    setShowPasswordModal(false);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
  };

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-subtitle">
          Manage your platform configuration and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`admin-tab-btn${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {/* ── General ── */}
          {activeTab === "General" && (
            <div className="admin-card admin-settings-panel">
              <h2 className="admin-settings-section-title">General Settings</h2>

              <div className="admin-settings-two-col">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="siteName">Site Name</label>
                  <input
                    id="siteName"
                    className="admin-input"
                    type="text"
                    value={general.siteName}
                    onChange={(e) =>
                      setGeneral((g) => ({ ...g, siteName: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="contactEmail">Contact Email</label>
                  <input
                    id="contactEmail"
                    className="admin-input"
                    type="email"
                    value={general.contactEmail}
                    onChange={(e) =>
                      setGeneral((g) => ({ ...g, contactEmail: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="supportPhone">Support Phone</label>
                  <input
                    id="supportPhone"
                    className="admin-input"
                    type="tel"
                    value={general.supportPhone}
                    onChange={(e) =>
                      setGeneral((g) => ({ ...g, supportPhone: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    className="admin-select"
                    value={general.currency}
                    onChange={(e) =>
                      setGeneral((g) => ({ ...g, currency: e.target.value }))
                    }
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="AUD">AUD — Australian Dollar</option>
                  </select>
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label" htmlFor="address">Business Address</label>
                <textarea
                  id="address"
                  className="admin-textarea"
                  rows={3}
                  value={general.address}
                  onChange={(e) =>
                    setGeneral((g) => ({ ...g, address: e.target.value }))
                  }
                />
              </div>

              <div className="admin-settings-actions">
                <button className="admin-save-btn" onClick={handleSaveGeneral}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {activeTab === "Appearance" && (
            <div className="admin-card admin-settings-panel">
              <h2 className="admin-settings-section-title">Appearance</h2>

              {/* Theme swatches */}
              <div className="admin-field">
                <span className="admin-label">Theme Color</span>
                <div className="admin-theme-swatches">
                  {THEME_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      className={`admin-swatch-btn${appearance.theme === t.id ? " selected" : ""}`}
                      onClick={() =>
                        setAppearance((a) => ({ ...a, theme: t.id }))
                      }
                      title={t.label}
                      aria-pressed={appearance.theme === t.id}
                    >
                      <span
                        className="admin-swatch-dot"
                        style={{ background: t.color }}
                      />
                      <span className="admin-swatch-label">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="admin-field">
                <span className="admin-label">Font Size Preference</span>
                <div className="admin-radio-group">
                  {["small", "medium", "large"].map((size) => (
                    <label key={size} className="admin-radio-label">
                      <input
                        type="radio"
                        className="admin-radio-input"
                        name="fontSize"
                        value={size}
                        checked={appearance.fontSize === size}
                        onChange={() =>
                          setAppearance((a) => ({ ...a, fontSize: size }))
                        }
                      />
                      <span className="admin-radio-text">
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hero banner */}
              <div className="admin-field">
                <span className="admin-label">Hero Banner</span>
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    className="admin-checkbox-input"
                    checked={appearance.showHeroBanner}
                    onChange={(e) =>
                      setAppearance((a) => ({
                        ...a,
                        showHeroBanner: e.target.checked,
                      }))
                    }
                  />
                  <span>Show hero banner on the homepage</span>
                </label>
              </div>

              <div className="admin-settings-actions">
                <button className="admin-save-btn" onClick={handleSaveAppearance}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === "Notifications" && (
            <div className="admin-card admin-settings-panel">
              <h2 className="admin-settings-section-title">Notification Preferences</h2>

              <div className="admin-notification-list">
                {[
                  { key: "newOrders", label: "New order notifications", desc: "Get notified when a customer places an order." },
                  { key: "newAppointments", label: "New appointment alerts", desc: "Receive alerts when appointments are booked." },
                  { key: "lowStock", label: "Low stock alerts", desc: "Be warned when product stock falls below threshold." },
                  { key: "userSignups", label: "User signup notifications", desc: "Know when new users register on the platform." },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="admin-notification-row">
                    <div className="admin-notification-info">
                      <p className="admin-notification-label">{label}</p>
                      <p className="admin-notification-desc">{desc}</p>
                    </div>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        className="toggle-input"
                        checked={notifications[key]}
                        onChange={(e) =>
                          setNotifications((n) => ({
                            ...n,
                            [key]: e.target.checked,
                          }))
                        }
                        aria-label={label}
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div className="admin-field" style={{ marginTop: "1.5rem" }}>
                <label className="admin-label" htmlFor="notifEmail">
                  Email notification address
                </label>
                <input
                  id="notifEmail"
                  className="admin-input"
                  type="email"
                  value={notifications.emailAddress}
                  onChange={(e) =>
                    setNotifications((n) => ({
                      ...n,
                      emailAddress: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="admin-settings-actions">
                <button className="admin-save-btn" onClick={handleSaveNotifications}>
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === "Security" && (
            <div className="admin-card admin-settings-panel">
              <h2 className="admin-settings-section-title">Security</h2>

              <div className="admin-settings-two-col">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="sessionTimeout">
                    Session Timeout
                  </label>
                  <select
                    id="sessionTimeout"
                    className="admin-select"
                    value={security.sessionTimeout}
                    onChange={(e) =>
                      setSecurity((s) => ({
                        ...s,
                        sessionTimeout: e.target.value,
                      }))
                    }
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>
              </div>

              <div className="admin-notification-row" style={{ borderTop: "1px solid rgba(0,28,16,0.07)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
                <div className="admin-notification-info">
                  <p className="admin-notification-label">Two-Factor Authentication</p>
                  <p className="admin-notification-desc">
                    Require a second verification step when logging in as admin.
                  </p>
                </div>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={security.twoFactorAuth}
                    onChange={(e) =>
                      setSecurity((s) => ({
                        ...s,
                        twoFactorAuth: e.target.checked,
                      }))
                    }
                    aria-label="Two-factor authentication"
                  />
                </label>
              </div>

              <div className="admin-settings-actions admin-settings-actions--spaced">
                <button className="admin-save-btn" onClick={handleSaveSecurity}>
                  Save Settings
                </button>
                <button
                  className="admin-outline-btn"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Admin Password
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="admin-modal-title">Change Admin Password</h3>
              <p className="admin-modal-desc">
                Enter a new password for your admin account.
              </p>

              <div className="admin-field">
                <label className="admin-label" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  className="admin-input"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  className="admin-input"
                  type="password"
                  placeholder="Repeat the new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  className="admin-outline-btn"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button className="admin-save-btn" onClick={handleChangePassword}>
                  Update Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminSettings;
