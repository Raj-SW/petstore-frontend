import { useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarCheck } from "react-icons/fa";
import AppointmentModal from "../../../Components/AppointmentModal/AppointmentModal";
import { fadeUp } from "../components/motionPresets";
import { ptFinalCta, PT_WHATSAPP_MESSAGE } from "../petTravelContent";

const PtFinalCta = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className="pt-final-cta" aria-labelledby="pt-final-title">
      <motion.div className="pt-final-inner" {...fadeUp}>
        <h2 className="pt-final-title" id="pt-final-title">{ptFinalCta.title}</h2>
        <p className="pt-final-subtitle">{ptFinalCta.subtitle}</p>
        <motion.button
          type="button"
          className="pt-btn pt-btn-primary pt-btn-lg"
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <FaCalendarCheck size={17} /> {ptFinalCta.cta}
        </motion.button>
      </motion.div>

      <AppointmentModal
        open={open}
        onClose={() => setOpen(false)}
        title="Book a Relocation Consultation"
        description="Tell us where your pet is travelling and we'll guide you through every requirement."
        waMessage={PT_WHATSAPP_MESSAGE}
        primaryLabel="Continue on WhatsApp"
      />
    </section>
  );
};

export default PtFinalCta;
