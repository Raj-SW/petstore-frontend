import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFacebook, FaTwitter, FaInstagram, FaPlus, FaMinus,
  FaShoppingCart, FaShieldAlt, FaCheckCircle, FaExclamationTriangle,
  FaTag,
} from "react-icons/fa";
import { FiShare2, FiChevronLeft, FiChevronDown, FiChevronRight, FiSearch, FiX } from "react-icons/fi";

import "./IndividaulItemPage.css";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import LoginModal from "@/Components/NavigationBar/Dropdowns/LoginModal";
import SignUpModal from "@/Components/NavigationBar/Dropdowns/SignUpModal";
import { RichTextRenderer } from "@/Components/RichText";
import ProductPrice from "@/Components/HelperComponents/Price/ProductPrice";
import SaleBadge from "@/Components/HelperComponents/SaleBadge/SaleBadge";
import SubscribeWidget from "@/Components/Subscriptions/SubscribeWidget";
import ProductCard from "@/Components/HelperComponents/ProductCard/ProductCardV2";
import ReviewCarousel from "@/Components/HelperComponents/Carousel/ReviewCarousel";
import ProductReviewFormModal from "@/Components/HelperComponents/ProductReviewFormModal/ProductReviewFormModal";
import productsApi from "@/Services/api/productsApi";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

