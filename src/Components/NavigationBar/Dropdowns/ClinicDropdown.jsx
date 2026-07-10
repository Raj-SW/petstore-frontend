import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaInfoCircle, FaUsers, FaImages } from "react-icons/fa";
import "./ServicesDropdown.css";

const CLINIC_ITEMS = [
  { key: "about", label: "About", desc: "Our mission and story", href: "/about", icon: FaInfoCircle },
  { key: "team", label: "Meet the Team", desc: "The people behind VitalPaws", href: "/about", icon: FaUsers },
  { key: "gallery", label: "Inside VitalPaws", desc: "A look around our clinic", href: "/gallery", icon: FaImages },
];

const ClinicDropdown = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (href) => (e) => {
    e.preventDefault();
    navigate(href);
    onClose();
  };

  const isActive = (href) => location.pathname.startsWith(href);

  return (
    <div className="sdd-wrap">
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className="sdd-menu"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {CLINIC_ITEMS.map(({ key, label, desc, href, icon: Icon }) => (
              <a
                key={key}
                href={href}
                role="menuitem"
                className={`sdd-item${isActive(href) ? " sdd-item--active" : ""}`}
                onClick={handleNav(href)}
              >
                <div className="sdd-text">
                  <span className="sdd-label">
                    <Icon size={13} className="sdd-icon" />
                    {label}
                  </span>
                  <span className="sdd-desc">{desc}</span>
                </div>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { CLINIC_ITEMS };
export default ClinicDropdown;
