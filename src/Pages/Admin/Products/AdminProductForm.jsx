import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiPlus, FiX } from "react-icons/fi";
import { api } from "../../../core/api/apiClient";
import { useToast } from "../../../context/ToastContext";
import "./AdminProductForm.css";

const CATEGORIES = ["dogs", "cats", "fish", "birds", "general", "apparel"];

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  category: "general",
  stock: "",
  imageUrls: [""],
  isActive: true,
  isFeatured: false,
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const isEditMode = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  // Fetch product in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        const p = res?.data?.data ?? res?.data ?? {};

        setForm({
          title: p.title ?? p.name ?? "",
          description: p.description ?? "",
          price: p.price ?? "",
          category: p.category ?? "general",
          stock: p.stock ?? p.quantity ?? "",
          imageUrls:
            Array.isArray(p.imageUrls) && p.imageUrls.length > 0
              ? p.imageUrls
              : Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : [p.imageUrl ?? ""],
          isActive: p.isActive ?? true,
          isFeatured: p.isFeatured ?? false,
        });
      } catch (err) {
        addToast("Failed to load product data.", "error");
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Field helpers
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleImageChange = (index, value) => {
    const updated = [...form.imageUrls];
    updated[index] = value;
    setField("imageUrls", updated);
  };

  const addImageUrl = () => {
    setField("imageUrls", [...form.imageUrls, ""]);
  };

  const removeImageUrl = (index) => {
    if (form.imageUrls.length === 1) {
      setField("imageUrls", [""]);
      return;
    }
    setField(
      "imageUrls",
      form.imageUrls.filter((_, i) => i !== index)
    );
  };

  // Validation
  const validate = () => {
    if (!form.title.trim()) {
      addToast("Product title is required.", "error");
      return false;
    }
    if (!form.description.trim()) {
      addToast("Product description is required.", "error");
      return false;
    }
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) {
      addToast("Please enter a valid price.", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      name: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      stock: form.stock !== "" ? Number(form.stock) : 0,
      imageUrls: form.imageUrls.filter((u) => u.trim() !== ""),
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await api.put(`/products/${id}`, payload);
        addToast("Product updated successfully.", "success");
      } else {
        await api.post("/products", payload);
        addToast("Product created successfully.", "success");
      }
      navigate("/admin/products");
    } catch (err) {
      addToast(
        err?.message || (isEditMode ? "Failed to update product." : "Failed to create product."),
        "error"
      );
      console.error("Product submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const firstValidImage = form.imageUrls.find(
    (u) => u.trim() !== "" && (u.startsWith("http") || u.startsWith("/"))
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-pf-loading">Loading product…</div>
      </div>
    );
  }

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

      <form onSubmit={handleSubmit} noValidate>
        <div className="admin-pf-grid">
          {/* ── Left column ── */}
          <div className="admin-pf-col">
            <div className="admin-card">
              <h2 className="admin-pf-section-title">Product Details</h2>

              <div className="admin-field">
                <label className="admin-label" htmlFor="pf-title">
                  Title <span className="admin-required">*</span>
                </label>
                <input
                  id="pf-title"
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Premium Dog Harness"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label className="admin-label" htmlFor="pf-description">
                  Description <span className="admin-required">*</span>
                </label>
                <textarea
                  id="pf-description"
                  className="admin-textarea"
                  rows={5}
                  placeholder="Describe the product in detail…"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  required
                />
              </div>

              <div className="admin-pf-row">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="pf-category">
                    Category
                  </label>
                  <select
                    id="pf-category"
                    className="admin-select"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

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
                  <label className="admin-label" htmlFor="pf-stock">
                    Stock Quantity
                  </label>
                  <input
                    id="pf-stock"
                    className="admin-input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="admin-pf-col">
            {/* Image URLs */}
            <div className="admin-card">
              <h2 className="admin-pf-section-title">Images</h2>

              {/* Preview */}
              {firstValidImage && (
                <div className="admin-pf-img-preview">
                  <img
                    src={firstValidImage}
                    alt="Product preview"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <span className="admin-pf-img-preview-label">Preview</span>
                </div>
              )}

              <div className="admin-field" style={{ marginTop: firstValidImage ? "1rem" : 0 }}>
                <span className="admin-label">Image URLs</span>
                <div className="image-url-list">
                  {form.imageUrls.map((url, idx) => (
                    <div key={idx} className="image-url-row">
                      <input
                        className="admin-input image-url-input"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={url}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        aria-label={`Image URL ${idx + 1}`}
                      />
                      <button
                        type="button"
                        className="image-url-remove"
                        onClick={() => removeImageUrl(idx)}
                        aria-label={`Remove image ${idx + 1}`}
                        title="Remove"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="image-url-add"
                  onClick={addImageUrl}
                >
                  <FiPlus style={{ verticalAlign: "middle", marginRight: 4 }} />
                  Add Image URL
                </button>
              </div>
            </div>

            {/* Toggles & Publish */}
            <div className="admin-card">
              <h2 className="admin-pf-section-title">Visibility</h2>

              <div className="admin-pf-toggle-row">
                <div>
                  <p className="admin-notification-label">Active</p>
                  <p className="admin-notification-desc">
                    Show this product in the store.
                  </p>
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
                  <p className="admin-notification-desc">
                    Highlight this product on the homepage.
                  </p>
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
                    ? isEditMode
                      ? "Saving…"
                      : "Creating…"
                    : isEditMode
                    ? "Save Changes"
                    : "Create Product"}
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
