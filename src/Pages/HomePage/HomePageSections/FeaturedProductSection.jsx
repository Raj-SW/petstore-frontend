import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import ProductCard from "../../../Components/HelperComponents/ProductCard/ProductCardV2";
import ProductService from "@/Services/localServices/ProductService";
import "./FeaturedProductSection.css";

const TABS = [
  { key: "cat",     label: "Cats" },
  { key: "dog",     label: "Dogs" },
  { key: "fish",    label: "Fish" },
  { key: "general", label: "General" },
];

const FeaturedProductSection = () => {
  const [activeTab, setActiveTab] = useState("cat");
  const [products, setProducts] = useState({ cat: [], dog: [], fish: [], general: [] });
  const [loading, setLoading] = useState(true);

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    let resolved = 0;
    TABS.forEach(({ key }) => {
      ProductService.fetchProductsByCategory(key)
        .then((data) => {
          // Prefer featured-flagged products; fall back to first 3 if none are flagged
          const featured = data.filter((p) => p.featured || p.isFeatured);
          setProducts((prev) => ({
            ...prev,
            [key]: (featured.length > 0 ? featured : data).slice(0, 3),
          }));
        })
        .catch((err) => console.error(`Error fetching ${key}:`, err))
        .finally(() => {
          resolved++;
          if (resolved === TABS.length) setLoading(false);
        });
    });
  }, []);

  const currentProducts = products[activeTab];

  return (
    <section className="fp-section">
      {/* Header */}
      <motion.div
        ref={headerRef}
        className="fp-header"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className="fp-title">Featured Products</h2>
        <a href="/petshop" className="fp-view-more-btn">View More &rsaquo;</a>
      </motion.div>

      {/* Category tabs — 21st.dev sliding pill */}
      <motion.div
        className="fp-tabs-wrapper"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="fp-tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`fp-tab${activeTab === key ? " fp-tab-active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {activeTab === key && (
                <motion.span
                  className="fp-tab-bg"
                  layoutId="fp-tab-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="fp-tab-label">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Product grid */}
      <div className="fp-grid-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="fp-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="fp-skeleton" />
              ))
            ) : currentProducts.length === 0 ? (
              <p className="fp-empty">No featured products available right now.</p>
            ) : (
              currentProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  id={product._id || product.id}
                  imageUrl={product.images?.[0]?.url || product.images?.[0] || product.imageUrl}
                  title={product.name || product.title}
                  price={product.price}
                  description={product.description}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FeaturedProductSection;
