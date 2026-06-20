import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import advertsApi from "../../Services/api/advertsApi";
import petshopBanner from "../../assets/PetShopPageAssets/PetshopBannerBackgroundImg.png";
import "./ShopBanner.css";

const INTERVAL = 6000;

// Branded default shown when no `shop` adverts are active.
const FALLBACK = {
  id: "fallback",
  title: "Everything for your beloved pet",
  subtitle: "Curated essentials, premium nutrition, and unique finds — all in one place.",
  image: petshopBanner,
  link: null,
  fallback: true,
};

const slideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const ShopBanner = () => {
  const [slides, setSlides] = useState([FALLBACK]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    advertsApi
      .getAdverts("shop")
      .then((res) => {
        const ads = res?.data || [];
        if (ads.length) {
          setSlides(ads.map((a) => ({
            id: a._id,
            title: a.title,
            subtitle: "",
            image: a.image,
            link: a.link,
          })));
          setActive(0);
        }
      })
      .catch(() => {}); // keep the fallback on failure
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = setTimeout(() => setActive((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearTimeout(id);
  }, [active, slides.length]);

  const slide = slides[active] || slides[0];
  if (!slide) return null;

  const external = typeof slide.link === "string" && slide.link.startsWith("http");
  const cta = slide.link ? (
    <span className="shb-cta">
      Shop now <FiArrowRight size={15} aria-hidden="true" />
    </span>
  ) : null;

  const inner = (
    <>
      <div className="shb-overlay" />
      <div className="shb-content">
        <h1 className="shb-title">{slide.title}</h1>
        {slide.subtitle && <p className="shb-subtitle">{slide.subtitle}</p>}
        {cta}
      </div>
    </>
  );

  return (
    <section className="shb-wrap">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id ?? active}
          className="shb-slide"
          style={{ backgroundImage: slide.image ? `url(${slide.image})` : undefined }}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {slide.link ? (
            <a
              className="shb-link"
              href={slide.link}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              {inner}
            </a>
          ) : (
            <div className="shb-link shb-link--static">{inner}</div>
          )}
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <div className="shb-dots">
          {slides.map((s, i) => (
            <button
              key={s.id ?? i}
              type="button"
              className={`shb-dot${i === active ? " shb-dot--active" : ""}`}
              aria-label={`Go to banner ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ShopBanner;