/* ─── Product Section Tabs ───────────────────────────────────────────────── */
const ProductSectionTabs = ({ sections = [] }) => {
  const validSections = sections.filter((s) => s.title && s.body);

  const [activeTab, setActiveTab]           = useState(0);
  const [openAccordion, setOpenAccordion]   = useState(0);
  const [showLeft, setShowLeft]             = useState(false);
  const [showRight, setShowRight]           = useState(false);
  const tabBarRef                           = useRef(null);

  const toggleAccordion = useCallback((i) =>
    setOpenAccordion((prev) => (prev === i ? -1 : i)), []);

  // Update scroll arrow visibility
  const updateArrows = useCallback(() => {
    const el = tabBarRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [validSections, updateArrows]);

  const scroll = (dir) => {
    tabBarRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
  };

  if (validSections.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="rounded-2xl overflow-hidden" style={{
        background: "#FAF5F1",
        boxShadow: "0 4px 6px rgba(0,28,16,0.04), 0 12px 40px rgba(0,28,16,0.12), 0 0 0 1px rgba(201,186,168,0.4)",
      }}>

        {/* ── Desktop: solid header + pill tabs ── */}
        <div className="hidden md:block">

          {/* Primary green header — same token as navbar */}
          <div className="relative p-1" style={{ background: "var(--color-primary-forest)" }}>

            {/* Inner glass pill bar */}
            <div className="relative rounded-xl" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}>
              <div className="relative flex items-center">

                {/* Left scroll arrow */}
                <AnimatePresence>
                  {showLeft && (
                    <motion.button
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => scroll(-1)}
                      className="absolute left-2 z-20 flex items-center justify-center border-none cursor-pointer"
                      style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(217,154,43,0.25)", color: "#D99A2B", flexShrink: 0 }}
                    >
                      <FiChevronLeft size={15} />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Scrollable tab list */}
                <div
                  ref={tabBarRef}
                  role="tablist"
                  className="flex gap-2 overflow-x-auto"
                  style={{
                    scrollbarWidth: "none",
                    padding: "0.5rem",
                    paddingLeft:  showLeft  ? "2.5rem" : "0.5rem",
                    paddingRight: showRight ? "2.5rem" : "0.5rem",
                  }}
                >
                  {validSections.map((tab, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={activeTab === i}
                      onClick={() => setActiveTab(i)}
                      className="relative border-none cursor-pointer font-sans whitespace-nowrap outline-none flex-shrink-0"
                      style={{
                        padding: "0.6rem 1.2rem",
                        borderRadius: 10,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        letterSpacing: "0.01em",
                        color: activeTab === i ? "#001C10" : "rgba(250,245,241,0.85)",
                        textShadow: activeTab === i ? "none" : "0 1px 3px rgba(0,0,0,0.4)",
                        background: "transparent",
                        transition: "color 0.2s",
                      }}
                    >
                      {/* Sliding gold pill */}
                      {activeTab === i && (
                        <motion.div
                          layoutId="ip-active-pill"
                          className="absolute inset-0"
                          style={{
                            borderRadius: 10,
                            background: "#D99A2B",
                            boxShadow: "0 2px 12px rgba(217,154,43,0.35)",
                          }}
                          transition={{ type: "spring", duration: 0.55, bounce: 0.18 }}
                        />
                      )}
                      <span className="relative z-10">{tab.title}</span>
                    </button>
                  ))}
                </div>

                {/* Right scroll arrow */}
                <AnimatePresence>
                  {showRight && (
                    <motion.button
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => scroll(1)}
                      className="absolute right-2 z-20 flex items-center justify-center border-none cursor-pointer"
                      style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(217,154,43,0.25)", color: "#D99A2B", flexShrink: 0 }}
                    >
                      <FiChevronRight size={15} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Content panel */}
          <div style={{ background: "#fff", padding: "2rem 2.25rem", minHeight: 200 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                exit={{ opacity: 0,    y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <RichTextRenderer content={validSections[activeTab]?.body ?? ""} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Mobile: accordion ── */}
        <div className="md:hidden">
          {validSections.map((tab, i) => (
            <div key={i} style={{ borderBottom: i < validSections.length - 1 ? "1px solid rgba(201,186,168,0.4)" : "none" }}>
              <button
                onClick={() => toggleAccordion(i)}
                aria-expanded={openAccordion === i}
                className="flex items-center justify-between w-full border-none cursor-pointer text-left font-sans"
                style={{
                  padding: "1rem 1.25rem",
                  background: "var(--color-primary-forest)",
                  borderBottom: openAccordion === i ? "2px solid #D99A2B" : "none",
                  transition: "background 0.2s",
                }}
              >
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#FAF5F1", letterSpacing: "0.01em" }}>
                  {tab.title}
                </span>
                <FiChevronDown style={{
                  color: openAccordion === i ? "#D99A2B" : "rgba(250,245,241,0.6)",
                  transition: "transform 0.25s, color 0.2s",
                  transform: openAccordion === i ? "rotate(180deg)" : "rotate(0deg)",
                  flexShrink: 0,
                }} />
              </button>

              <AnimatePresence initial={false}>
                {openAccordion === i && (
                  <motion.div key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "1.25rem 1.25rem 1.5rem", background: "#FAF5F1" }}>
                      <RichTextRenderer content={tab.body} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

const IndividualProductItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showCartToast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Close the image lightbox on Escape.
  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  // Default to the first in-stock variant once the product loads.
  useEffect(() => {
    if (product?.variantsView?.length) {
      const inStock = product.variantsView.find((v) => v.quantity > 0) || product.variantsView[0];
      setSelectedVariant(inStock);
    }
  }, [product]);

  // Reset the active thumbnail when the variant changes (its gallery may differ).
  useEffect(() => { setActiveImage(0); }, [selectedVariant?._id]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview,   setEditingReview]   = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!id) throw new Error("Product ID is missing");

        const result = await productsApi.getProductById(id);
        const productData = result.data;
        if (!active) return;
        if (!productData) throw new Error("Product not found");

        if (productData.isActive === false) {
          setProduct(productData);
          setIsLoading(false);
          return;
        }
        setProduct(productData);
        setActiveImage(0);
        setQuantity(1);

        const category = productData.category || productData.categories?.[0];
        if (category) {
          productsApi
            .getProductsByCategory(category, productData._id || productData.id)
            .then(related => { if (active) setRelatedProducts(related.slice(0, 4)); })
            .catch(() => {});
        }

        productsApi
          .getProductReviews(id)
          .then(reviews => { if (active) setReviews(reviews ?? []); })
          .catch(() => { if (active) setReviews([]); });
      } catch (err) {
        if (active) setError(err.message || "Failed to load product details");
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const productId = String(product._id || product.id);
    if (!productId) return;

    const variants = Array.isArray(product.variantsView) ? product.variantsView : [];
    const variantId = variants.length ? selectedVariant?._id : null;
    const variantLabel = variants.length ? selectedVariant?.label : null;
    const lineId = variantId ? `${productId}::${variantId}` : productId;
    const unitPrice = variants.length
      ? (selectedVariant?.effectivePrice ?? selectedVariant?.price)
      : (product.effectivePrice ?? product.price);

    try {
      addItem(
        {
          id: lineId,
          productId,
          variantId,
          variantLabel,
          name: product.name?.trim() || product.title?.trim() || "Untitled Product",
          price: parseFloat(unitPrice) || 0,
          image: product.images?.[0]?.url || product.imageUrl || "",
        },
        quantity
      );
      showCartToast("add", product.name || product.title);
    } catch (err) {
      setError(`Failed to add to cart: ${err.message}`);
    }
  };

  const handleOpenReviewModal = () => {
    if (!user) { setShowLoginModal(true); return; }
    setShowReviewModal(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await productsApi.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch {
      // silently ignore — review stays in list if delete fails
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="ip-page">
        <div className="ip-skeleton-row">
          <div className="ip-skeleton ip-skeleton--image" />
          <div className="ip-skeleton-col">
            <div className="ip-skeleton ip-skeleton--line" />
            <div className="ip-skeleton ip-skeleton--line ip-skeleton--short" />
            <div className="ip-skeleton ip-skeleton--block" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="ip-page">
        <div className="ip-state">
          <FaExclamationTriangle size={40} />
          <h2>Error Loading Product</h2>
          <p>{error}</p>
          <button className="ip-btn ip-btn--primary" onClick={() => navigate("/petshop")}>
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="ip-page">
        <div className="ip-state">
          <FaExclamationTriangle size={40} />
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button className="ip-btn ip-btn--primary" onClick={() => navigate("/petshop")}>
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  if (product.isActive === false) {
    return (
      <div className="ip-page">
        <div className="ip-state">
          <FaExclamationTriangle size={40} />
          <h2>Product No Longer Available</h2>
          <p>This product has been discontinued or is no longer listed. Browse our shop for similar items.</p>
          <button className="ip-btn ip-btn--primary" onClick={() => navigate("/petshop")}>
            Browse Shop
          </button>
        </div>
      </div>
    );
  }

  const productName = product.title || product.name || "Product";
  const productImages = product.images?.length
    ? product.images.map(img => (typeof img === "object" ? img.url : img)).filter(Boolean)
    : [product.imageUrl].filter(Boolean);
  // When a variant with its own images is selected, show those; else the product gallery.
  const variantImages = Array.isArray(selectedVariant?.images)
    ? selectedVariant.images.map(img => (typeof img === "object" ? img.url : img)).filter(Boolean)
    : [];
  const images = variantImages.length ? variantImages : productImages;
  const stockQty = product.stock ?? product.quantity ?? null;
  const category = product.category || product.categories?.[0] || null;

  // Variant-aware display values (fall back to product-level for non-variant products).
  const hasVariants = Array.isArray(product.variantsView) && product.variantsView.length > 0;
  const vStock = hasVariants ? (selectedVariant?.quantity ?? 0) : stockQty;
  const displayPrice = hasVariants ? (selectedVariant?.price ?? product.price) : product.price;
  const displaySalePrice = hasVariants ? (selectedVariant?.salePrice ?? null) : product.salePrice;
  const displayOnSale = hasVariants ? !!selectedVariant?.isOnSaleNow : product.isOnSaleNow;
  const displayPctLabel = hasVariants ? (selectedVariant?.discountPercentLabel ?? 0) : product.discountPercentLabel;
  const displayEffective = displayOnSale ? displaySalePrice : displayPrice;

  return (
    <>
      <div className="ip-page">
        {/* Back + breadcrumb row */}
        <div className="ip-breadcrumb-row">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Pet Shop", path: "/petshop" },
              { label: productName, path: null },
            ]}
          />
        </div>

        {/* Main product card */}
        <motion.div
          className="ip-main-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Left — gallery */}
          <div className="ip-gallery">
            <div
              className="ip-gallery-main"
              onClick={() => setLightboxOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Expand image"
              onKeyDown={(e) => { if (e.key === "Enter") setLightboxOpen(true); }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={images[activeImage]}
                  alt={`${productName} ${activeImage + 1}`}
                  className="ip-gallery-img"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.28 }}
                />
              </AnimatePresence>
              <span className="ip-gallery-zoom-hint" aria-hidden="true">
                <FiSearch size={16} />
              </span>
            </div>

            {images.length > 1 && (
              <div className="ip-gallery-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`ip-thumb${i === activeImage ? " ip-thumb--active" : ""}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt={`${productName} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="ip-guarantees">
              <div className="ip-guarantee">
                <FaShieldAlt /> 100% Quality Guarantee
              </div>
              <div className="ip-guarantee">
                <FaCheckCircle /> Verified Product
              </div>
            </div>

            <div className="ip-share">
              <FiShare2 size={15} />
              <span>Share:</span>
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

          {/* Right — info */}
          <div className="ip-info">
            {/* Category + Stock badges */}
            <div className="ip-badges">
              {category && (
                <span className="ip-badge ip-badge--cat">
                  <FaTag size={10} /> {category}
                </span>
              )}
              {vStock !== null && (
                <span className={`ip-badge ${vStock > 0 ? "ip-badge--stock" : "ip-badge--out"}`}>
                  {vStock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              )}
            </div>

            <h1 className="ip-title">{productName}</h1>
            <div className="ip-price-row">
              <ProductPrice
                price={displayPrice}
                salePrice={displaySalePrice}
                isOnSaleNow={displayOnSale}
                className="ip-price"
              />
              {displayOnSale && <SaleBadge percent={displayPctLabel} />}
            </div>

            {hasVariants && (
              <div className="ip-variants">
                <span className="ip-variants-label">Size</span>
                <div className="ip-variants-row">
                  {product.variantsView.map((v) => (
                    <button
                      key={v._id}
                      type="button"
                      className={`ip-variant${selectedVariant?._id === v._id ? " ip-variant--active" : ""}${v.quantity <= 0 ? " ip-variant--out" : ""}`}
                      disabled={v.quantity <= 0}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Overview always visible in the product card */}
            {product.description && (
              <div className="ip-overview">
                <RichTextRenderer content={product.description} />
              </div>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="ip-specs">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="ip-spec-row">
                    <span className="ip-spec-key">{key}</span>
                    <span className="ip-spec-value">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="ip-actions">
              <div className="ip-qty">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <FaMinus size={11} />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  disabled={vStock !== null && quantity >= vStock}
                >
                  <FaPlus size={11} />
                </button>
              </div>

              <button
                type="button"
                className="ip-btn ip-btn--primary ip-btn--cart"
                onClick={handleAddToCart}
                disabled={vStock === 0}
              >
                <FaShoppingCart size={15} />
                {stockQty === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <SubscribeWidget
                product={product}
                quantity={quantity}
                variantId={hasVariants ? selectedVariant?._id : null}
              />
            </div>

            {product.supplierDetails && (
              <div className="ip-supplier">
                <h3>Supplier Details</h3>
                <p>{product.supplierDetails}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Product sections — additional info tabs */}
        {product.sections?.filter(s => s.title && s.body).length > 0 && (
          <ProductSectionTabs sections={product.sections} />
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="ip-section">
            <h2 className="ip-section-title">You may also like</h2>
            <div className="ip-related-grid">
              {relatedProducts.map((item, i) => (
                <motion.div
                  key={item._id || item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <ProductCard
                    id={item._id || item.id}
                    imageUrl={item.images?.[0]?.url || (typeof item.images?.[0] === 'string' ? item.images[0] : null) || item.imageUrl}
                    title={item.name || item.title}
                    price={item.price}
                    description={item.description}
                    salePrice={item.salePrice}
                    isOnSaleNow={item.isOnSaleNow}
                    discountPercentLabel={item.discountPercentLabel}
                    effectivePrice={item.effectivePrice}
                    variantsView={item.variantsView}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="ip-section">
          <div className="ip-section-header">
            <h2 className="ip-section-title">Product Reviews</h2>
            <button
              type="button"
              className="ip-btn ip-btn--secondary"
              onClick={handleOpenReviewModal}
            >
              Write a Review
            </button>
          </div>

          {reviews && reviews.length > 0 ? (
            <ReviewCarousel
              reviews={reviews}
              currentUserId={user?._id || user?.id}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          ) : (
            <div className="ip-empty-reviews">
              <p>No reviews yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <ProductReviewFormModal
        key={editingReview?._id ?? "new"}
        showReviewModal={showReviewModal}
        onClose={() => { setShowReviewModal(false); setEditingReview(null); }}
        productId={id}
        existingReview={editingReview}
        onReviewSubmitted={(savedReview) => {
          if (!savedReview) return;
          if (editingReview) {
            setReviews((prev) => prev.map((r) => r._id === savedReview._id ? savedReview : r));
          } else {
            setReviews((prev) => [savedReview, ...prev]);
          }
          setEditingReview(null);
          setShowReviewModal(false);
        }}
      />

      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        showPassword={showPassword}
        togglePasswordVisibility={() => setShowPassword((p) => !p)}
        onSignUpClick={() => { setShowLoginModal(false); setShowSignUpModal(true); }}
      />
      <SignUpModal
        show={showSignUpModal}
        onHide={() => setShowSignUpModal(false)}
        showPassword={showPassword}
        togglePasswordVisibility={() => setShowPassword((p) => !p)}
        onLoginClick={() => { setShowSignUpModal(false); setShowLoginModal(true); }}
      />

      {/* Image lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="ip-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Product image"
          >
            <button type="button" className="ip-lightbox-close" aria-label="Close">
              <FiX size={24} />
            </button>
            <motion.img
              key={activeImage}
              src={images[activeImage]}
              alt={`${productName} ${activeImage + 1}`}
              className="ip-lightbox-img"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <div className="ip-lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`ip-lightbox-thumb${i === activeImage ? " ip-lightbox-thumb--active" : ""}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IndividualProductItemPage;
