import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import feedbackApi from "../../../Services/api/feedbackApi";
import vetWithDogImg from "../../../assets/StatsSection/vet-with-dog.jpg";
import slide1a from "../../../assets/StatsSection/slide-1-a.jpg";
import slide1b from "../../../assets/StatsSection/slide-1-b.jpg";
import slide1c from "../../../assets/StatsSection/slide-1-c.jpg";
import slide2a from "../../../assets/StatsSection/slide-2-a.jpg";
import slide2b from "../../../assets/StatsSection/slide-2-b.jpg";
import slide2c from "../../../assets/StatsSection/slide-2-c.png";
import slide3a from "../../../assets/StatsSection/slide-3-a.jpg";
import slide3b from "../../../assets/StatsSection/slide-3-b.jpg";
import slide3c from "../../../assets/StatsSection/slide-3-c.png";
import "./StatsSection.css";

const STATS = [
  { value: "90K",  label: "Satisfied User" },
  { value: "150K", label: "Download" },
  { value: "95%",  label: "Project Success" },
];

const TESTIMONIALS = [
  {
    id: 1,
    author: "John Corner, Melbourne",
    text: "So far, this pet shop has proven to be the best in the area when it comes to providing expert and reliable services for pet owners. Their team operates with genuine care and passion.",
  },
  {
    id: 2,
    author: "Sarah Mitchell, Sydney",
    text: "I've been bringing my golden retriever here for over two years. The staff is knowledgeable, kind, and truly passionate about what they do. Couldn't recommend them more.",
  },
  {
    id: 3,
    author: "David Lim, Auckland",
    text: "The grooming service is exceptional and my cat actually enjoys going there now. The products are top-notch and the team always gives the best advice.",
  },
  {
    id: 4,
    author: "Priya Nair, Wellington",
    text: "Absolutely love this place. From the moment we walked in, the team made both me and my rabbit feel welcome. The care they provide is second to none.",
  },
  {
    id: 5,
    author: "James Okafor, Brisbane",
    text: "Five stars without hesitation. The veterinary team diagnosed my dog quickly and the follow-up care was outstanding. This is the only pet store I'll ever trust.",
  },
];

// Per-slide image sets: [tall-left, top-right, bottom-right]
const SLIDE_IMAGES = [
  [slide1a, slide1b, slide1c], // slide 1
  [slide2a, slide2b, slide2c], // slide 2
  [slide3a, slide3b, slide3c], // slide 3 (a reused for bottom-right)
  null,                         // slide 4 – placeholder
  null,                         // slide 5 – placeholder
];

const slideVariants = {
  enter: (d) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
};

