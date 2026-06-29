import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaStar, FaSpinner } from "react-icons/fa";
import productsApi from "@/Services/api/productsApi";
import { useAuth } from "@/context/AuthContext";
import "./ProductReviewFormModal.css";

const ProductReviewFormModal = ({ showReviewModal, onClose, productId, onReviewSubmitted, existingReview }) => {
  const { user } = useAuth();
  const isEditing = Boolean(existingReview);

  const [rating,      setRating]      = useState(existingReview?.rating ?? 5);
  const [hovered,     setHovered]     = useState(0);
  const [comment,     setComment]     = useState(existingReview?.comment ?? "");
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  const handleClose = () => {
    setRating(5); setComment(""); setError(""); setHovered(0);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      let result;
      if (isEditing) {
        result = await productsApi.updateReview(existingReview._id, { rating, comment: comment.trim() });
      } else {
        result = await productsApi.submitReview(productId, { rating, comment: comment.trim() });
      }
      onReviewSubmitted(result);
      handleClose();
    } catch (err) {
      const msg = (err?.message || "").toLowerCase();
      const status = err?.status;
      if (msg.includes("purchased") || msg.includes("bought") || status === 403) {
        setError("You can only review products you have purchased and received.");
      } else if (msg.includes("already") || msg.includes("duplicate") || status === 409) {
        setError("You have already submitted a review for this product.");
      } else {
        setError(`Failed to ${isEditing ? "update" : "submit"} review. Please try again.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  let submitBtnContent;
  if (submitting) {
    submitBtnContent = <><FaSpinner className="spin" size={13} /> {isEditing ? "Saving…" : "Submitting…"}</>;
  } else {
    submitBtnContent = isEditing ? "Save Changes" : "Submit Review";
  }

  return createPortal(
    <AnimatePresence>
      {showReviewModal && (
        <motion.div
          className="prfm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <motion.div
            className="prfm-modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="prfm-header">
              <div className="prfm-header-icon"><FaStar size={15} /></div>
              <h3 className="prfm-title">{isEditing ? "Edit Review" : "Write a Review"}</h3>
              <button type="button" className="prfm-close" onClick={handleClose} aria-label="Close">
                <FaTimes size={13} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="prfm-body">
                {/* Reviewer name (read-only) */}
                <div className="prfm-field">
                  <p className="prfm-label">Reviewing as</p>
                  <p className="prfm-user">{user?.name}</p>
                </div>

                {/* Star rating */}
                <div className="prfm-field">
                  <p className="prfm-label">Your rating *</p>
                  <div className="prfm-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`prfm-star ${star <= (hovered || rating) ? "prfm-star--filled" : ""}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                      >
                        <FaStar size={26} />
                      </button>
                    ))}
                    <span className="prfm-rating-label">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hovered || rating]}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div className="prfm-field">
                  <label className="prfm-label" htmlFor="prfm-review">Your review *</label>
                  <textarea
                    id="prfm-review"
                    className="prfm-textarea"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience with this product…"
                    rows={4}
                    required
                    maxLength={1000}
                  />
                  <span className="prfm-char-count">{comment.length}/1000</span>
                </div>

                {/* Error */}
                {error && (
                  <div className="prfm-error">{error}</div>
                )}

                {!isEditing && (
                  <p className="prfm-hint">
                    Only customers who have received this product can leave a review.
                  </p>
                )}
              </div>

              <div className="prfm-footer">
                <button type="button" className="prfm-btn prfm-btn--ghost" onClick={handleClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="prfm-btn prfm-btn--primary"
                  disabled={submitting || !comment.trim()}
                >
                  {submitBtnContent}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProductReviewFormModal;
