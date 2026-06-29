import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./ContactSection.css";

const API_URL = import.meta.env.VITE_NODE_API_URL;

const PROMO_SLIDES = [
  {
    id: 1,
    badge: "Get 50% Discount",
    title: "Celebrate the Joy of Christmas with Your Pets!",
    desc: "This holiday season, let's make it special for every member of the family—including your furry friends!",
  },
  {
    id: 2,
    badge: "New Arrivals",
    title: "Premium Pet Food — Now In Stock",
    desc: "Explore our latest range of vet-approved nutrition plans tailored for every breed and age.",
  },
  {
    id: 3,
    badge: "Free Grooming",
    title: "Book Any Service, Get Grooming Free",
    desc: "Treat your pet to a full grooming session on us when you book a vet or boarding appointment this month.",
  },
];

const INTERVAL = 4000;

const slideVariants = {
  enter: (d) => ({ x: d > 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit:  (d) => ({ x: d > 0 ? "-100%" : "100%" }),
};

const ContactSection = () => {
  const [[activeSlide, dir], setSlide] = useState([0, 1]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const goTo = (next) => {
    setSlide(([cur]) => [next, next > cur ? 1 : -1]);
  };

  useEffect(() => {
    const id = setTimeout(
      () => goTo((activeSlide + 1) % PROMO_SLIDES.length),
      INTERVAL
    );
    return () => clearTimeout(id);
  }, [activeSlide]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await axios.post(`${API_URL}/contact`, form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="cs-section" ref={ref}>
      <div className="cs-container">

        {/* ── Left: form ── */}
        <motion.div
          className="cs-left"
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="cs-heading">
            Connecting You with Care for Your Beloved Pets
          </h2>
          <p className="cs-subheading">
            We're here to answer your questions and provide support.
          </p>

          <form className="cs-form" onSubmit={handleSubmit}>
            <div className="cs-field">
              <label className="cs-label" htmlFor="cs-name">Your Name</label>
              <input
                id="cs-name"
                className="cs-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Darlene Robertson"
                required
              />
            </div>

            <div className="cs-field">
              <label className="cs-label" htmlFor="cs-email">Your Email Address</label>
              <input
                id="cs-email"
                className="cs-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="darlenerobert@mail.com"
                required
              />
            </div>

            <div className="cs-field">
              <label className="cs-label" htmlFor="cs-message">Message</label>
              <textarea
                id="cs-message"
                className="cs-input cs-textarea"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help you and your furry friend?"
                required
              />
            </div>

            <button
              className="cs-submit"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <span className="cs-spinner" />{" "}
                  Sending…
                </>
              ) : "Send Message"}
            </button>

            {status === "success" && (
              <p className="cs-feedback cs-feedback--success">
                ✓ Message sent! We'll get back to you shortly.
              </p>
            )}
            {status === "error" && (
              <p className="cs-feedback cs-feedback--error">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        </motion.div>

        {/* ── Right: promo card carousel ── */}
        <motion.div
          className="cs-right"
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="cs-promo-card">
            <AnimatePresence mode="popLayout" custom={dir}>
              <motion.div
                key={activeSlide}
                className="cs-promo-slide"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Badge */}
                <span className="cs-promo-badge">
                  {PROMO_SLIDES[activeSlide].badge}
                </span>

                {/* Image placeholder */}
                <div className="cs-promo-img" />

                {/* Bottom overlay */}
                <div className="cs-promo-overlay">
                  <h3 className="cs-promo-title">
                    {PROMO_SLIDES[activeSlide].title}
                  </h3>
                  <p className="cs-promo-desc">
                    {PROMO_SLIDES[activeSlide].desc}
                  </p>

                  {/* Dots */}
                  <div className="cs-promo-dots">
                    {PROMO_SLIDES.map((slide, i) => (
                      <button
                        key={slide.id ?? i}
                        className={`cs-promo-dot${i === activeSlide ? " cs-promo-dot--active" : ""}`}
                        onClick={() => goTo(i)}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ContactSection;
