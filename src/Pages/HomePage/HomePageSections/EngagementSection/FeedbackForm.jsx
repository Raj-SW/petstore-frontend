import { useState } from "react";
import feedbackApi from "../../../../Services/api/feedbackApi";
import { useToast } from "../../../../context/ToastContext";
import "./FeedbackForm.css";

const MAX_PHOTOS = 3;

const EMPTY_FORM = { name: "", role: "", message: "" };

const FeedbackForm = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [photos, setPhotos] = useState([]); // [{ file, preview }]
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const MAX_PHOTO_BYTES = 15 * 1024 * 1024; // 15 MB — matches server limit

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const oversized = files.filter((f) => f.size > MAX_PHOTO_BYTES);
    if (oversized.length > 0) {
      addToast(
        `"${oversized[0].name}" is too large. Please use images under 15 MB.`,
        "error"
      );
      return;
    }

    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...toAdd]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      addToast("Please select a star rating.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("role", form.role);
      fd.append("rating", String(rating));
      fd.append("message", form.message);
      photos.forEach(({ file }) => fd.append("photos", file));

      // Don't pass Content-Type — let the browser set the multipart boundary
      await feedbackApi.submitFeedback(fd);

      addToast("Thanks! Your feedback will appear once approved.", "success");

      // Reset
      setForm(EMPTY_FORM);
      setRating(0);
      setHovered(0);
      photos.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setPhotos([]);
    } catch (err) {
      addToast(err?.message || "Failed to submit feedback. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hovered || rating;

  return (
    <form className="ff-form" onSubmit={handleSubmit} data-testid="feedback-form">
      {/* Name */}
      <div className="ff-field">
        <label className="ff-label" htmlFor="ff-name">Your Name</label>
        <input
          id="ff-name"
          className="ff-input"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Smith"
          required
          minLength={2}
          maxLength={80}
        />
      </div>

      {/* Role (optional) */}
      <div className="ff-field">
        <label className="ff-label" htmlFor="ff-role">
          Your Role <span className="ff-optional">(optional)</span>
        </label>
        <input
          id="ff-role"
          className="ff-input"
          type="text"
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="e.g. Dog parent, Cat lover"
          maxLength={80}
        />
      </div>

      {/* Star rating */}
      <div className="ff-field">
        <p className="ff-label">Rating</p>
        <div
          className="ff-stars"
          role="group"
          aria-label="Star rating"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`ff-star${displayRating >= star ? " ff-star-filled" : ""}`}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="ff-field">
        <label className="ff-label" htmlFor="ff-message">Your Feedback</label>
        <textarea
          id="ff-message"
          className="ff-input ff-textarea"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your experience…"
          required
          minLength={5}
          maxLength={1000}
        />
      </div>

      {/* Photo upload */}
      <div className="ff-field">
        <label className="ff-label">
          Photos <span className="ff-optional">(up to {MAX_PHOTOS})</span>
        </label>

        {/* Thumbnail previews */}
        {photos.length > 0 && (
          <div className="ff-previews">
            {photos.map(({ preview }, i) => (
              <div key={preview} className="ff-preview-wrap">
                <img src={preview} alt={`Preview ${i + 1}`} className="ff-preview-img" loading="lazy" />
                <button
                  type="button"
                  className="ff-remove-photo"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => removePhoto(i)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File picker — hidden when cap reached */}
        {photos.length < MAX_PHOTOS && (
          <label className="ff-upload-btn">
            {"+ Add Photo"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="ff-file-input"
              onChange={handlePhotoChange}
              data-testid="photo-input"
            />
          </label>
        )}
        {photos.length >= MAX_PHOTOS && (
          <p className="ff-photo-cap-msg">Maximum {MAX_PHOTOS} photos reached.</p>
        )}
      </div>

      <button className="ff-submit" type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <span className="ff-spinner" />{" "}
            Submitting&hellip;
          </>
        ) : (
          "Submit Feedback"
        )}
      </button>
    </form>
  );
};

export default FeedbackForm;
