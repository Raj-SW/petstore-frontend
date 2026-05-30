import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FaStethoscope,
  FaCut,
  FaDog,
  FaBed,
  FaHeart,
  FaTaxi,
  FaPlane,
  FaPaw,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

import imgVeterinary from "../../assets/Services Sections Assets/veterinary-service.png";
import imgGrooming   from "../../assets/Services Sections Assets/grooming-service.png";
import imgBoarding   from "../../assets/Services Sections Assets/boarding-service.png";
import imgTraining   from "../../assets/Services Sections Assets/training-sevice.png";
import imgAdoption   from "../../assets/Services Sections Assets/adoption-service.png";
import imgImport     from "../../assets/ExportImport/catflying.png";
import imgTaxi       from "../../assets/ServicePageAssets/dogHug.png";
import imgHero       from "../../assets/ServicePageAssets/petFamily.png";
import imgWhy        from "../../assets/ServicePageAssets/catKiss.png";

import "./ServicePage.css";

/* ── Services data ── */

const SERVICES = [
  {
    key: "vet",
    label: "Veterinary Care",
    icon: FaStethoscope,
    image: imgVeterinary,
    href: "/appointments?tab=veterinarians",
    desc: "Comprehensive health checks, vaccinations, diagnostics and emergency care from certified veterinarians.",
    features: ["Annual wellness exams", "Vaccinations & preventive care", "24/7 emergency support"],
  },
  {
    key: "grooming",
    label: "Grooming",
    icon: FaCut,
    image: imgGrooming,
    href: "/appointments?tab=groomers",
    desc: "Professional spa-day grooming tailored to your pet's breed, coat type, and temperament.",
    features: ["Full-coat grooming & styling", "Bath, blow-dry & nail trim", "Ear cleaning & teeth brushing"],
  },
  {
    key: "training",
    label: "Pet Training",
    icon: FaDog,
    image: imgTraining,
    href: "/appointments?tab=trainers",
    desc: "Positive-reinforcement training by certified coaches to build confidence and great behaviour.",
    features: ["Puppy & obedience classes", "Behaviour correction", "Advanced agility training"],
  },
  {
    key: "boarding",
    label: "Boarding",
    icon: FaBed,
    image: imgBoarding,
    href: "/appointments?tab=veterinarians",
    desc: "Safe, comfortable and loving overnight stays so your pet thrives while you're away.",
    features: ["24/7 professional supervision", "Spacious, climate-controlled rooms", "Daily exercise & social play"],
  },
  {
    key: "taxi",
    label: "Pet Taxi",
    icon: FaTaxi,
    image: imgTaxi,
    href: "/appointments?tab=petTaxi",
    desc: "Stress-free, door-to-door transport to appointments, grooming, or anywhere your pet needs to go.",
    features: ["Insured, GPS-tracked vehicles", "Trained pet-handling drivers", "Flexible scheduling"],
  },
  {
    key: "adoption",
    label: "Adoption & Rescue",
    icon: FaHeart,
    image: imgAdoption,
    href: "/services",
    desc: "We connect animals in need with loving families — a safer, more ethical alternative to classifieds.",
    features: ["Pre-screened adopters", "Post-adoption support", "Rehoming & fostering programs"],
  },
  {
    key: "import",
    label: "Import & Export",
    icon: FaPlane,
    image: imgImport,
    href: "/import-export-service",
    desc: "End-to-end international pet travel logistics: paperwork, health certs, customs, and safe transit.",
    features: ["Documentation & compliance", "IATA-certified pet travel", "Destination quarantine guidance"],
  },
];

const STATS = [
  { value: "4.2M+", label: "Pets Rehomed" },
  { value: "6.8M+", label: "Pets Adopted" },
  { value: "500+",  label: "Professionals" },
  { value: "98%",   label: "Satisfaction Rate" },
];

/* ── Sub-components ── */

