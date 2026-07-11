import { motion } from "framer-motion";
import PtIcon from "../components/PtIcon";
import { staggerChild } from "../components/motionPresets";
import { ptTrustBar } from "../petTravelContent";

const PtTrustBar = () => (
  <section className="pt-section pt-trustbar-section" aria-label="Why choose VitalPaws for pet travel">
    <motion.ul
      className="pt-trustbar"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {ptTrustBar.map((item) => (
        <motion.li key={item.title} className="pt-trust-item" variants={staggerChild}>
          <span className="pt-trust-icon">
            <PtIcon name={item.icon} size={22} />
          </span>
          <div>
            <p className="pt-trust-title">{item.title}</p>
            <p className="pt-trust-desc">{item.desc}</p>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  </section>
);

export default PtTrustBar;
