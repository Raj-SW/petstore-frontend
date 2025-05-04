import { useState } from "react";
import "./ProductReviewCard.css";

export function ProductReviewCard({ review, onLike }) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      onLike(review.id);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="user-info">
          <img
            src={review.userAvatar || "/placeholder.svg"}
            alt={`${review.userName}'s avatar`}
            className="user-avatar"
            style={{ width: "80px", height: "80px" }}
          />
          <div className="user-details">
            <h4 className="user-name">{review.userName}</h4>
            <span className="review-date">{formatDate(review.date)}</span>
            {review.verifiedPurchase && (
              <div className="verified-badge">
                <i className="bi bi-check-circle-fill verified-icon"></i>
                Verified Purchase
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="review-content">
        <h3 className="review-title" style={{ fontSize: "1.5rem" }}>
          {review.title}
        </h3>
        <div
          className="rating"
          style={{
            fontSize: "2rem",
            marginTop: "0.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`star ${index < review.rating ? "filled" : ""}`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="review-comment">{review.comment}</p>
      </div>

      <div className="review-actions">
        <button
          className={`like-button ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
          disabled={isLiked}
          aria-label="Like this review"
        >
          <i
            className={`bi bi-hand-thumbs-up${
              isLiked ? "-fill" : ""
            } like-icon`}
          ></i>
          <span>
            {review.likes} {review.likes === 1 ? "like" : "likes"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default ProductReviewCard;
