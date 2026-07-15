import { useState } from "react";
import { motion } from "framer-motion";
import PtIcon from "../components/PtIcon";
import AppointmentModal, {
  TRAVEL_PRESET,
} from "../../../Components/AppointmentModal/AppointmentModal";
import { fadeUp } from "../components/motionPresets";
import {
  ptDestinations,
  ptRulesCard,
  ptChecklistCard,
  PT_CHECKLIST_PDF_URL,
} from "../petTravelContent";

const PtDestinations = () => {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <section className="pt-section pt-destinations" aria-labelledby="pt-dest-title">
      <div className="pt-dest-grid">
        {/* Destinations list */}
        <motion.div className="pt-card pt-dest-list" {...fadeUp}>
          <h2 className="pt-card-title" id="pt-dest-title">{ptDestinations.title}</h2>
          <p className="pt-card-text">{ptDestinations.desc}</p>
          <ul className="pt-country-grid">
            {ptDestinations.countries.map((c) => (
              <li key={c.code} className="pt-country">
                <span className="pt-country-flag" role="img" aria-label={c.name}>
                  {c.flag}
                </span>
                <span className="pt-country-name">{c.name}</span>
              </li>
            ))}
          </ul>
          <p className="pt-dest-more">{ptDestinations.moreLabel}</p>
        </motion.div>

        {/* Rules CTA card (dark) */}
        <motion.div
          className="pt-card pt-rules-card"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.08 }}
        >
          <div className="pt-rules-globe" aria-hidden="true">
            <PtIcon name="globe" size={64} />
          </div>
          <h3 className="pt-rules-title">{ptRulesCard.title}</h3>
          <p className="pt-rules-subtitle">{ptRulesCard.subtitle}</p>
          <p className="pt-rules-body">{ptRulesCard.body}</p>
          <motion.button
            type="button"
            className="pt-btn pt-btn-primary"
            onClick={() => setRulesOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {ptRulesCard.cta}
          </motion.button>
        </motion.div>

        {/* Checklist card */}
        <motion.div
          className="pt-card pt-checklist-card"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.16 }}
        >
          <div className="pt-checklist-icon" aria-hidden="true">
            <PtIcon name="download" size={26} />
          </div>
          <h3 className="pt-card-title">{ptChecklistCard.title}</h3>
          <p className="pt-card-text">{ptChecklistCard.desc}</p>
          <a
            className={`pt-btn pt-btn-outline${PT_CHECKLIST_PDF_URL ? "" : " pt-btn-disabled"}`}
            href={PT_CHECKLIST_PDF_URL || undefined}
            download={PT_CHECKLIST_PDF_URL ? "" : undefined}
            aria-disabled={PT_CHECKLIST_PDF_URL ? undefined : "true"}
            target={PT_CHECKLIST_PDF_URL ? "_blank" : undefined}
            rel="noopener noreferrer"
          >
            <PtIcon name="download" size={15} /> {ptChecklistCard.cta}
          </a>
        </motion.div>
      </div>

      <AppointmentModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        preset={TRAVEL_PRESET}
      />
    </section>
  );
};

export default PtDestinations;
