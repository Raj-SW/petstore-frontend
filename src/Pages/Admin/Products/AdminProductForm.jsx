import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiX, FiUpload, FiLink } from "react-icons/fi";
import { api } from "../../../core/api/apiClient";
import { useToast } from "../../../context/ToastContext";
import "./AdminProductForm.css";

const CATEGORIES = ["dogs", "cats", "fish", "birds", "general", "apparel"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  categories: ["general"],
  quantity: "",
  isActive: true,
  isFeatured: false,
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  // File upload state
  const [imageFiles, setImageFiles] = useState([]);           // new files to upload
  const [existingImages, setExistingImages] = useState([]);   // URLs from DB (edit mode)
  const [imagePreviews, setImagePreviews] = useState([]);     // blob preview URLs

  // Fetch product in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        const p = res?.data?.data ?? res?.data ?? {};

        setForm({
          name: p.name ?? p.title ?? "",
          description: p.description ?? "",
          price: p.price ?? "",
          categories: Array.isArray(p.categories) && p.categories.length > 0
            ? p.categories
            : p.category
            ? [p.category]
            : ["general"],
          quantity: p.quantity ?? p.stock ?? "",
          isActive: p.isActive ?? true,
          isFeatured: p.isFeatured ?? false,
        });

        // Extract URL strings from {url, publicId} objects
        const imgs = Array.isArray(p.images) && p.images.length > 0
          ? p.images.map((img) => (typeof img === "object" ? img.url : img)).filter(Boolean)
          : p.imageUrl
          ? [p.imageUrl]
          : [];
        setExistingImages(imgs);
      } catch (err) {
        addToast("Failed to load product data.", "error");
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Clean up blob URLs when component unmounts or previews change
  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // ── Category handling ──
  const toggleCategory = (cat) => {
    setForm((f) => {
      const cats = f.categories;
      return {
        ...f,
        categories: cats.includes(cat)
          ? cats.filter((c) => c !== cat)
          : [...cats, cat],
      };
    });
  };

  // ── File handling ──
  const MAX_FILE_SIZE_MB = 4;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(", ");
      addToast(
        `${oversized.length > 1 ? "These files are" : `"${names}" is`} too large. Maximum size is ${MAX_FILE_SIZE_MB}MB per image.`,
        "error"
      );
    }

    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);
    if (!valid.length) { e.target.value = ""; return; }

    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...valid]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  const removeNewFile = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Validation ──
  const validate = () => {
    if (!form.name.trim()) {
      addToast("Product name is required.", "error");
      return false;
    }
    if (form.name.trim().length < 2) {
      addToast("Product name must be at least 2 characters.", "error");
      return false;
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      addToast("Description must be at least 10 characters.", "error");
      return false;
    }
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) {
      addToast("Please enter a valid price.", "error");
      return false;
    }
    if (form.categories.length === 0) {
      addToast("Select at least one category.", "error");
      return false;
    }
    if (!isEditMode && imageFiles.length === 0) {
      addToast("At least one product image is required.", "error");
      return false;
    }
    if (isEditMode && existingImages.length === 0 && imageFiles.length === 0) {
      addToast("At least one product image is required.", "error");
      return false;
    }
    return true;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("price", Number(form.price));
    formData.append("quantity", form.quantity !== "" ? Number(form.quantity) : 0);
    form.categories.forEach((cat) => formData.append("categories", cat));
    formData.append("isActive", form.isActive);
    formData.append("isFeatured", form.isFeatured);

    // Attach image files
    imageFiles.forEach((file) => formData.append("images", file));

    // For edit: signal whether images changed
    if (isEditMode) {
      formData.append("imagesChanged", imageFiles.length > 0 ? "true" : "false");
    }

    try {
      setSubmitting(true);
      if (isEditMode) {
        await api.patch(`/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        addToast("Product updated successfully.", "success");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        addToast("Product created successfully.", "success");
      }
      navigate("/admin/products");
    } catch (err) {
      const msg = err?.message || (isEditMode ? "Failed to update product." : "Failed to create product.");
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-pf-loading">Loading product…</div>
      </div>
    );
  }

  const hasAnyImage = existingImages.length > 0 || imagePreviews.length > 0;

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="admin-page-header admin-pf-header">
        <div>
          <button
            className="admin-pf-back-btn"
            onClick={() => navigate("/admin/products")}
            aria-label="Back to products"
          >
            <FiArrowLeft />
            <span>Back to Products</span>
          </button>
          <h1 className="admin-page-title" style={{ marginTop: "0.5rem" }}>
            {isEditMode ? "Edit Product" : "New Product"}
          </h1>
          <p className="admin-page-subtitle">
            {isEditMode
              ? "Update the product details below."
              : "Fill in the details to add a new product to the catalogue."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
        <div className="admin-pf-grid">

          {/* ── Left column: Product details ── */}
          <div className="admin-pf-col">
            <div className="admin-card">
              <h2 className="admin-pf-section-title">Product Details</h2>

              {/* Name */}
              <div className="admin-field">
                <label className="admin-label" htmlFor="pf-name">
                  Name <span className="admin-required">*</span>
                </label>
                <input
                  id="pf-name"
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Premium Dog Harness"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="admin-field">
                <label className="admin-label" htmlFor="pf-description">
                  Description <span className="admin-required">*</span>
                </label>
                <textarea
                  id="pf-description"
                  className="admin-textarea"
                  rows={5}
                  placeholder="Describe the product in detail… (min 10 characters)"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  required
                />
              </div>

              {/* Price + Quantity row */}
              <div className="admin-pf-row">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="pf-price">
                    Price ($) <span className="admin-required">*</span>
                  </label>
                  <input
                    id="pf-price"
                    className="admin-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    required
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="pf-quantity">
                    Stock Quantity <span className="admin-required">*</span>
                  </label>
                  <input
                    id="pf-quantity"
                    className="admin-input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="admin-field">
                <span className="admin-label">
                  Categories <span className="admin-required">*</span>
                </span>
                <div className="admin-pf-cats">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`admin-pf-cat-chip${
                        form.categories.includes(cat) ? " selected" : ""
                      }`}
                      onClick={() => toggleCategory(cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
                {form.categories.length === 0 && (
                  <p className="admin-pf-cats-hint">Select at least one category</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Right column: Images + Visibility ── */}
          <div className="admin-pf-col">

            {/* Images */}
            <div className="admin-card">
              <h2 className="admin-pf-section-title">Images</h2>

              {/* Existing images (edit mode) */}
              {existingImages.length > 0 && (
                <div className="admin-pf-img-grid">
                  {existingImages.map((url, i) => (
                    <div key={i} className="admin-pf-img-thumb">
                      <img src={url} alt={`Image ${i + 1}`} />
                      <button
                        type="button"
                        className="admin-pf-img-remove"
                        onClick={() => removeExistingImage(i)}
                        aria-label="Remove image"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New file previews */}
              {imagePreviews.length > 0 && (
                <div className="admin-pf-img-grid" style={{ marginTop: existingImages.length > 0 ? "0.75rem" : 0 }}>
                  {imagePreviews.map((url, i) => (
                    <div key={i} className="admin-pf-img-thumb admin-pf-img-thumb--new">
                      <img src={url} alt={`New ${i + 1}`} />
                      <button
                        type="button"
                        className="admin-pf-img-remove"
                        onClick={() => removeNewFile(i)}
                        aria-label="Remove image"
                      >
                        <FiX size={12} />
                      </button>
                      <span className="admin-pf-img-new-badge">New</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Drop zone / upload button */}
              <div
                className="admin-pf-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dt = e.dataTransfer;
                  if (dt.files.length) {
                    const synth = { target: { files: dt.files, value: "" } };
                    handleFileChange(synth);
                  }
                }}
                style={{ marginTop: hasAnyImage ? "0.85rem" : 0 }}
              >
                <FiUpload size={22} className="admin-pf-dropzone-icon" />
                <p className="admin-pf-dropzone-text">
                  <strong>Click to upload</strong> or drag &amp; drop
                </p>
                <p className="admin-pf-dropzone-hint">PNG, JPG, WEBP · max 4 MB per image · up to 10 files</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            {/* Visibility toggles + submit */}
            <div className="admin-card">
              <h2 className="admin-pf-section-title">Visibility</h2>

              <div className="admin-pf-toggle-row">
                <div>
                  <p className="admin-notification-label">Active</p>
                  <p className="admin-notification-desc">Show this product in the store.</p>
                </div>
                <label className="admin-toggle" aria-label="Active toggle">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                  />
                </label>
              </div>

              <div className="admin-pf-toggle-row">
                <div>
                  <p className="admin-notification-label">Featured</p>
                  <p className="admin-notification-desc">Highlight this product on the homepage.</p>
                </div>
                <label className="admin-toggle" aria-label="Featured toggle">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={form.isFeatured}
                    onChange={(e) => setField("isFeatured", e.target.checked)}
                  />
                </label>
              </div>

              {/* Submit */}
              <div className="admin-pf-submit-row">
                <button
                  type="button"
                  className="admin-outline-btn"
                  onClick={() => navigate("/admin/products")}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-save-btn admin-pf-submit-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? isEditMode ? "Saving…" : "Creating…"
                    : isEditMode ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminProductForm;
