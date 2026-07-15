import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import ProductCard from "../../../../Components/HelperComponents/ProductCard/ProductCardV2";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/Components/ui/carousel";
import SkeletonCard from "../../../../Components/HelperComponents/SkeletonCard/SkeletonCard";
import productsApi from "@/Services/api/productsApi";
import "./VetRecommendedSection.css";

const VetRecommendedSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, amount: 0.3 });

  // Embla api + dot state — same pattern as FeaturedProductSection's carousel
  const [emblaApi, setEmblaApi] = useState(null);
  const [snaps, setSnaps] = useState([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    const onReInit = () => {
      setSnaps(emblaApi.scrollSnapList());
      onSelect();
    };
    onReInit();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi]);

  useEffect(() => {
    productsApi
      // limit must exceed the 4 visible on desktop, or Embla has nothing to
      // scroll and both arrows render permanently disabled.
      .getProducts({ vetRecommended: true, isActive: true, limit: 8 })
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

      <div className="vr-carousel-shell">
        {loading ? (
          <div className="vr-skeleton-row">
            <SkeletonCard variant="card" count={4} />
          </div>
        ) : (
          <Carousel className="vr-carousel" opts={{ align: "start" }} setApi={setEmblaApi}>
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem
                  key={product._id || product.id}
                  className="basis-[83%] sm:basis-1/2 lg:basis-1/4"
                >
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
                </CarouselItem>
              ))}
            </CarouselContent>
            {snaps.length > 1 && (
              <>
                <CarouselPrevious className="vr-arrow vr-arrow-prev" />
                <CarouselNext className="vr-arrow vr-arrow-next" />
              </>
            )}
          </Carousel>
        )}

        {!loading && products.length > 1 && snaps.length > 1 && (
          <div className="vr-dots">
            {snaps.map((snap, i) => (
              <button
                key={`snap-${snap ?? i}`}
                type="button"
                className={`vr-dot${i === selected ? " vr-dot-active" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
              />
            ))}
          </div>
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
