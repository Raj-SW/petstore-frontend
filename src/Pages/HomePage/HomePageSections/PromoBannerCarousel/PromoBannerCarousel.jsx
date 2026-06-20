import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import advertsApi from "../../../../Services/api/advertsApi";
import "./PromoBannerCarousel.css";

const INTERVAL = 4500;

const variants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

// Wrap a slide image in a link when the banner has one.
const SlideMedia = ({ slide }) => {
  const img = <img src={slide.image} alt={slide.alt} className="pbc-img" />;
  if (!slide.link) return img;
  const external = slide.link.startsWith("http");
  return (
    <a
      href={slide.link}
      target={external ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="pbc-link"
    >
      {img}
    </a>
  );
};

const PromoBannerCarousel = () => {
  // null = still loading; [] = loaded but empty (hide)
  const [slides, setSlides] = useState(null);
  const [[index, dir], setSlide] = useState([0, 1]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let active = true;
    advertsApi
      .getAdverts("hero")
      .then((res) => {
        if (!active) return;
        const data = (res.data || []).map((a) => ({
          id: a._id,
          image: a.image,
          link: a.link,
          alt: a.title,
        }));
        setSlides(data);
      })
      .catch(() => {
        if (active) setSlides([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const count = slides?.length ?? 0;
  const multi = count > 1;

  const go = useCallback((next) => {
    setSlide(([cur]) => [next, next > cur ? 1 : -1]);
  }, []);

  useEffect(() => {
    if (!multi || paused) return;
    const id = setTimeout(() => go((index + 1) % count), INTERVAL);
    return () => clearTimeout(id);
  }, [index, paused, go, multi, count]);

  // Loading or empty → render nothing.
  if (!slides || count === 0) return null;

  const safeIndex = index % count;
  const slide = slides[safeIndex];
  const prev = () => go((safeIndex - 1 + count) % count);
  const next = () => go((safeIndex + 1) % count);

  return (
    <div
      className="pbc-root"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pbc-track">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={slide.id}
            className="pbc-slide"
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.52, ease: [0.4, 0, 0.2, 1] }}
          >
            <SlideMedia slide={slide} />
          </motion.div>
        </AnimatePresence>
      </div>

      {multi && (
        <>
          <button className="pbc-arrow pbc-arrow--prev" onClick={prev} aria-label="Previous">
            &#8249;
          </button>
          <button className="pbc-arrow pbc-arrow--next" onClick={next} aria-label="Next">
            &#8250;
          </button>

          <div className="pbc-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`pbc-dot${i === safeIndex ? " pbc-dot--active" : ""}`}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {!paused && (
            <motion.div
              key={`${safeIndex}-bar`}
              className="pbc-progress"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: INTERVAL / 1000, ease: "linear" }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PromoBannerCarousel;
