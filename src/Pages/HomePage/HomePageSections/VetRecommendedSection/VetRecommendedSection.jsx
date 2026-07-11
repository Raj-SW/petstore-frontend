import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
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

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    productsApi
      .getProducts({ vetRecommended: true, isActive: true, limit: 4 })
      .then((res) => setProducts(res?.data ?? []))
      .catch((err) => console.error("Error fetching vet recommended products:", err))
      .finally(() => setLoading(false));
  }, []);

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

      <motion.div
        className="vr-grid"
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
