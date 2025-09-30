import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Button } from 'react-bootstrap'
import ReviewService from '../../../Services/localServices/ReviewService'
import './ProductReviewFormModal.css'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

const ProductReviewFormModal = ({ 
  showReviewModal, 
  onClose, 
  productId, 
  onReviewSubmitted
}) => {
  const { showReviewToast } = useToast();
  const { user } = useAuth(); 
  const [reviewForm, setReviewForm] = useState({
    name: user?.name,
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const newReview = await ReviewService.addReview({
        productId: productId,
        ...reviewForm,
      });
      onReviewSubmitted(newReview);
      showReviewToast("submit", "success");
    } catch (error) {
      showReviewToast("submit", "error", error.message);
    } finally {
      setReviewForm({ name: user.name, rating: 5, comment: "" });
      setSubmittingReview(false);
      onClose();
    }
  };

  return (
      <Modal show={showReviewModal} onHide={onClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitReview}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
              className='productreviewform-name-input'
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
              className='productreviewform-comment-input'
                as="textarea"
                rows={3}
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewFormChange}
                required
              />
            </Form.Group>
            <Button type="submit" className=" productreviewform-submit-btn " disabled={submittingReview}>
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
  )
}

ProductReviewFormModal.propTypes = {
  showReviewModal: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  productId: PropTypes.string.isRequired,
  onReviewSubmitted: PropTypes.func.isRequired,
}

export default ProductReviewFormModal