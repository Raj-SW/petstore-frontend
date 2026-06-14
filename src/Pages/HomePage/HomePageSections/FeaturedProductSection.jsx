import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import ProductCard from "../../../Components/HelperComponents/ProductCard/ProductCardV2";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/Components/ui/carousel";
import { buildCarouselPlugins } from "./featuredAutoplay";
import productsApi from "@/Services/api/productsApi";
import "./FeaturedProductSection.css";

// Keys must exactly match the category values stored in the DB
const TABS = [
  { key: "general", label: "General" },
  { key: "dogs",    label: "Dogs" },
  { key: "cats",    label: "Cats" },
  { key: "fish",    label: "Fish" },
];

// "Load all" — featured sets are admin-curated and small; the /products
// endpoint defaults to limit=10 and has no hard cap, so a generous limit
// returns every featured item for any realistic catalog.
const FEATURED_LIMIT = 100;

const FeaturedProductSection = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [products, setProducts] = useState({ cats: [], dogs: [], fish: [], general: [] });
  const [loading, setLoading] = useState(true);

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, amount: 0.3 });

  const plugins = useMemo(() => buildCarouselPlugins(), []);

  // Embla api + dot state (re-bound each time the carousel re-mounts per tab)
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
    let resolved = 0;
    TABS.forEach(({ key }) => {
      productsApi
        .getFeaturedByCategory(key, FEATURED_LIMIT)
        .then((data) => {
          setProducts((prev) => ({ ...prev, [key]: data }));
        })
        .catch((err) => console.error(`Error fetching featured ${key}:`, err))
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

      {/* Category tabs — sliding pill */}
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

      {/* Product carousel */}
      <div className="fp-grid-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="fp-carousel-shell"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="fp-skeleton-row">
                {Array(3).fill(null).map((_, i) => (
                  <div key={i} className="fp-skeleton" />
                ))}
              </div>
            ) : currentProducts.length === 0 ? (
              <p className="fp-empty">No products available right now.</p>
            ) : (
              <Carousel
                className="fp-carousel"
                opts={{ align: "start" }}
                plugins={plugins}
                setApi={setEmblaApi}
              >
                <CarouselContent>
                  {currentProducts.map((product) => (
                    <CarouselItem
                      key={product._id || product.id}
                      className="basis-[83%] sm:basis-1/2 lg:basis-1/3"
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
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="fp-arrow fp-arrow-prev" />
                <CarouselNext className="fp-arrow fp-arrow-next" />
              </Carousel>
            )}
          </motion.div>
        </AnimatePresence>

        {!loading && currentProducts.length > 0 && snaps.length > 1 && (
          <div className="fp-dots">
            {snaps.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`fp-dot${i === selected ? " fp-dot-active" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductSection;
