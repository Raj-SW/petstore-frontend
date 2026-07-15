import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStethoscope, FaCut, FaDog, FaTaxi,
} from "react-icons/fa";

import ProfessionalList from "@/Components/HelperComponents/ProfessionalList/ProfessionalList";
import { useAuth } from "@/context/AuthContext";
import useSEO from "../../hooks/useSEO";
import "./AppointmentPage.css";

const TABS = [
  { key: "veterinarians", label: "Veterinarians", icon: FaStethoscope },
  { key: "groomers",      label: "Groomers",      icon: FaCut },
  { key: "trainers",      label: "Trainers",      icon: FaDog },
  { key: "petTaxi",       label: "Pet Taxi",      icon: FaTaxi },
];

const VALID_TABS = new Set(TABS.map((t) => t.key));

const AppointmentPage = () => {
  useSEO("Book an Appointment", "Book a veterinarian, groomer, or pet taxi service at VitalPaws in Mauritius.");
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const initialTab = searchParams.get("tab") || "veterinarians";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Keep the active tab in sync with the URL (?tab=)
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== activeTab && VALID_TABS.has(urlTab)) {
      setActiveTab(urlTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const visibleTabs = TABS;

  const renderPanel = () => {
    switch (activeTab) {
      case "veterinarians": return <ProfessionalList role="veterinarian" />;
      case "groomers":      return <ProfessionalList role="groomer" />;
      case "trainers":      return <ProfessionalList role="trainer" />;
      case "petTaxi":       return <ProfessionalList role="petTaxi" />;
      default:              return <ProfessionalList role="veterinarian" />;
    }
  };

  return (
    <div className="ap-page">
      <div className="ap-grid">
        {/* Sidebar */}
        <aside className="ap-sidebar">
          <div className="ap-sidebar-header">
            <h2 className="ap-sidebar-title">Meet our professionals</h2>
            <p className="ap-sidebar-subtitle">Browse our certified pet-care team</p>
          </div>

          <div className="ap-tabs" role="tablist">
            {visibleTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                className={`ap-tab${activeTab === key ? " ap-tab--active" : ""}`}
                onClick={() => handleTabChange(key)}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="ap-user-card">
            <div className="ap-avatar">
              {user ? user.name?.charAt(0).toUpperCase() : "G"}
            </div>
            <div className="ap-user-info">
              <p className="ap-user-name">{user ? user.name : "Guest User"}</p>
              <p className="ap-user-meta">
                {user
                  ? user.address || "Address not provided"
                  : "Browsing as a guest"}
              </p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="ap-content" role="tabpanel">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppointmentPage;
