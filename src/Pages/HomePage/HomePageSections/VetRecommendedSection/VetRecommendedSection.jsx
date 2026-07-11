import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "../../../../Components/HelperComponents/ProductCard/ProductCardV2";
import SkeletonCard from "../../../../Components/HelperComponents/SkeletonCard/SkeletonCard";
import productsApi from "@/Services/api/productsApi";
import "./VetRecommendedSection.css";

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const VetRecommendedSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const inView = useInView(headerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    productsApi
      .getProducts({ vetRecommended: true, isActive: true, limit: 4 })
      .then((res) => setProducts(res?.data ?? []))
      .catch((err) => console.error("Error fetching vet recommended products:", err))
      .finally(() => setLoading(false));
  }, []);

  // Track which card is centered/leading in the mobile scroll-snap carousel
  // so the dots + arrow disabled-state stay in sync with manual swipes.
  const handleScroll = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    const children = [...el.children];
    if (children.length === 0) return;
    let closest = 0;
    let minDist = Infinity;
    children.forEach((child, i) => {
      const dist = Math.abs(child.offsetLeft - el.scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }, []);

  const scrollToIndex = (index) => {
    const el = gridRef.current;
    const child = el?.children[index];
    if (!child) return;
    child.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="vr-section">
      <motion.div
        ref={headerRef}
        className="vr-header"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className="vr-title">Vet Recommended This Month</h2>
        <p className="vr-subtitle">Curated by our veterinary team</p>
      </motion.div>

      <div className="vr-carousel-wrap">
        <motion.div
          className="vr-grid"
          ref={gridRef}
          onScroll={handleScroll}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
        >
          {loading ? (
            <SkeletonCard variant="card" count={4} />
          ) : (
            products.map((product) => (
              <motion.div key={product._id || product.id} variants={cardVariants}>
                <ProductCard
                  id={product._id || product.id}
                  imageUrl={product.images?.[0]?.url || product.images?.[0] || product.imageUrl}
                  title={product.name || product.title}
                  price={product.price}
                  description={product.description}
                  salePrice={product.salePrice}
                  isOnSaleNow={product.isOnSaleNow}
                  discountPercentLabel={product.discountPercentLabel}
                  effectivePrice={product.effectivePrice}
                  variantsView={product.variantsView}
                />
              </motion.div>
            ))
          )}
        </motion.div>

        {!loading && products.length > 1 && (
          <>
            <button
              type="button"
              className="vr-arrow vr-arrow-prev"
              aria-label="Previous product"
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
            >
              <FaChevronLeft size={14} />
            </button>
            <button
              type="button"
              className="vr-arrow vr-arrow-next"
              aria-label="Next product"
              onClick={() => scrollToIndex(Math.min(products.length - 1, activeIndex + 1))}
              disabled={activeIndex === products.length - 1}
            >
              <FaChevronRight size={14} />
            </button>

            <div className="vr-dots" role="tablist" aria-label="Vet recommended products">
              {products.map((product, i) => (
                <button
                  key={product._id || product.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  className={`vr-dot${i === activeIndex ? " vr-dot-active" : ""}`}
                  aria-label={`Go to product ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="vr-cta-row">
        <motion.a
          href="/petshop"
          className="vr-cta-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Explore the Store
        </motion.a>
      </div>
    </section>
  );
};

export default VetRecommendedSection;