const StatsSection = () => {
  const [[activeIdx, dir], setSlide] = useState([0, 1]);
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);
  const [usingDbData, setUsingDbData] = useState(false);

  // Fetch approved feedback on mount; fall back to hardcoded TESTIMONIALS on error/empty
  useEffect(() => {
    feedbackApi
      .getFeedback({ limit: 12 })
      .then((res) => {
        const items = res?.data;
        if (Array.isArray(items) && items.length > 0) {
          setTestimonials(
            items.map((fb, i) => ({
              id: fb._id || i,
              author: fb.role ? `${fb.name}, ${fb.role}` : fb.name,
              text: fb.message,
              rating: fb.rating,
              // each testimonial carries ONLY its own photos (string URL or {url})
              photos: (fb.photos || [])
                .map((p) => (typeof p === "string" ? p : p?.url))
                .filter(Boolean),
            }))
          );
          setUsingDbData(true);
        }
        // else keep hardcoded TESTIMONIALS
      })
      .catch(() => {
        // silently fall back to hardcoded data
      });
  }, []);

  const aboutRef       = useRef(null);
  const statsRef       = useRef(null);
  const testimonialRef = useRef(null);

  const aboutInView = useInView(aboutRef,       { once: true, amount: 0.3 });
  const statsInView  = useInView(statsRef,       { once: true, amount: 0.5 });
  const testInView   = useInView(testimonialRef, { once: true, amount: 0.2 });

  const go = (next) => setSlide(([cur]) => [next, next > cur ? 1 : -1]);
  const prev = () => go((activeIdx - 1 + testimonials.length) % testimonials.length);
  const next = () => go((activeIdx + 1) % testimonials.length);

  return (
    <section className="ss-section">
      <div className="ss-container">

        {/* ── About row ── */}
        <div className="ss-about" ref={aboutRef}>
          <motion.div
            className="ss-about-img-wrap"
            initial={{ opacity: 0, x: -50 }}
            animate={aboutInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="ss-about-img-clip">
              <img src={vetWithDogImg} alt="Vet with dog" className="ss-about-img" />
            </div>
          </motion.div>

          <motion.div
            className="ss-about-content"
            initial={{ opacity: 0, x: 50 }}
            animate={aboutInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2 className="ss-about-heading">
              Where your pets are at the heart of everything we do, Our mission
              is to provide exceptional care.
            </h2>
            <p className="ss-about-body">
              From grooming to wellness, we cover every aspect of your pet's
              needs. Our team stays updated on the latest in pet care to provide
              the best solutions for you and your furry friends.
            </p>

            <div className="ss-stats" ref={statsRef}>
              {STATS.map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  className="ss-stat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 * i }}
                >
                  <span className="ss-stat-value">{value}</span>
                  <span className="ss-stat-label">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Testimonials ── */}
        <div ref={testimonialRef}>
          <motion.h3
            className="ss-test-heading"
            initial={{ opacity: 0, y: -16 }}
            animate={testInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            What Our Client Say
          </motion.h3>

          <div className="ss-test-row">
            {/* ── Quote card ── */}
            <motion.div
              className="ss-test-card"
              initial={{ opacity: 0, y: 30 }}
              animate={testInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <div className="ss-test-slide-wrap">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={`quote-${activeIdx}`}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                    className="ss-test-inner"
                  >
                    <span className="ss-test-author-pill">
                      {testimonials[activeIdx].author}
                    </span>
                    <p className="ss-test-quote">
                      {testimonials[activeIdx].text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="ss-test-nav">
                <button className="ss-nav-btn" onClick={prev} aria-label="Previous">
                  <FaArrowLeft size={18} />
                </button>
                <button className="ss-nav-btn" onClick={next} aria-label="Next">
                  <FaArrowRight size={18} />
                </button>
              </div>
            </motion.div>

            {/* ── Image grid card — slides with testimonial ── */}
            <motion.div
              className="ss-test-imgs-card"
              initial={{ opacity: 0, y: 30 }}
              animate={testInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={`imgs-${activeIdx}`}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                  className="ss-imgs-grid"
                >
                  {(() => {
                    // DB-backed feedback: show ONLY this testimonial's own photos —
                    // never the hardcoded SLIDE_IMAGES (that fallback was the wrong-photo bug).
                    if (usingDbData) {
                      const photos = testimonials[activeIdx]?.photos || [];
                      if (photos.length === 0) {
                        const initial = (testimonials[activeIdx]?.author || "?").charAt(0).toUpperCase();
                        return (
                          <div
                            style={{
                              gridColumn: "1 / -1", gridRow: "1 / -1",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              minHeight: 200, borderRadius: 16,
                              background: "linear-gradient(135deg, #001C10, #0B2016)",
                            }}
                          >
                            <span style={{ fontSize: "3.5rem", fontWeight: 700, color: "#D99A2B" }}>{initial}</span>
                          </div>
                        );
                      }
                      return (
                        <>
                          {photos[0]
                            ? <img src={photos[0]} alt="" className="ss-slide-img ss-slide-img--tall" />
                            : <div className="ss-img-placeholder ss-img-placeholder--tall" />}
                          {photos[1]
                            ? <img src={photos[1]} alt="" className="ss-slide-img" />
                            : <div className="ss-img-placeholder" />}
                          {photos[2]
                            ? <img src={photos[2]} alt="" className="ss-slide-img" />
                            : <div className="ss-img-placeholder" />}
                        </>
                      );
                    }
                    // Hardcoded fallback (no approved feedback): demo slide images
                    const staticImages = SLIDE_IMAGES[activeIdx];
                    if (staticImages) {
                      return (
                        <>
                          <img src={staticImages[0]} alt="" className="ss-slide-img ss-slide-img--tall" />
                          <img src={staticImages[1]} alt="" className="ss-slide-img" />
                          <img src={staticImages[2]} alt="" className="ss-slide-img" />
                        </>
                      );
                    }
                    return (
                      <>
                        <div className="ss-img-placeholder ss-img-placeholder--tall" />
                        <div className="ss-img-placeholder" />
                        <div className="ss-img-placeholder" />
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Dot indicators */}
          <div className="ss-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`ss-dot${i === activeIdx ? " ss-dot--active" : ""}`}
                onClick={() => go(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default StatsSection;
