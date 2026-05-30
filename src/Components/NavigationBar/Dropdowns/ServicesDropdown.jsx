import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaStethoscope, FaPlane, FaThLarge } from "react-icons/fa";
import img1 from "../../../assets/NavigationBarAssets/Services/img1.webp";
import img2 from "../../../assets/NavigationBarAssets/Services/img2.webp";
import img3 from "../../../assets/NavigationBarAssets/Services/img3.webp";
import "./ServicesDropdown.css";

const SERVICE_ITEMS = [
  {
    key: "all",
    label: "All Services",
    desc: "Explore everything we offer for your pet",
    href: "/services",
    image: img1,
    icon: FaThLarge,
  },
  {
    key: "appointments",
    label: "Book Appointment",
    desc: "Vets, groomers, trainers & more",
    href: "/appointments",
    image: img2,
    icon: FaStethoscope,
  },
  {
    key: "import-export",
    label: "Import & Export",
    desc: "International pet travel assistance",
    href: "/import-export-service",
    image: img3,
    icon: FaPlane,
  },
];

const ServicesDropdown = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (href) => (e) => {
    e.preventDefault();
    navigate(href);
    onClose();
  };

  const isActive = (href) => {
    if (href === "/services") return location.pathname === "/services";
    return location.pathname.startsWith(href);
  };

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
            {SERVICE_ITEMS.map(({ key, label, desc, href, image, icon: Icon }) => (
              <a
                key={key}
                href={href}
                role="menuitem"
                className={`sdd-item${isActive(href) ? " sdd-item--active" : ""}`}
                onClick={handleNav(href)}
              >
                <div className="sdd-img-wrap">
                  <img src={image} alt={label} className="sdd-img" />
                </div>
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

export { SERVICE_ITEMS };
export default ServicesDropdown;
