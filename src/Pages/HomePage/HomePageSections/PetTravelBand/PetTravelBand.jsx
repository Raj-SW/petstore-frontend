import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FaCheckCircle } from "react-icons/fa";
// Re-encoded as WebP — original was a 3MB PNG at unchanged pixel dimensions.
import catFlying from "../../../../assets/ExportImport/catflying.webp";
import "./PetTravelBand.css";

const POINTS = [
  "We handle all the paperwork and logistics for bringing your pet into or out of Mauritius",
  "Guidance on vaccination and health-certificate requirements for your destination",
  "Support from booking through to arrival, so nothing falls through the cracks",
];

const PetTravelBand = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="ptb-section" ref={ref}>
      <div className="ptb-inner">
        <motion.div
          className="ptb-content"
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="ptb-title">Travelling with Your Pet?</h2>
          <p className="ptb-sub">
            Relocating abroad or bringing your pet home to Mauritius? We take
            the stress out of pet travel.
          </p>
          <ul className="ptb-points">
            {POINTS.map((point) => (
              <li key={point}>
                <FaCheckCircle className="ptb-point-icon" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <motion.button
            type="button"
            className="ptb-cta"
            onClick={() => navigate("/import-export-service")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            Learn More
          </motion.button>
        </motion.div>

        <motion.div
          className="ptb-image-col"
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -6 }}
        >
          <img src={catFlying} alt="Cat and dog traveling around the world" className="ptb-image" />
        </motion.div>
      </div>
    </section>
  );
};

export default PetTravelBand;
