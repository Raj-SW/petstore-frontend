import { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp, FaCalendarCheck, FaStar } from "react-icons/fa";
import AppointmentModal from "../../../Components/AppointmentModal/AppointmentModal";
import PtIcon from "../components/PtIcon";
import heroImg from "../../../assets/PetTravel/pettravel.png";
import {
  ptHero,
  PT_WHATSAPP_NUMBER,
  PT_WHATSAPP_MESSAGE,
} from "../petTravelContent";

const waHref = `https://wa.me/${PT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  PT_WHATSAPP_MESSAGE
)}`;

const PtHero = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const { badge, titleLines, tagline, body, features, trust } = ptHero;

  return (
    <section className="pt-hero" aria-labelledby="pt-hero-title">
      <div className="pt-hero-inner">
        {/* Left — copy */}
        <motion.div
          className="pt-hero-content"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="pt-hero-badge">
            <PtIcon name="plane" size={13} /> {badge}
          </span>

          <h1 className="pt-hero-title" id="pt-hero-title">
            {titleLines.map((line) => (
              <span key={line} className="pt-hero-title-line">{line}</span>
            ))}
          </h1>

          <p className="pt-hero-tagline">{tagline}</p>
          <p className="pt-hero-body">{body}</p>

          <ul className="pt-hero-features">
            {features.map((f) => (
              <li key={f.title} className="pt-hero-feature">
                <PtIcon name={f.icon} size={22} className="pt-hero-feature-icon" />
                <span className="pt-hero-feature-title">{f.title}</span>
                <span className="pt-hero-feature-desc">{f.desc}</span>
              </li>
            ))}
          </ul>

          <div className="pt-hero-actions">
            <motion.button
              type="button"
              className="pt-btn pt-btn-primary"
              onClick={() => setBookingOpen(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaCalendarCheck size={16} /> Book a Consultation
            </motion.button>
            <motion.a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pt-btn pt-btn-outline"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaWhatsapp size={18} /> WhatsApp Us
            </motion.a>
          </div>
        </motion.div>

        {/* Right — image + floating trust card */}
        <motion.div
          className="pt-hero-media"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <img
            src={heroImg}
            alt="A golden retriever sitting comfortably in an open airline travel crate at an airport terminal, with its pet passport beside it"
            className="pt-hero-img"
            fetchpriority="high"
            width="1672"
            height="941"
          />
          <motion.div
            className="pt-hero-trust"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <div
              className="pt-hero-trust-stars"
              aria-label={`Rated ${trust.rating} out of 5`}
            >
              {Array.from({ length: trust.rating }).map((_, i) => (
                <FaStar key={i} aria-hidden="true" />
              ))}
            </div>
            <p className="pt-hero-trust-label">{trust.label}</p>
            <p className="pt-hero-trust-stat">{trust.stat}</p>
          </motion.div>
        </motion.div>
      </div>

      <AppointmentModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Book a Relocation Consultation"
        description="Tell us where your pet is travelling and we'll guide you through every requirement."
        waMessage={PT_WHATSAPP_MESSAGE}
        primaryLabel="Continue on WhatsApp"
      />
    </section>
  );
};

export default PtHero;
