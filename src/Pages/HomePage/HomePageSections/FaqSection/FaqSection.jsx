import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import faqsApi from "../../../../Services/api/faqsApi";
import "./FaqSection.css";

const FALLBACK_FAQS = [
  {
    q: "Do you offer 24/7 emergency veterinary care?",
    a: "Yes. Our veterinary team is on call around the clock for urgent and emergency cases. Call our hotline any time and we'll guide you through the next steps and arrange immediate care.",
  },
  {
    q: "How do I book an appointment?",
    a: "Head to the Services page or the Appointments section, pick the service and a professional, choose a time slot, and confirm. You'll get a confirmation and can manage the booking from your profile.",
  },
  {
    q: "Do you deliver pet supplies, and where?",
    a: "We deliver across Mauritius. Add items to your cart, check out, and track your order from “My Orders”. Delivery times and any fees are shown at checkout.",
  },
  {
    q: "What services do you provide besides the store?",
    a: "Veterinary care, grooming, pet training, pet taxi, boarding, adoption & rescue, and import/export logistics — all bookable online with certified professionals.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major cards and online payments through our secure checkout. Prices are shown in your selected currency, with the base amount in MUR.",
  },
  {
    q: "Can I manage my pets and orders in one place?",
    a: "Absolutely. Your profile lets you add your pets (with photos), view and track orders, manage appointments, and update your details — all from a single dashboard.",
  },
];

const FaqItem = ({ item, isOpen, onToggle }) => (
  <div className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
    <button
      type="button"
      className="faq-question"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <span>{item.q}</span>
      <span className="faq-icon" aria-hidden="true">
        <FiChevronDown size={18} />
      </span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          className="faq-answer-wrap"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="faq-answer">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(0);
  const [faqs, setFaqs] = useState(FALLBACK_FAQS);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  // Admin-managed FAQs from the API; fall back to the curated defaults.
  useEffect(() => {
    faqsApi
      .getFaqs()
      .then((res) => {
        const items = res?.data;
        if (Array.isArray(items) && items.length > 0) {
          setFaqs(items.map((f) => ({ q: f.question, a: f.answer })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="faq-section" ref={ref}>
      <motion.div
        className="faq-header"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <p className="faq-eyebrow">Frequently asked questions</p>
        <h2 className="faq-title">Everything you need to know</h2>
        <p className="faq-subtitle">
          Answers to the questions we hear most. Still curious? Reach out through the form below.
        </p>
      </motion.div>

      <motion.div
        className="faq-list"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        {faqs.map((item, i) => (
          <FaqItem
            key={item.q}
            item={item}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx((cur) => (cur === i ? -1 : i))}
          />
        ))}
      </motion.div>
    </section>
  );
};

export default FaqSection;
