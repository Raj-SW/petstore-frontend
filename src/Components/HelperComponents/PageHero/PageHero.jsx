import { motion } from "framer-motion";
import { FaPaw } from "react-icons/fa";
import "./PageHero.css";

const ease = [0.25, 0.46, 0.45, 0.94];

/**
 * Shared page hero — the Services-page standard, extracted so every page
 * opens the same way: cover photo, forest gradient overlay, gold deco
 * line + paw, display-font title, script subtitle, optional tagline/CTAs.
 *
 */
const PageHero = ({ image, title, subtitle, script, tagline, children }) => (
  <section className="ph-hero">
    {image && (
      <img src={image} alt="" aria-hidden="true" className="ph-bg" fetchpriority="high" />
    )}
    <div className="ph-overlay" />

    <div className="ph-content">
      <motion.div
        className="ph-deco"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.05 }}
      >
        <span className="ph-deco-line" />
        <FaPaw className="ph-deco-paw" />
        <span className="ph-deco-line" />
      </motion.div>

      <motion.h1
        className="ph-title"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
      >
        {title}
      </motion.h1>

      {(subtitle || script) && (
        <motion.p
          className="ph-sub"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.26, ease }}
        >
          {subtitle} {script && <span className="ph-script">{script}</span>}
        </motion.p>
      )}

      {tagline && (
        <motion.p
          className="ph-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {tagline}
        </motion.p>
      )}

      {children && (
        <motion.div
          className="ph-actions"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  </section>
);

export default PageHero;
