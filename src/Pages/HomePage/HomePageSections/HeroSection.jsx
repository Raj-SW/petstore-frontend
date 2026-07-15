import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import "./HeroSection.css";
import { FaHome, FaStethoscope, FaTruck, FaShoppingBag } from "react-icons/fa";
// Re-encoded as WebP — originals were PNGs at small display dimensions
// (553x370 / 661x370) but 264KB/547KB, a poor format choice for this content.
import heroLeftBg from "../../../assets/HeroSectionAssets/Hero-Image-left-background.webp";
import heroRight from "../../../assets/HeroSectionAssets/hero-image-right.webp";
import AppointmentModal, {
  BOOKING_PRESET,
  MOBILE_VET_PRESET,
} from "../../../Components/AppointmentModal/AppointmentModal";

const contentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [mobileVetOpen, setMobileVetOpen] = useState(false);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yLeft = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section className="hero-section" ref={heroRef}>
      {/* Background layers — subtle parallax drift on scroll */}
      <motion.img
        src={heroLeftBg}
        alt=""
        className="hero-bg-img hero-bg-left"
        aria-hidden="true"
        style={{ y: yLeft }}
      />
      <motion.img
        src={heroRight}
        alt=""
        className="hero-bg-img hero-bg-right"
        aria-hidden="true"
        fetchpriority="high"
        style={{ y: yRight }}
      />

      {/* Gradient fade — right image bleeds into center */}
      <div className="hero-right-fade" aria-hidden="true" />

      {/* Content overlay */}
      <div className="hero-overlay">
        {/* Left text */}
        <motion.div className="hero-content" initial="hidden" animate="visible" variants={contentVariants}>
          <motion.p className="hero-because" variants={itemVariants}>Because</motion.p>
          <motion.h1 className="hero-headline" variants={itemVariants}>
            <span className="hero-headline-dark">They Can't Speak…</span>
            <br />
            <span className="hero-headline-gold">We Listen.</span>
          </motion.h1>
          <motion.p className="hero-body" variants={itemVariants}>
            Compassionate veterinary care in Piton
            <br />
            for the pets you love the most.
          </motion.p>

          <motion.div className="hero-buttons" variants={itemVariants}>
            <motion.button
              type="button"
              className="hero-btn hero-btn-primary"
              onClick={() => setBookingOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaStethoscope size={18} className="me-2" />
              Book Appointment
            </motion.button>
            <motion.button
              type="button"
              className="hero-btn hero-btn-outline"
              onClick={() => setMobileVetOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaTruck size={18} className="me-2" />
              Mobile Vet
            </motion.button>
            <motion.button
              type="button"
              className="hero-btn hero-btn-outline"
              onClick={() => navigate("/import-export-service")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaHome size={18} className="me-2" />
              Pet Travel
            </motion.button>
            <motion.button
              type="button"
              className="hero-btn hero-btn-outline"
              onClick={() => navigate("/petshop")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaShoppingBag size={18} className="me-2" />
              Shop
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Transparent spacer — right bg shows through */}
        <div className="hero-right-col" />
      </div>

      <AppointmentModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preset={BOOKING_PRESET}
      />
      <AppointmentModal
        open={mobileVetOpen}
        onClose={() => setMobileVetOpen(false)}
        preset={MOBILE_VET_PRESET}
      />
    </section>
  );
};

export default HeroSection;
