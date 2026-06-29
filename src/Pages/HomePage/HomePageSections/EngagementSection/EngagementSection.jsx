import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import contactApi from "../../../../Services/api/contactApi";
import { useToast } from "../../../../context/ToastContext";
import FeedbackForm from "./FeedbackForm";
import PromoSlideshow from "./PromoSlideshow";
import "./EngagementSection.css";

const TABS = [
  { key: "question", label: "Ask a Question" },
  { key: "feedback", label: "Leave Feedback" },
];

const EngagementSection = () => {
  const [activeTab, setActiveTab] = useState("question");

  // Contact / question form state
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });

  const { addToast } = useToast();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await contactApi.submitContact(form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      addToast("Message sent! We'll get back to you shortly.", "success");
    } catch {
      setStatus("error");
      addToast("Something went wrong. Please try again.", "error");
    }
  };

  return (
    <section className="es-section" ref={sectionRef}>
      <div className="es-container">

        {/* ── Section heading ── */}
        <motion.div
          className="es-header"
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="es-title">Get in Touch</h2>
          <p className="es-subtitle">
            Have a question or want to share your experience? We&apos;d love to hear from you.
          </p>
        </motion.div>

        {/* ── Sliding-pill tab bar ── */}
        <motion.div
          className="es-tabs-wrapper"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="es-tabs">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                className={`es-tab${activeTab === key ? " es-tab-active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {activeTab === key && (
                  <motion.span
                    className="es-tab-bg"
                    layoutId="es-tab-indicator"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="es-tab-label">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Two-panel body: Form panel + Promo panel that swap sides per tab ── */}
        <div className="es-body">
          {(activeTab === "question" ? ["form", "promo"] : ["promo", "form"]).map((panel) =>
            panel === "form" ? (
              <motion.div
                key="form"
                layout
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="es-panel es-panel-form"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    className="es-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {activeTab === "question" ? (
                      <div className="es-form-wrap">
                        <h3 className="es-form-heading">
                          Connecting You with Care for Your Beloved Pets
                        </h3>
                        <p className="es-form-subheading">
                          We&apos;re here to answer your questions and provide support.
                        </p>

                        <form className="es-form" onSubmit={handleContactSubmit}>
                          <div className="es-field">
                            <label className="es-label" htmlFor="es-name">Your Name</label>
                            <input
                              id="es-name"
                              className="es-input"
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              placeholder="Darlene Robertson"
                              required
                            />
                          </div>

                          <div className="es-field">
                            <label className="es-label" htmlFor="es-email">Your Email Address</label>
                            <input
                              id="es-email"
                              className="es-input"
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              placeholder="darlenerobert@mail.com"
                              required
                            />
                          </div>

                          <div className="es-field">
                            <label className="es-label" htmlFor="es-message">Message</label>
                            <textarea
                              id="es-message"
                              className="es-input es-textarea"
                              name="message"
                              value={form.message}
                              onChange={handleChange}
                              placeholder="How can we help you and your furry friend?"
                              required
                            />
                          </div>

                          <button
                            className="es-submit"
                            type="submit"
                            disabled={status === "loading"}
                          >
                            {status === "loading" ? (
                              <>
                                <span className="es-spinner" />{" "}
                                Sending&hellip;
                              </>
                            ) : (
                              "Send Message"
                            )}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <FeedbackForm />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="promo"
                layout
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="es-panel es-panel-promo"
              >
                <PromoSlideshow />
              </motion.div>
            )
          )}
        </div>

      </div>
    </section>
  );
};

export default EngagementSection;
