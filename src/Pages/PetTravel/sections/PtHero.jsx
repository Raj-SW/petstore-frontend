import { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp, FaCalendarCheck, FaStar } from "react-icons/fa";
import AppointmentModal from "../../../Components/AppointmentModal/AppointmentModal";
import PtIcon from "../components/PtIcon";
import heroImg from "../../../assets/PetTravel/pettravel.jpg";
import {
  ptHero,
  PT_WHATSAPP_NUMBER,
  PT_WHATSAPP_MESSAGE,
} from "../petTravelContent";

const waHref = `https://wa.me/${PT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  PT_WHATSAPP_MESSAGE
)}`;

/**
 * Full-cover image hero, matching the Services-page hero structure
 * (background image + forest overlay + centered copy). The 4 feature
 * tiles live in a strip directly below so the image isn't crowded out.
 */
const PtHero = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const { badge, titleLines, tagline, body, features, trust } = ptHero;

  return (
    <>
      <section className="pt-hero" aria-labelledby="pt-hero-title">
        <img
          src={heroImg}
          alt=""
          aria-hidden="true"
          className="pt-hero-bg"
          fetchpriority="high"
        />
        <div className="pt-hero-overlay" />

        <div className="pt-hero-content">
          <motion.span
            className="pt-hero-badge"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <PtIcon name="plane" size={13} /> {badge}
          </motion.span>

          <motion.h1
            className="pt-hero-title"
            id="pt-hero-title"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {titleLines.join(" ")}
          </motion.h1>

          <motion.p
            className="pt-hero-tagline"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {tagline}
          </motion.p>

          <motion.p
            className="pt-hero-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {body}
          </motion.p>

          <motion.div
            className="pt-hero-actions"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.52 }}
          >
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
              className="pt-btn pt-btn-whatsapp"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaWhatsapp size={18} /> WhatsApp Us
            </motion.a>
          </motion.div>

          <motion.div
            className="pt-hero-trust"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.66, duration: 0.5 }}
          >
            <span
              className="pt-hero-trust-stars"
              aria-label={`Rated ${trust.rating} out of 5`}
            >
              {Array.from({ length: trust.rating }).map((_, i) => (
                <FaStar key={i} aria-hidden="true" />
              ))}
            </span>
            <span className="pt-hero-trust-label">{trust.label}</span>
            <span className="pt-hero-trust-sep" aria-hidden="true">·</span>
            <span className="pt-hero-trust-stat">{trust.stat}</span>
          </motion.div>
        </div>
      </section>

      {/* Feature strip — the old hero feature list, kept below the image */}
      <section className="pt-hero-strip" aria-label="Why travel with us">
        <ul className="pt-hero-features">
          {features.map((f, i) => (
            <motion.li
              key={f.title}
              className="pt-hero-feature"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <PtIcon name={f.icon} size={22} className="pt-hero-feature-icon" />
              <span className="pt-hero-feature-title">{f.title}</span>
              <span className="pt-hero-feature-desc">{f.desc}</span>
            </motion.li>
          ))}
        </ul>
      </section>

      <AppointmentModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Book a Relocation Consultation"
        description="Tell us where your pet is travelling and we'll guide you through every requirement."
        waMessage={PT_WHATSAPP_MESSAGE}
        primaryLabel="Continue on WhatsApp"
      />
    </>
  );
};

export default PtHero;
