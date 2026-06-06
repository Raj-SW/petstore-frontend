import { useState } from "react";
import { FaStar, FaCheckCircle, FaPen, FaTrash } from "react-icons/fa";
import "./ProductReviewCard.css";

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export function ProductReviewCard({ review, currentUserId, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const name     = review.user?.name || "Anonymous";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const rating   = review.rating || 0;
  const date     = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "";

  const isOwner = currentUserId &&
    (review.user?._id?.toString() === currentUserId?.toString() ||
     review.user?.toString() === currentUserId?.toString());

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(review._id);
    setDeleting(false);
    setConfirmDelete(false);
  };

  return (
    <div className="prc-card">
      <div className="prc-header">
        <div className="prc-avatar">{initials}</div>
        <div className="prc-meta">
          <span className="prc-name">{name}</span>
          {date && <span className="prc-date">{date}</span>}
          {review.isVerified && (
            <span className="prc-verified">
              <FaCheckCircle size={11} /> Verified Purchase
            </span>
          )}
        </div>

        {isOwner && !confirmDelete && (
          <div className="prc-actions">
            <button type="button" className="prc-action-btn prc-action-btn--edit" onClick={() => onEdit(review)} aria-label="Edit review">
              <FaPen size={11} />
            </button>
            <button type="button" className="prc-action-btn prc-action-btn--delete" onClick={() => setConfirmDelete(true)} aria-label="Delete review">
              <FaTrash size={11} />
            </button>
          </div>
        )}

        {isOwner && confirmDelete && (
          <div className="prc-confirm-delete">
            <span>Delete?</span>
            <button type="button" className="prc-confirm-btn prc-confirm-btn--yes" onClick={handleDelete} disabled={deleting}>
              {deleting ? "…" : "Yes"}
            </button>
            <button type="button" className="prc-confirm-btn prc-confirm-btn--no" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              No
            </button>
          </div>
        )}
      </div>

      <div className="prc-stars">
        {[1, 2, 3, 4, 5].map(i => (
          <FaStar key={i} size={15} className={i <= rating ? "prc-star--filled" : "prc-star--empty"} />
        ))}
        <span className="prc-rating-label">{STAR_LABELS[rating]}</span>
      </div>

      <p className="prc-comment">{review.comment}</p>
    </div>
  );
}

export default ProductReviewCard;
