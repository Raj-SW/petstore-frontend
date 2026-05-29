import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import { motion } from "framer-motion";
import {
  FaFacebook, FaTwitter, FaInstagram, FaPlus, FaMinus,
  FaShoppingCart, FaShieldAlt, FaCheckCircle, FaExclamationTriangle,
} from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";

import "./IndividaulItemPage.css";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import ReviewService from "../../Services/localServices/ReviewService";
import LoginModal from "@/Components/NavigationBar/Dropdowns/LoginModal";
import SignUpModal from "@/Components/NavigationBar/Dropdowns/SignUpModal";
import ProductCard from "@/Components/HelperComponents/ProductCard/ProductCardV2";
import ReviewCarousel from "@/Components/HelperComponents/Carousel/ReviewCarousel";
import ProductReviewFormModal from "@/Components/HelperComponents/ProductReviewFormModal/ProductReviewFormModal";
import ProductService from "@/Services/localServices/ProductService";
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
        const productId = isNaN(id) ? id : parseInt(id);

        const productData = await ProductService.fetchProductById(productId);
        if (!active) return;
        if (!productData) throw new Error("Product not found");

        setProduct(productData);
        setActiveImage(0);
        setQuantity(1);

        if (productData.category) {
          const related = await ProductService.fetchRelatedProducts(
            productData.category,
            productData.id
          );
          if (active) setRelatedProducts(related);
        }

        // Reviews are non-critical — a 500 here must not kill the product page
        ReviewService.fetchProductReviews(productId)
          .then((productReviews) => { if (active) setReviews(productReviews ?? []); })
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
          id: String(productId),
          title: product.title?.trim() || "Untitled Product",
          price: parseFloat(product.price) || 0,
          image: product.images?.[0] || product.imageUrl || "",
        },
        quantity
      );
      showCartToast("add", product.title);
    } catch (err) {
      setError(`Failed to add to cart: ${err.message}`);
    }
  };

  const handleOpenReviewModal = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowReviewModal(true);
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

  const images = product.images?.length ? product.images : [product.imageUrl].filter(Boolean);

  return (
    <>
      <div className="ip-page">
        {/* Breadcrumb */}
        <div className="ip-breadcrumb-row">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Pet Shop", path: "/petshop" },
              { label: product.title, path: null },
            ]}
          />
        </div>

        {/* Main product card */}
        <motion.div
          className="ip-main-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Left — gallery */}
          <div className="ip-gallery">
            <div className="ip-gallery-main">
              <img
                src={images[activeImage]}
                alt={product.title}
                className="ip-gallery-img"
              />
            </div>

            {images.length > 1 && (
              <div className="ip-gallery-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`ip-thumb${i === activeImage ? " ip-thumb--active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`${product.title} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="ip-guarantees">
              <div className="ip-guarantee">
                <FaShieldAlt /> 100% Health Guarantee
              </div>
              <div className="ip-guarantee">
                <FaCheckCircle /> Verified Identification
              </div>
            </div>

            <div className="ip-share">
              <FiShare2 size={16} />
              <span>Share:</span>
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>

          {/* Right — info */}
          <div className="ip-info">
            <h1 className="ip-title">{product.title}</h1>
            <p className="ip-price">${product.price}</p>

            <div className="ip-specs">
              {product.specifications &&
                Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="ip-spec-row">
                    <span className="ip-spec-key">{key}</span>
                    <span className="ip-spec-value">{value}</span>
                  </div>
                ))}
              {product.description && (
                <div className="ip-spec-row">
                  <span className="ip-spec-key">Description</span>
                  <span className="ip-spec-value">{product.description}</span>
                </div>
              )}
            </div>

            <div className="ip-actions">
              <div className="ip-qty">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <FaMinus size={12} />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <FaPlus size={12} />
                </button>
              </div>

              <button
                type="button"
                className="ip-btn ip-btn--primary ip-btn--cart"
                onClick={handleAddToCart}
              >
                <FaShoppingCart size={15} />
                Add to Cart
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
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item._id || item.id}
                  id={item._id || item.id}
                  imageUrl={item.images?.[0] || item.imageUrl}
                  title={item.title}
                  price={item.price}
                  description={item.description}
                />
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
            <ReviewCarousel reviews={reviews} />
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
        onClose={() => setShowReviewModal(false)}
        productId={id}
        onReviewSubmitted={(newReview) => {
          setReviews((prev) => [newReview, ...prev]);
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
