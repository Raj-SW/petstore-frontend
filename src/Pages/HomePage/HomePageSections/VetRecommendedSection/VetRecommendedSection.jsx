import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import ProductCard from "../../../../Components/HelperComponents/ProductCard/ProductCardV2";
import SkeletonCard from "../../../../Components/HelperComponents/SkeletonCard/SkeletonCard";
import productsApi from "@/Services/api/productsApi";
import "./VetRecommendedSection.css";

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

      <div className="vr-grid">
        {loading ? (
          <SkeletonCard variant="card" count={4} />
        ) : (
          products.map((product) => (
            <ProductCard
              key={product._id || product.id}
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
          ))
        )}
      </div>

      <div className="vr-cta-row">
        <a href="/petshop" className="vr-cta-btn">Explore the Store</a>
      </div>
    </section>
  );
};

export default VetRecommendedSection;
