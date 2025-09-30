import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import {
  Container,
  Row,
  Col,
  Button,
  Image,
  Alert
} from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { LuArrowLeft } from "react-icons/lu";
import { IconContext } from "react-icons";

import "./IndividaulItemPage.css";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import SearchBar from "@/Components/HelperComponents/SearchBar/SearchBar";
import ReviewService from "../../Services/localServices/ReviewService";
import LoginModal from "@/Components/NavigationBar/Dropdowns/LoginModal";
//Asset Import
import ProductCard from "@/Components/HelperComponents/ProductCard/ProductCard";
import ReviewCarousel from "@/Components/HelperComponents/Carousel/ReviewCarousel";
import ProductReviewFormModal from "@/Components/HelperComponents/ProductReviewFormModal/ProductReviewFormModal";
import SignUpModal from "@/Components/NavigationBar/Dropdowns/SignUpModal";
//service import
import ProductService from "@/Services/localServices/ProductService";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

const IndividualProductItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const { addItem } = useCart();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { showCartToast } = useToast();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const { user } = useAuth();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate and parse the product ID
        if (!id) {
          throw new Error("Product ID is missing");
        }
        const productId = isNaN(id) ? id : parseInt(id);

        // Fetch product data
        const productData = await ProductService.fetchProductById(productId);

        if (!productData) {
          throw new Error("Product not found");
        }

        setProduct(productData);
        if (productData.category) {
          const related = await ProductService.fetchRelatedProducts(
            productData.category,
            productData.id
          );
          setRelatedProducts(related);
        }

        // Fetch reviews
        const productReviews = await ReviewService.fetchProductReviews(
          productId
        );
        setReviews(productReviews);
      } catch (err) {
        setError(err.message || "Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    // Ensure we have a valid ID
    const productId = product._id || product.id;
    if (!productId) {
      return;
    }

    try {
      const itemToAdd = {
        id: productId.toString(), // Ensure ID is a string
        title: product.title?.trim() || "Untitled Product",
        price: parseFloat(product.price) || 0,
        image: product.images?.[0] || product.imageUrl || "",
      };

      // Add item with quantity as a separate parameter
      addItem(itemToAdd, quantity);
      //show toast
      showCartToast("add", product.title);
    } catch (error) {
      setError(
        `Failed to add item to cart. Please try again. \n${error.message}`
      );
    }
  };

  const handleShowReviewModal = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
  };

  if (isLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Product</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate("/petshop")}>
            Return to Shop
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Product Not Found</Alert.Heading>
          <p>
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button variant="primary" onClick={() => navigate("/petshop")}>
            Return to Shop
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container className="d-flex flex-column w-100 ">
        <div className="searchbarcontainer">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Pet Shop", path: "/petshop" },
              { label: product.title, path: null },
            ]}
          />
          <SearchBar />
        </div>
        <Container
          fluid
          className="p-4 Product-Item-Container border mt-2 rounded-4"
        >
          <Row className="g-4">
            <Col lg={6} className="d-flex flex-column align-items-center">
              <Image
                src={product.images?.[0] || product.imageUrl}
                alt={product.title}
                className="img-fluid rounded mb-3 w-100"
              />
              <div className="d-flex justify-content-center img-Thumbnail-Container">
                {product.images?.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    className="mx-1 flex-grow-1"
                  />
                ))}
              </div>

              <div className="d-flex justify-content-center mt-3 guarantee-badge p-2 w-100 rounded-3 poppins-regular flex-wrap">
                <div className="p-1">
                  <p>100% Health guarantee</p>
                </div>
                <div className="p-1">
                  <p>100% Guarantee of pet identification</p>
                </div>
              </div>

              <div className="d-flex w-100 justify-content-start p-3 poppins-semibold align-items-center">
                <IconContext.Provider
                  value={{ size: "1.3rem", color: "#002A48" }}
                >
                  <FiShare2 className="mx-2" />
                  <span className="me-2 secondary-color-font">Share:</span>
                  <FaFacebook className="mx-2" />
                  <FaTwitter className="mx-2" />
                  <FaInstagram className="mx-2" />
                </IconContext.Provider>
              </div>
            </Col>

            <Col lg={6}>
              <h2 className="mb-3 poppins-bold primary-color-font">
                {product.title}
              </h2>
              <h4 className="mb-4 poppins-semibold primary-color-font">
                $ {product.price}
              </h4>

              <div className="mb-4 d-flex flex-column item-details-container poppins-medium">
                {product.specifications &&
                  Object.entries(product.specifications).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {value}
                    </p>
                  ))}
                <p>
                  <strong>Additional Information:</strong> {product.description}
                </p>
              </div>

              <div className="d-flex align-items-center mb-4 w-100 justify-content-start poppins-regular gap-3">
                <span className="me-3">
                  <strong>Quantity</strong>
                </span>
                <div className="d-flex align-items-center">
                  <IconContext.Provider
                    value={{ size: "2rem", color: "black" }}
                  >
                    <LuArrowLeft
                      onClick={handleDecrement}
                      style={{ cursor: "pointer" }}
                    />
                    <span className="mx-3">{quantity}</span>
                    <LuArrowLeft
                      style={{ transform: "rotate(180deg)", cursor: "pointer" }}
                      onClick={handleIncrement}
                    />
                  </IconContext.Provider>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="rounded-5 add-to-cart-btn"
                >
                  Add to Cart
                </Button>
              </div>
            </Col>
          </Row>

          {product.supplierDetails && (
            <Row className="mt-5 Supplier-Product-Detail-Container rounded-4 border p-2">
              <Col>
                <h4 className="secondary-color-font">
                  Supplier Product Details
                </h4>
                <p>{product.supplierDetails}</p>
              </Col>
            </Row>
          )}
        </Container>

        {relatedProducts.length > 0 && (
          <Row className="related-purchases-container border rounded-4 mt-5 mb-5">
            <h2 className="primary-color-font p-4">Related Products</h2>
            <Row className="d-flex flex-wrap justify-content-center mt-3 related-purchases-product mb-5 gap-3">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item._id}
                  id={item.id}
                  imageUrl={item.images?.[0] || item.imageUrl}
                  title={item.title}
                  price={item.price}
                  rating={item.rating}
                />
              ))}
            </Row>
          </Row>
        )}

        <Container className="productReviewsContainer d-flex flex-column text-center mt-5 mb-5">
          <h3 className="primary-color-font">Product Reviews</h3>
          <Row className="productReviewCardsContainer d-flex flex-wrap justify-content-center">
            {reviews && reviews.length > 0 ? (
              <ReviewCarousel reviews={reviews} />
            ) : (
              <p className="mt-3 primary-color-font fs-5 m-3">
                No product reviews yet. Be the first to add one!
              </p>
            )}
          </Row>
          <div className="text-center">
            <Button
              type="button"
              className="pl-2 pr-2 rounded-5 review-btn"
              onClick={() => handleShowReviewModal()}
            >
              Write a Review
            </Button>
          </div>
        </Container>
      </Container>

      {/* Review Modal */}
      <ProductReviewFormModal
        showReviewModal={showReviewModal}
        onClose={() => handleCloseReviewModal()}
        productId={id}
      />

      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        onSignUpClick={() =>{
          setShowLoginModal(false);
          setShowSignUpModal(true);
        }}
      />
      <SignUpModal
        show={showSignUpModal}
        onHide={() => setShowSignUpModal(false)}
        onLoginClick={() => {
          setShowSignUpModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
};

export default IndividualProductItemPage;
