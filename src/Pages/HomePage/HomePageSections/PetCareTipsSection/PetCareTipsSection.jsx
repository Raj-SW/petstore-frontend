import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import TipCard from "../../../PetCareTips/components/TipCard";
import "../../../PetCareTips/PetCareTips.css";
import tipsApi from "../../../../Services/api/tipsApi";
import "./PetCareTipsSection.css";

const PetCareTipsSection = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="pcts-section">
      <motion.div
        ref={headerRef}
        className="pcts-header"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className="pcts-title">Pet Care Tips</h2>
      </motion.div>

      {!loading && (
        <div className="pcts-grid">
          {tips.map((tip) => (
            <TipCard key={tip._id || tip.slug} tip={tip} />
          ))}
        </div>
      )}

      <div className="pcts-cta-row">
        <a href="/pet-care-tips" className="pcts-cta-btn">View All Articles</a>
      </div>
    </section>
  );
};

export default PetCareTipsSection;
