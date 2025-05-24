import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "react-use-cart";
import {
  Container,
  Row,
  Col,
  Button,
  Image,
  Modal,
  Form,
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
import productImg1 from "@/assets/FeaturedProductsAssets/Product.svg";
import ProductCard from "@/Components/HelperComponents/ProductCard/ProductCard";
import ReviewCarousel from "@/Components/HelperComponents/Carousel/ReviewCarousel";
//service import
import ProductService from "@/Services/localServices/ProductService";

const IndividualProductItemPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState();
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    ProductService.fetchProductById(parseInt(id))
      .then((product) => {
        setProduct(product);
        setIsLoading(false);

        ProductService.fetchRelatedProducts(product.category, product.id).then(
          setRelatedProducts
        );
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setError("Product not found.");
        setIsLoading(false);
      });
    ReviewService.fetchProductReviews(parseInt(id))
      .then((reviews) => {
        setReviews(reviews);
      })
      .catch((err) => {
        console.error("Error fetching reviews:", err);
      });
  }, [id]);

  if (isLoading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found.</p>;

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      image: product.imageUrl,
      quantity: quantity,
    });
  };

  // Review modal handlers
  const handleOpenReviewModal = () => setShowReviewModal(true);
  const handleCloseReviewModal = () => setShowReviewModal(false);
  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmitReview = (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setTimeout(() => {
      setReviews((prev) => [
        ...prev,
        {
          name: reviewForm.name,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          date: new Date().toISOString(),
        },
      ]);
      setReviewForm({ name: "", rating: 5, comment: "" });
      setSubmittingReview(false);
      setShowReviewModal(false);
    }, 800);
  };

  return (
    <>
      <Container className="d-flex flex-column">
        <div className="searchbarcontainer">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Pet Shop", path: "/PetShop" },
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
                src={product.imageUrl}
                alt="Product"
                className="img-fluid rounded mb-3 w-100"
              />
              <div className="d-flex justify-content-center img-Thumbnail-Container ">
                {/* Thumbnail Images */}
                <Image src={product.imageUrl} className="mx-1 flex-grow-1  " />
                <Image src={product.imageUrl} className="mx-1 flex-grow-1  " />
                <Image src={product.imageUrl} className="mx-1 flex-grow-1  " />
                <Image src={product.imageUrl} className="mx-1 flex-grow-1  " />
              </div>

              {/* Guarantee Badges */}
              <div className="d-flex justify-content-center mt-3 guarantee-badge p-2 w-100 rounded-3 poppins-regular flex-wrap">
                <div className="p-1">
                  <p>100% Health guarantee</p>
                </div>
                <div className="p-1">
                  <p>100% Guarnatee of pet identification</p>
                </div>
              </div>
              {/* Share Icons */}
              <div className="d-flex w-100 justify-content-start p-3 poppins-semibold align-items-center ">
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

            {/* Right Column - Product Information */}
            <Col lg={6}>
              <h2 className="mb-3 poppins-bold secondary-color-font">
                {product.title}
              </h2>
              <h4 className="mb-4 poppins-semibold secondary-color-font">
                $ {product.price}
              </h4>
              {/* Product Details */}
              <div className="mb-4 d-flex flex-column item-details-container poppins-medium ">
                <p>
                  <strong>Detail 1:</strong> #000078
                </p>
                <p>
                  <strong>Gender:</strong> Female
                </p>
                <p>
                  <strong>Age:</strong> 2 Months
                </p>
                <p>
                  <strong>Size:</strong> Small
                </p>
                <p>
                  <strong>Color:</strong> Apricot & Tan
                </p>
                <p>
                  <strong>Vaccinated:</strong> Yes
                </p>
                <p>
                  <strong>Dewormed:</strong> Yes
                </p>
                <p>
                  <strong>Cert:</strong> Yes (MKA)
                </p>
                <p>
                  <strong>Microchip:</strong> Yes
                </p>
                <p>
                  <strong>Location:</strong> Vietnam
                </p>
                <p>
                  <strong>Published Date:</strong> 12-Oct-2022
                </p>
                <p>
                  <strong>Additional Information:</strong> {product.description}
                </p>
              </div>

              {/* Quantity and Add to Cart */}
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

          {/* Supplier Product Details */}
          <Row className="mt-5 Supplier-Product-Detail-Container rounded-4 border p-2">
            <Col>
              <h4 className="secondary-color-font">Supplier Product Details</h4>
              <p>
                We have had Magie since she was able to leave her mum as a puppy
                at 8 weeks old. Magie currently lives with two children aged 7
                and 13 and has many visitors to the house, which she is great
                with. There's lots of cats and birds in the garden, and she's
                not fussed by them.
              </p>
            </Col>
          </Row>
        </Container>
        <Container className="related-purchases-container border rounded-4 mt-5 mb-5">
          <h2 className="secondary-color-font p-4">Related Purchases</h2>
          <Row className="d-flex flex-wrap justify-content-center  mt-3 related-purchases-product mb-5 gap-2">
            {relatedProducts.length === 0 && <p>No related products found.</p>}
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                imageUrl={item.imageUrl}
                title={item.title}
                price={item.price}
                rating={item.rating}
              />
            ))}
          </Row>
        </Container>
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
      <Modal show={showReviewModal} onHide={handleCloseReviewModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitReview}>
          <Modal.Body>
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  justifyContent: "flex-end",
                }}
              >
                {[5, 4, 3, 2, 1].map((star) => (
                  <React.Fragment key={star}>
                    <input
                      type="radio"
                      id={`star${star}`}
                      name="rating"
                      value={star}
                      checked={Number(reviewForm.rating) === star}
                      onChange={handleReviewFormChange}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor={`star${star}`}
                      style={{
                        cursor: "pointer",
                        fontSize: "2rem",
                        color:
                          Number(reviewForm.rating) >= star
                            ? "#FFA500"
                            : "#E0E0E0",
                        marginLeft: 2,
                        marginRight: 2,
                      }}
                    >
                      ★
                    </label>
                  </React.Fragment>
                ))}
              </div>
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
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="rounded-5 cancel-review-btn"
              onClick={handleCloseReviewModal}
            >
              Cancel
            </Button>
            <Button
              className="rounded-5 submit-review-btn"
              disabled={submittingReview}
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default IndividualProductItemPage;
