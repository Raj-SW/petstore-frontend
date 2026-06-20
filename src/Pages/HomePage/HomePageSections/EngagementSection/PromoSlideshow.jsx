import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import advertsApi from "../../../../Services/api/advertsApi";
// Reuse the original promo-card styling from the Contact section.
import "../ContactSection/ContactSection.css";

// Shown when there are no active `promo` adverts yet.
const FALLBACK_SLIDES = [
  {
    id: "f1",
    badge: "Get 50% Discount",
    title: "Celebrate the Joy of Christmas with Your Pets!",
    desc: "This holiday season, let's make it special for every member of the family—including your furry friends!",
  },
  {
    id: "f2",
    badge: "New Arrivals",
    title: "Premium Pet Food — Now In Stock",
    desc: "Explore our latest range of vet-approved nutrition plans tailored for every breed and age.",
  },
  {
    id: "f3",
    badge: "Free Grooming",
    title: "Book Any Service, Get Grooming Free",
    desc: "Treat your pet to a full grooming session on us when you book a vet or boarding appointment this month.",
  },
];

const INTERVAL = 4000;

const slideVariants = {
  enter: (d) => ({ x: d > 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit: (d) => ({ x: d > 0 ? "-100%" : "100%" }),
};

/**
 * Auto-advancing promo carousel driven by admin-managed `promo` adverts,
 * falling back to the original hardcoded slides when none are active.
 */
const PromoSlideshow = () => {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [[active, dir], setSlide] = useState([0, 1]);

  useEffect(() => {
    advertsApi
      .getAdverts("promo")
      .then((res) => {
        const ads = res?.data || [];
        if (ads.length) {
          setSlides(
            ads.map((a) => ({
              id: a._id,
              badge: "Promo",
              title: a.title,
              desc: "",
              image: a.image,
              link: a.link,
            }))
          );
          setSlide([0, 1]);
        }
      })
      .catch(() => {}); // keep the fallback slides on failure
  }, []);

  const goTo = (next) => setSlide(([cur]) => [next, next > cur ? 1 : -1]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = setTimeout(() => goTo((active + 1) % slides.length), INTERVAL);
    return () => clearTimeout(id);
  }, [active, slides.length]);

  const slide = slides[active] || slides[0];
  if (!slide) return null;

  const card = (
    <div className="cs-promo-card">
      <AnimatePresence mode="popLayout" custom={dir}>
        <motion.div
          key={slide.id ?? active}
          className="cs-promo-slide"
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="cs-promo-badge">{slide.badge}</span>

          <div
            className="cs-promo-img"
            style={
              slide.image
                ? { backgroundImage: `url(${slide.image})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          />

          <div className="cs-promo-overlay">
            <h3 className="cs-promo-title">{slide.title}</h3>
            {slide.desc && <p className="cs-promo-desc">{slide.desc}</p>}

            <div className="cs-promo-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`cs-promo-dot${i === active ? " cs-promo-dot--active" : ""}`}
                  onClick={(e) => { e.preventDefault(); goTo(i); }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // Advert slides link out; the whole card is clickable.
  return slide.link ? (
    <a
      href={slide.link}
      className="es-promo-link"
      target={slide.link.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      {card}
    </a>
  ) : (
    card
  );
};

export default PromoSlideshow;
