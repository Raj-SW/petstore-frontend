import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import {
  Container,
  Row,
  Col,
  Button,
  Image,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { LuArrowLeft } from "react-icons/lu";
import { IconContext } from "react-icons";

import "./IndividaulItemPage.css";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import SearchBar from "@/Components/HelperComponents/SearchBar/SearchBar";
import ReviewService from "../../Services/localServices/ReviewService";
//Asset Import
import ProductCard from "@/Components/HelperComponents/ProductCard/ProductCard";
import ReviewCarousel from "@/Components/HelperComponents/Carousel/ReviewCarousel";
//service import
import ProductService from "@/Services/localServices/ProductService";

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

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
        // Try to parse the ID if it's a string number
        const productId = isNaN(id) ? id : parseInt(id);

        // Fetch product data
        const productData = await ProductService.fetchProductById(productId);

        if (!productData) {
          throw new Error("Product not found");
        }

        setProduct(productData);
        // Fetch related products if category exists
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
    } catch (error) {
      setError(
        `Failed to add item to cart. Please try again. \n${error.message}`
      );
    }
  };

  // Review modal handlers
  const handleOpenReviewModal = () => setShowReviewModal(true);
  const handleCloseReviewModal = () => setShowReviewModal(false);
  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const newReview = await ReviewService.submitReview({
        productId: id,
        ...reviewForm,
      });
      setReviews((prev) => [...prev, newReview]);
      setReviewForm({ name: "", rating: 5, comment: "" });
      setShowReviewModal(false);
    } catch (error) {
      setError(`Failed to submit review. Please try again. \n${error.message}`);
    } finally {
      setSubmittingReview(false);
    }
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
              <h2 className="mb-3 poppins-bold secondary-color-font">
                {product.title}
              </h2>
              <h4 className="mb-4 poppins-semibold secondary-color-font">
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
            <h2 className="secondary-color-font p-4">Related Products</h2>
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
          <h3 className="secondary-color-font">Product Reviews</h3>
          <Row className="productReviewCardsContainer d-flex flex-wrap justify-content-center">
            {reviews && reviews.length > 0 ? (
              <ReviewCarousel reviews={reviews} />
            ) : (
              <p className="text-muted mt-3">
                No product reviews yet. Be the first to add one!
              </p>
            )}
          </Row>
          <div className="text-center">
            <Button
              type="button"
              className="pl-2 pr-2 rounded-5 review-btn"
              onClick={handleOpenReviewModal}
            >
              Write a Review
            </Button>
          </div>
        </Container>
      </Container>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={handleCloseReviewModal}>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitReview}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={reviewForm.name}
                onChange={handleReviewFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewFormChange}
                required
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Stars
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewFormChange}
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={submittingReview}>
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default IndividualProductItemPage;