const ServiceCard = ({ label, icon: Icon, image, href, desc, features, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const navigate = useNavigate();

  return (
    <motion.article
      ref={ref}
      className="sp-card"
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, boxShadow: "0 24px 52px rgba(0,28,16,0.18)" }}
    >
      <div className="sp-card-img-wrap">
        <img src={image} alt={label} className="sp-card-img" />
        <div className="sp-card-img-overlay" />
        <div className="sp-card-badge">
          <Icon size={14} />
        </div>
      </div>

      <div className="sp-card-body">
        <h3 className="sp-card-title">{label}</h3>
        <p className="sp-card-desc">{desc}</p>

        <ul className="sp-card-features">
          {features.map((f) => (
            <li key={f}>
              <FaCheckCircle size={11} className="sp-check-icon" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <motion.button
          type="button"
          className="sp-card-btn"
          onClick={() => navigate(href)}
          whileHover={{ gap: "0.65rem" }}
          whileTap={{ scale: 0.97 }}
        >
          <span>Learn More</span>
          <FaArrowRight size={12} />
        </motion.button>
      </div>
    </motion.article>
  );
};

const StatCard = ({ value, label, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className="sp-stat"
      initial={{ opacity: 0, scale: 0.82 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <span className="sp-stat-value">{value}</span>
      <span className="sp-stat-label">{label}</span>
    </motion.div>
  );
};

/* ── Main Page ── */

const ServicePage = () => {
  const navigate = useNavigate();

  const heroRef   = useRef(null);
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });

  const gridRef   = useRef(null);
  const gridInView = useInView(gridRef, { once: true, amount: 0.05 });

  const whyRef   = useRef(null);
  const whyInView = useInView(whyRef, { once: true, amount: 0.2 });

  return (
    <div className="sp-page">

      {/* ── Hero ── */}
      <section className="sp-hero" ref={heroRef}>
        <img src={imgHero} alt="" className="sp-hero-bg" aria-hidden="true" />
        <div className="sp-hero-overlay" />

        <div className="sp-hero-content">
          <motion.div
            className="sp-hero-deco"
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <span className="sp-deco-line" />
            <FaPaw className="sp-deco-paw" />
            <span className="sp-deco-line" />
          </motion.div>

          <motion.h1
            className="sp-hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            OUR SERVICES
          </motion.h1>

          <motion.p
            className="sp-hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Complete care for <span className="sp-hero-script">happy pets</span>
          </motion.p>

          <motion.p
            className="sp-hero-tagline"
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.44 }}
          >
            Your pet's health and happiness is our priority
          </motion.p>

          <motion.div
            className="sp-hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.56 }}
          >
            <motion.button
              type="button"
              className="sp-btn-primary"
              onClick={() => navigate("/appointments")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Book Appointment
            </motion.button>
            <motion.button
              type="button"
              className="sp-btn-outline"
              onClick={() => navigate("/import-export-service")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Import &amp; Export
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="sp-scroll-hint"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <FaPaw size={18} />
        </motion.div>
      </section>

      {/* ── Services Grid ── */}
      <section className="sp-services-section">
        <motion.div
          ref={gridRef}
          className="sp-section-header"
          initial={{ opacity: 0, y: -20 }}
          animate={gridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="sp-header-deco">
            <span className="sp-deco-line sp-deco-line--dark" />
            <FaPaw className="sp-deco-paw sp-deco-paw--dark" />
            <span className="sp-deco-line sp-deco-line--dark" />
          </div>
          <h2 className="sp-section-title">WHAT WE OFFER</h2>
          <p className="sp-section-sub">
            Seven ways to care for your <span className="sp-script">beloved companion</span>
          </p>
        </motion.div>

        <div className="sp-grid">
          {SERVICES.map(({ key, ...props }, i) => (
            <ServiceCard key={key} {...props} delay={i * 0.07} />
          ))}
        </div>
      </section>

      {/* ── Why VitalPaws ── */}
      <section className="sp-why" ref={whyRef}>
        <div className="sp-why-inner">
          {/* Image */}
          <motion.div
            className="sp-why-img-wrap"
            initial={{ opacity: 0, x: -32 }}
            animate={whyInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <img src={imgWhy} alt="A cat and owner" className="sp-why-img" />
          </motion.div>

          {/* Text + stats */}
          <motion.div
            className="sp-why-content"
            initial={{ opacity: 0, x: 32 }}
            animate={whyInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="sp-header-deco sp-header-deco--left">
              <span className="sp-deco-line sp-deco-line--dark" />
              <FaPaw className="sp-deco-paw sp-deco-paw--dark" />
            </div>

            <h2 className="sp-why-title">Why Choose VitalPaws?</h2>

            <p className="sp-why-body">
              We&apos;re a safer, more professional, and ethical alternative to
              classifieds. Our platform connects adopters with rehomers, clients with
              certified professionals, and pet owners with everything they need —
              giving animals the best chance at a happy, healthy life.
            </p>

            <div className="sp-stats-grid">
              {STATS.map(({ value, label }, i) => (
                <StatCard key={label} value={value} label={label} delay={0.15 + i * 0.1} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="sp-cta">
        <motion.div
          className="sp-cta-inner"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="sp-cta-deco">
            <span className="sp-deco-line" />
            <FaPaw className="sp-deco-paw" />
            <span className="sp-deco-line" />
          </div>
          <h2 className="sp-cta-title">Ready to give your pet the best care?</h2>
          <p className="sp-cta-sub">
            Book an appointment, browse our store, or apply for import/export — all in one place.
          </p>
          <div className="sp-cta-actions">
            <motion.button
              type="button"
              className="sp-btn-primary"
              onClick={() => navigate("/appointments")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Book Appointment
            </motion.button>
            <motion.button
              type="button"
              className="sp-btn-outline"
              onClick={() => navigate("/petshop")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Pet Store
            </motion.button>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default ServicePage;
