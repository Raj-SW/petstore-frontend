import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaStethoscope, FaShoppingBag, FaPlane, FaLightbulb, FaArrowRight,
} from "react-icons/fa";
import imgVeterinary from "../../../assets/Services Sections Assets/veterinary-service.webp";
import imgPetStore from "../../../assets/NavigationBarAssets/PetStore/img2.webp";
import imgPetTravel from "../../../assets/ExportImport/catflying.webp";
import imgPetCareTips from "../../../assets/StatsSection/vet-with-dog.jpg";
import "./ServicesSection.css";

const PILLARS = [
  {
    key: "vet",
    title: "Veterinary Care",
    hue: "#1D4432",
    icon: FaStethoscope,
    image: imgVeterinary,
    blurb: "Expert consultations, diagnostics, vaccinations and treatments with compassion and precision.",
    route: "/appointments?tab=veterinarians",
  },
  {
    key: "shop",
    title: "Pet Store",
    hue: "#7A3B69",
    icon: FaShoppingBag,
    image: imgPetStore,
    blurb: "Premium foods, supplements, toys and essentials carefully selected for your pet's well-being.",
    route: "/petshop",
  },
  {
    key: "travel",
    title: "Pet Travel",
    hue: "#2A6F6A",
    icon: FaPlane,
    image: imgPetTravel,
    blurb: "Safe, stress-free travel solutions including documentation, crates and expert guidance.",
    route: "/import-export-service",
  },
  {
    key: "tips",
    title: "Pet Care Tips",
    hue: "#BA7517",
    icon: FaLightbulb,
    image: imgPetCareTips,
    blurb: "Helpful tips, guides and advice to help you give your pet the best life possible.",
    route: "/pet-care-tips",
  },
];

const PillarCard = ({ title, hue, icon: Icon, image, blurb, route, delay }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const inView = useInView(cardRef, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();

  const hidden = reduced ? { opacity: 0 } : { opacity: 0, y: 40 };
  const shown = { opacity: 1, y: 0 };

  return (
    <motion.div
      ref={cardRef}
      className="pillar-wrap"
      style={{ background: `${hue}14` }}
      initial={hidden}
      animate={inView ? shown : hidden}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={reduced ? undefined : { y: -6 }}
    >
      <div className="pillar-card">
        <div className="pillar-photo-wrap">
          <div className="pillar-icon-chip" style={{ background: hue }}>
            <Icon size={18} />
          </div>
          <img src={image} alt={title} className="pillar-photo" loading="lazy" />
        </div>
        <h3 className="pillar-title" style={{ color: hue }}>{title}</h3>
        <p className="pillar-blurb">{blurb}</p>
        <button
          type="button"
          className="pillar-learn-more"
          style={{ color: hue, borderColor: hue }}
          onClick={() => navigate(route)}
        >
          Learn More <FaArrowRight className="pillar-arrow" />
        </button>
      </div>
    </motion.div>
  );
};

const ServicesSection = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();

  return (
    <section className="services-section">
      <motion.div
        ref={headerRef}
        className="services-header"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -24 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className="services-title">
          <span className="services-title-forest">Premium Care.</span>{" "}
          <span className="services-title-gold">Every Step of the Way.</span>
        </h2>
        <p className="services-subtitle">
          Explore our key services designed to keep your pets healthy, happy,
          and by your side for years to come.
        </p>
      </motion.div>

      <div className="services-grid">
        {PILLARS.map((pillar, i) => (
          <PillarCard key={pillar.key} {...pillar} delay={i * 0.07} />
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
