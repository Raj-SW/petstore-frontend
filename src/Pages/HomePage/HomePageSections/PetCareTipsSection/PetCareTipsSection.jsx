import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { FaPaw, FaArrowRight } from "react-icons/fa";
import tipsApi from "../../../../Services/api/tipsApi";
import { coverUrl } from "../../../../utils/coverImage";
import "./PetCareTipsSection.css";

const ease = [0.25, 0.46, 0.45, 0.94];

const metaLine = (tip) =>
  [tip.animalType, tip.category, tip.readTime ? `${tip.readTime} min read` : null]
    .filter(Boolean)
    .join(" · ");

const PetCareTipsSection = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    tipsApi
      .getTips({ limit: 3 })
      .then((res) => setTips(res?.data ?? []))
      .catch((err) => console.error("Error fetching pet care tips:", err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && tips.length === 0) return null;

  const activeTip = tips[active];
  const activeCover = activeTip ? coverUrl(activeTip.coverImage) : "";

  return (
    <section className="pcts-section">
      <motion.div
        ref={headerRef}
        className="pcts-header"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="pcts-deco" aria-hidden="true">
          <span className="pcts-deco-line" />
          <FaPaw className="pcts-deco-paw" />
          <span className="pcts-deco-line" />
        </div>
        <h2 className="pcts-title">Pet Care Tips</h2>
        <p className="pcts-script">advice from our vets</p>
      </motion.div>

      {!loading && (
        <div className="pcts-editorial">
          <ol className="pcts-index">
            {tips.map((tip, i) => (
              <motion.li
                key={tip._id || tip.slug}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease }}
              >
                <Link
                  to={`/pet-care-tips/${tip.slug || tip._id}`}
                  className={`pcts-row${i === active ? " pcts-row--active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <span className="pcts-thumb" aria-hidden="true">
                    {coverUrl(tip.coverImage) ? (
                      <img src={coverUrl(tip.coverImage)} alt="" loading="lazy" />
                    ) : (
                      <FaPaw className="pcts-thumb-paw" />
                    )}
                  </span>
                  <span className="pcts-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pcts-rowbody">
                    <span className="pcts-rowtitle">{tip.title}</span>
                    <span className="pcts-rowmeta">{metaLine(tip)}</span>
                  </span>
                  <FaArrowRight className="pcts-rowarrow" aria-hidden="true" />
                </Link>
              </motion.li>
            ))}
          </ol>

          <div className="pcts-frame" aria-hidden="true">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTip?._id || active}
                className="pcts-frame-media"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease }}
              >
                {activeCover ? (
                  <img src={activeCover} alt="" />
                ) : (
                  <span className="pcts-frame-fallback" data-testid="pcts-frame-fallback">
                    <FaPaw />
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
            <span className="pcts-frame-caption" data-testid="pcts-frame-caption">
              {activeTip?.title}
            </span>
          </div>
        </div>
      )}

      <div className="pcts-cta-row">
        <Link to="/pet-care-tips" className="pcts-cta-btn">View All Articles</Link>
      </div>
    </section>
  );
};

export default PetCareTipsSection;
