import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaCalendarCheck, FaWhatsapp, FaPhone } from "react-icons/fa";
import AppointmentModal from "../../../../Components/AppointmentModal/AppointmentModal";
import "./FinalCtaStrip.css";

const WHATSAPP_NUMBER = "23057580480";
const CONSULTATION_HOURS = ["Mon, Wed, Thu, Sat: 4:30 PM – 6:00 PM"];

const FinalCtaStrip = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section className="fcs-section" ref={ref}>
      <motion.div
        className="fcs-inner"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className="fcs-title">Need Veterinary Advice?</h2>
        <p className="fcs-sub">We're here for you and your pet.</p>

        <div className="fcs-actions">
          <motion.button
            type="button"
            className="fcs-btn fcs-btn-primary"
            onClick={() => setBookingOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <FaCalendarCheck size={17} />
            Book Appointment
          </motion.button>
          <motion.a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fcs-btn fcs-btn-outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <FaWhatsapp size={18} />
            WhatsApp Us
          </motion.a>
          <motion.a
            href={`tel:+${WHATSAPP_NUMBER}`}
            className="fcs-btn fcs-btn-outline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <FaPhone size={16} />
            Call Us
          </motion.a>
        </div>
      </motion.div>

      <AppointmentModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Book an Appointment"
        description="We're here for you and your pet."
        hours={CONSULTATION_HOURS}
        waMessage="Hi, I'd like to book a vet appointment."
      />
    </section>
  );
};

export default FinalCtaStrip;
