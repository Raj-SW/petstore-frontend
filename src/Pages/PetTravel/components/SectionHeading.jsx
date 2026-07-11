import { motion } from "framer-motion";

/**
 * Centered section heading: optional uppercase eyebrow label, a title, and an
 * optional supporting line. Renders a semantic <h2> so the page keeps a clean
 * heading hierarchy (the hero owns the single <h1>).
 */
const SectionHeading = ({ label, title, subtitle, id }) => (
  <motion.div
    className="pt-heading"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.6 }}
    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {label && <p className="pt-heading-label">{label}</p>}
    <h2 className="pt-heading-title" id={id}>{title}</h2>
    {subtitle && <p className="pt-heading-subtitle">{subtitle}</p>}
  </motion.div>
);

export default SectionHeading;
