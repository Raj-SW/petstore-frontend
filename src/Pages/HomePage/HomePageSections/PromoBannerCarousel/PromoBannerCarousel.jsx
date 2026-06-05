import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./PromoBannerCarousel.css";

// Desktop / Tablet / Mobile banner sets
import felixD  from "../../../../assets/BannerSliderAssets/Desktop/Felix_homepage_banner_Desktop.webp";
import hillsD  from "../../../../assets/BannerSliderAssets/Desktop/Hills_homepage_banner_Desktop.webp";
import huntD   from "../../../../assets/BannerSliderAssets/Desktop/Huntland_Homepage_Banners_Desktop.webp";
import nmD     from "../../../../assets/BannerSliderAssets/Desktop/NM_homepage_banner_Desktop.webp";
import rcD     from "../../../../assets/BannerSliderAssets/Desktop/RC_homepage_banner_Desktop.webp";
import vitD    from "../../../../assets/BannerSliderAssets/Desktop/Vitalin_homepage_banner_Desktop.webp";

import felixT  from "../../../../assets/BannerSliderAssets/Tablet/Felix_homepage_banner_Tablet.webp";
import hillsT  from "../../../../assets/BannerSliderAssets/Tablet/Hills_homepage_banner_Tablet.webp";
import nmT     from "../../../../assets/BannerSliderAssets/Tablet/NM_homepage_banner_Tablet.webp";
import rcT     from "../../../../assets/BannerSliderAssets/Tablet/RC_homepage_banner_Tablet.webp";
import vitT    from "../../../../assets/BannerSliderAssets/Tablet/Vitalin_homepage_banner_Tablet.webp";

import felixM  from "../../../../assets/BannerSliderAssets/Mobile/Felix_homepage_banner_Mobile.webp";
import hillsM  from "../../../../assets/BannerSliderAssets/Mobile/Hills_homepage_banner_Mobile.webp";
import huntM   from "../../../../assets/BannerSliderAssets/Mobile/Huntland_Homepage_Banners_Mobile.webp";
import nmM     from "../../../../assets/BannerSliderAssets/Mobile/NM_homepage_banner_Mobile.webp";
import rcM     from "../../../../assets/BannerSliderAssets/Mobile/RC_homepage_banner_Mobile.webp";
import vitM    from "../../../../assets/BannerSliderAssets/Mobile/Vitalin_homepage_banner_Mobile.webp";

const SLIDES = [
  { id: "felix",   desktop: felixD, tablet: felixT, mobile: felixM,  alt: "Felix" },
  { id: "hills",   desktop: hillsD, tablet: hillsT, mobile: hillsM,  alt: "Hills" },
  { id: "huntland",desktop: huntD,  tablet: huntD,  mobile: huntM,   alt: "Huntland" },
  { id: "nm",      desktop: nmD,    tablet: nmT,    mobile: nmM,     alt: "NM" },
  { id: "rc",      desktop: rcD,    tablet: rcT,    mobile: rcM,     alt: "Royal Canin" },
  { id: "vitalin", desktop: vitD,   tablet: vitT,   mobile: vitM,    alt: "Vitalin" },
];

const INTERVAL = 4500;

const variants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

const PromoBannerCarousel = () => {
  const [[index, dir], setSlide] = useState([0, 1]);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next) => {
    setSlide(([cur]) => {
      const d = next > cur ? 1 : -1;
      return [next, d];
    });
  }, []);

  const prev = () => go((index - 1 + SLIDES.length) % SLIDES.length);
  const next = () => go((index + 1) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go((index + 1) % SLIDES.length), INTERVAL);
    return () => clearTimeout(id);
  }, [index, paused, go]);

  const slide = SLIDES[index];

  return (
    <div
      className="pbc-root"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
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
            <picture>
              <source media="(max-width: 575px)"  srcSet={slide.mobile} />
              <source media="(max-width: 1024px)" srcSet={slide.tablet} />
              <img src={slide.desktop} alt={slide.alt} className="pbc-img" />
            </picture>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next arrows */}
      <button className="pbc-arrow pbc-arrow--prev" onClick={prev} aria-label="Previous">
        &#8249;
      </button>
      <button className="pbc-arrow pbc-arrow--next" onClick={next} aria-label="Next">
        &#8250;
      </button>

      {/* Dot indicators */}
      <div className="pbc-dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`pbc-dot${i === index ? " pbc-dot--active" : ""}`}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <motion.div
          key={`${index}-bar`}
          className="pbc-progress"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: INTERVAL / 1000, ease: "linear" }}
        />
      )}
    </div>
  );
};

export default PromoBannerCarousel;
