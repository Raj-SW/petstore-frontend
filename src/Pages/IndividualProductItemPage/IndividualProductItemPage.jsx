import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFacebook, FaTwitter, FaInstagram, FaPlus, FaMinus,
  FaShoppingCart, FaShieldAlt, FaCheckCircle, FaExclamationTriangle,
  FaTag,
} from "react-icons/fa";
import { FiShare2, FiChevronLeft } from "react-icons/fi";

import "./IndividaulItemPage.css";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import LoginModal from "@/Components/NavigationBar/Dropdowns/LoginModal";
import SignUpModal from "@/Components/NavigationBar/Dropdowns/SignUpModal";
import ProductCard from "@/Components/HelperComponents/ProductCard/ProductCardV2";
import ReviewCarousel from "@/Components/HelperComponents/Carousel/ReviewCarousel";
import ProductReviewFormModal from "@/Components/HelperComponents/ProductReviewFormModal/ProductReviewFormModal";
import productsApi from "@/Services/api/productsApi";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

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
    const productId = product._id || product.id;
    if (!productId) return;

    try {
      addItem(
        {
          id: String(product._id || product.id),
          name: product.name?.trim() || product.title?.trim() || "Untitled Product",
          price: parseFloat(product.price) || 0,
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
  const images = product.images?.length
    ? product.images.map(img => (typeof img === "object" ? img.url : img)).filter(Boolean)
    : [product.imageUrl].filter(Boolean);
  const stockQty = product.stock ?? product.quantity ?? null;
  const category = product.category || product.categories?.[0] || null;

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
            <div className="ip-gallery-main">
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
              {stockQty !== null && (
                <span className={`ip-badge ${stockQty > 0 ? "ip-badge--stock" : "ip-badge--out"}`}>
                  {stockQty > 0 ? `${stockQty} in stock` : "Out of Stock"}
                </span>
              )}
            </div>

            <h1 className="ip-title">{productName}</h1>
            <p className="ip-price">${parseFloat(product.price).toFixed(2)}</p>

            {product.description && (
              <p className="ip-description">{product.description}</p>
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
                  disabled={stockQty !== null && quantity >= stockQty}
                >
                  <FaPlus size={11} />
                </button>
              </div>

              <button
                type="button"
                className="ip-btn ip-btn--primary ip-btn--cart"
                onClick={handleAddToCart}
                disabled={stockQty === 0}
              >
                <FaShoppingCart size={15} />
                {stockQty === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            {product.supplierDetails && (
              <div className="ip-supplier">
                <h3>Supplier Details</h3>
                <p>{product.supplierDetails}</p>
              </div>
            )}
          </div>
        </motion.div>

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
                    imageUrl={item.images?.[0]?.url || item.imageUrl}
                    title={item.name || item.title}
                    price={item.price}
                    description={item.description}
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
    </>
  );
};

export default IndividualProductItemPage;
