import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading";
import PtIcon from "../components/PtIcon";
import { staggerChild } from "../components/motionPresets";
import { ptProcess } from "../petTravelContent";

const TimelineStep = ({ step, index }) => (
  <motion.li
    className="pt-step"
    variants={staggerChild}
    whileHover={{ y: -6 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <div className="pt-step-icon">
      <PtIcon name={step.icon} size={26} />
    </div>
    <span className="pt-step-number" aria-hidden="true">{index + 1}</span>
    <h3 className="pt-step-title">{step.title}</h3>
    <p className="pt-step-desc">{step.desc}</p>
  </motion.li>
);

const PtProcess = () => (
  <section className="pt-section pt-process" aria-labelledby="pt-process-title">
    <SectionHeading
      id="pt-process-title"
      label={ptProcess.label}
      title={ptProcess.title}
      subtitle={ptProcess.subtitle}
    />

    <motion.ol
      className="pt-timeline"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {ptProcess.steps.map((step, i) => (
        <TimelineStep key={step.title} step={step} index={i} />
      ))}
    </motion.ol>
  </section>
);

export default PtProcess;
