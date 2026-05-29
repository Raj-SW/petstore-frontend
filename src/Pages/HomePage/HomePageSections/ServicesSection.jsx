import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaStethoscope,
  FaCut,
  FaDog,
  FaBed,
  FaHeart,
  FaPaw,
} from "react-icons/fa";
import imgVeterinary from "../../../assets/Services Sections Assets/veterinary-service.png";
import imgGrooming from "../../../assets/Services Sections Assets/grooming-service.png";
import imgBoarding from "../../../assets/Services Sections Assets/boarding-service.png";
import imgTraining from "../../../assets/Services Sections Assets/training-sevice.png";
import imgAdoption from "../../../assets/Services Sections Assets/adoption-service.png";
import "./ServicesSection.css";

const SERVICES = [
  {
    key: "vet",
    label: "Veterinary Care",
    icon: FaStethoscope,
    image: imgVeterinary,
    href: "/appointments",
    gridClass: "sc-vet",
    delay: 0.05,
  },
  {
    key: "grooming",
    label: "Grooming",
    icon: FaCut,
    image: imgGrooming,
    href: "/appointments",
    gridClass: "sc-grooming",
    delay: 0.1,
  },
  {
    key: "adoption",
    label: "Adoption & Rescue",
    icon: FaHeart,
    image: imgAdoption,
    href: "/services",
    gridClass: "sc-adoption",
    delay: 0.15,
  },
  {
    key: "boarding",
    label: "Boarding",
    icon: FaBed,
    image: imgBoarding,
    href: "/appointments",
    gridClass: "sc-boarding",
    delay: 0.2,
  },
  {
    key: "training",
    label: "Pet Training",
    icon: FaDog,
    image: imgTraining,
    href: "/appointments",
    gridClass: "sc-training",
    delay: 0.25,
  },
];

const ServiceCard = ({ label, icon: Icon, image, href, delay }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { once: true, amount: 0.15 });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      className="service-card"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.025, boxShadow: "0 24px 52px rgba(0,28,16,0.28)" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => navigate(href)}
    >
      <img src={image} alt={label} className="sc-image" />

      <div className="sc-bottom-gradient" />

      <div className="sc-label-row">
        <div className="sc-icon-badge">
          <Icon size={16} />
        </div>
        <span className="sc-title">{label}</span>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            className="sc-hover-overlay"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              className="sc-view-btn"
              onClick={() => navigate(href)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
            >
              View Details →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ServicesSection = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 });

  return (
    <section className="services-section">
      <motion.div
        ref={headerRef}
        className="services-header"
        initial={{ opacity: 0, y: -24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="services-header-deco">
          <span className="deco-line" />
          <FaPaw className="deco-paw" />
          <span className="deco-line" />
        </div>
        <h2 className="services-title">OUR SERVICES</h2>
        <p className="services-subtitle">
          Complete care for{" "}
          <span className="services-subtitle-script">happy pets</span>
        </p>
      </motion.div>

      <div className="services-grid">
        {SERVICES.map(({ key, ...serviceProps }) => (
          <div key={key} className={`sc-grid-item ${serviceProps.gridClass}`}>
            <ServiceCard {...serviceProps} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
