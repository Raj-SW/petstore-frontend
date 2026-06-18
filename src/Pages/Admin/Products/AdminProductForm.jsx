import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiX, FiUpload, FiPlus } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../../../core/api/apiClient";
import { useToast } from "../../../context/ToastContext";
import { RichTextEditor } from "../../../Components/RichText";
import announcementsApi from "../../../Services/api/announcementsApi";
import "./AdminProductForm.css";

/* ─── Section card (sortable) ────────────────────────────────────────────── */
const SectionCard = ({ section, index, total, onUpdate, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={`admin-pf-section-card${isDragging ? " dragging" : ""}`}>
      <div className="admin-pf-section-header">
        {/* Drag handle */}
        <button type="button" className="admin-pf-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
          <MdDragIndicator />
        </button>

        <input
          className="admin-pf-section-title-input"
          placeholder="Section title… e.g. Key Benefits"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />

        <span className="admin-pf-section-badge">Tab {index + 2}</span>

        <button type="button" className="admin-pf-section-delete" onClick={onRemove} title="Remove section">
          <FiX size={14} />
        </button>
      </div>

      <div className="admin-pf-section-body">
        <RichTextEditor
          preset="standard"
          value={section.body}
          onChange={(body) => onUpdate({ body })}
          placeholder="Write this section's content…"
          minHeight="120px"
        />
      </div>
    </div>
  );
};

const CATEGORIES = ["dogs", "cats", "fish", "birds", "general", "apparel"];
const GENDERS    = ["Male", "Female", "Unisex"];

const EMPTY_FORM = {
  name:        "",
  description: "",
  price:       "",
  quantity:    "",
  categories:  ["general"],
  colors:      [],
  genders:     [],
  isActive:    true,
  isFeatured:  false,
  onSale:        false,
  discountType:  "percent",
  discountValue: "",
  saleStartsAt:  "",
  saleEndsAt:    "",
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(id);

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [loading,    setLoading]    = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [notifyOnSale, setNotifyOnSale] = useState(false);

  // Image state
  const [imageFiles,     setImageFiles]     = useState([]);  // new File objects
  const [existingImages, setExistingImages] = useState([]);  // {url, publicId} from DB
  const [imagePreviews,  setImagePreviews]  = useState([]);  // blob URLs for new files

  // Color tag input
  const [colorInput, setColorInput] = useState("");

  // Sections (dynamic rich-text tabs)
  const [sections, setSections] = useState([]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(({ active, over }) => {
    if (over && active.id !== over.id) {
      setSections((prev) => {
        const oldIdx = prev.findIndex((s) => s.id === active.id);
        const newIdx = prev.findIndex((s) => s.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  }, []);

  const addSection = () =>
    setSections((prev) => [...prev, { id: `sec-${Date.now()}`, title: "", body: "" }]);

  const removeSection = (id) =>
    setSections((prev) => prev.filter((s) => s.id !== id));

  const updateSection = (id, changes) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));

  // ── Fetch product in edit mode ──────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        const p   = res?.data?.data ?? res?.data ?? {};

        setForm({
          name:       p.name        ?? p.title ?? "",
          description:p.description ?? "",
          price:      p.price       ?? "",
          quantity:   p.quantity    ?? p.stock ?? "",
          categories: Array.isArray(p.categories) && p.categories.length > 0
            ? p.categories
            : p.category ? [p.category] : ["general"],
          colors:    Array.isArray(p.colors)  ? p.colors  : [],
          genders:   Array.isArray(p.genders) ? p.genders : [],
          isActive:  p.isActive  ?? true,
          isFeatured:p.isFeatured ?? false,
          onSale:        p.onSale ?? false,
          discountType:  p.discountType ?? "percent",
          discountValue: p.discountValue ?? "",
          saleStartsAt:  p.saleStartsAt ? p.saleStartsAt.slice(0, 10) : "",
          saleEndsAt:    p.saleEndsAt ? p.saleEndsAt.slice(0, 10) : "",
        });

        setSections(
          Array.isArray(p.sections)
            ? p.sections.map((s, i) => ({ id: `sec-${Date.now()}-${i}`, title: s.title || "", body: s.body || "" }))
            : []
        );

        const imgs = Array.isArray(p.images) && p.images.length > 0
          ? p.images
              .map((img) => typeof img === "object"
                ? { url: img.url, publicId: img.publicId || "" }
                : { url: img, publicId: "" })
              .filter((img) => img.url)
          : p.imageUrl
          ? [{ url: p.imageUrl, publicId: "" }]
          : [];
        setExistingImages(imgs);
      } catch (err) {
        addToast("Failed to load product data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // ── Category chips ──────────────────────────────────────────────────────────
  const toggleCategory = (cat) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));

  // ── Gender checkboxes ───────────────────────────────────────────────────────
  const toggleGender = (g) =>
    setForm((f) => ({
      ...f,
      genders: f.genders.includes(g)
        ? f.genders.filter((x) => x !== g)
        : [...f.genders, g],
    }));

  // ── Color tag input ─────────────────────────────────────────────────────────
  const addColor = () => {
    const val = colorInput.trim();
    if (!val) return;
    if (!form.colors.includes(val)) {
      setField("colors", [...form.colors, val]);
    }
    setColorInput("");
  };

  const handleColorKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addColor();
    }
    if (e.key === "Backspace" && !colorInput && form.colors.length > 0) {
      setField("colors", form.colors.slice(0, -1));
    }
  };

  const removeColor = (color) =>
    setField("colors", form.colors.filter((c) => c !== color));

  // ── File handling ───────────────────────────────────────────────────────────
  const MAX_MB    = 4;
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  const handleFileChange = (e) => {
    const files    = Array.from(e.target.files || []);
    if (!files.length) return;

    const oversized = files.filter((f) => f.size > MAX_BYTES);
    if (oversized.length) {
      addToast(
        `${oversized.map((f) => `"${f.name}"`).join(", ")} exceed${oversized.length === 1 ? "s" : ""} the ${MAX_MB} MB limit.`,
        "error"
      );
    }

    const valid = files.filter((f) => f.size <= MAX_BYTES);
    if (!valid.length) { e.target.value = ""; return; }

    setImageFiles((p)    => [...p, ...valid]);
    setImagePreviews((p) => [...p, ...valid.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewFile = (i) => {
    URL.revokeObjectURL(imagePreviews[i]);
    setImageFiles((p)    => p.filter((_, j) => j !== i));
    setImagePreviews((p) => p.filter((_, j) => j !== i));
  };

  const removeExistingImage = (i) =>
    setExistingImages((p) => p.filter((_, j) => j !== i));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      addToast("Product name must be at least 2 characters.", "error");
      return false;
    }
    // Strip HTML tags to get plain text length for validation
    const descPlain = form.description.replace(/<[^>]*>/g, "").trim();
    if (!descPlain || descPlain.length < 10) {
      addToast("Description must be at least 10 characters.", "error");
      return false;
    }
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) {
      addToast("Please enter a valid price.", "error");
      return false;
    }
    if (form.quantity === "" || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
      addToast("Please enter a valid stock quantity.", "error");
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

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append("name",        form.name.trim());
    fd.append("description", form.description);
    fd.append("price",       Number(form.price));
    fd.append("quantity",    Number(form.quantity) || 0);
    fd.append("isActive",    String(form.isActive));
    fd.append("isFeatured",  String(form.isFeatured));
    fd.append("onSale",        String(form.onSale));
    fd.append("discountType",  form.discountType);
    fd.append("discountValue", String(Number(form.discountValue) || 0));
    if (form.saleStartsAt) fd.append("saleStartsAt", form.saleStartsAt);
    if (form.saleEndsAt)   fd.append("saleEndsAt", form.saleEndsAt);

    form.categories.forEach((c) => fd.append("categories", c));
    form.colors.forEach((c)     => fd.append("colors", c));
    form.genders.forEach((g)    => fd.append("genders", g));

    // Sections — send as JSON string (FormData can't send nested objects)
    fd.append("sections", JSON.stringify(
      sections
        .filter((s) => s.title.trim() && s.body)
        .map(({ title, body }, order) => ({ title: title.trim(), body, order }))
    ));

    imageFiles.forEach((file) => fd.append("images", file));

    if (isEditMode) {
      // Tell the backend exactly which existing images to keep (selective delete)
      fd.append("keepImages", JSON.stringify(existingImages));
    }

    try {
      setSubmitting(true);
      let res;
      if (isEditMode) {
        res = await api.patch(`/products/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        addToast("Product updated successfully.", "success");
      } else {
        res = await api.post("/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        addToast("Product created successfully.", "success");
      }

      // Inline sale notification — fire-and-forget; never block the save flow.
      const savedProduct = res?.data?.data || res?.data;
      const savedId = savedProduct?._id || id;
      if (notifyOnSale && form.onSale && savedId) {
        try {
          await announcementsApi.createAnnouncement({
            subject: `${savedProduct?.name || form.name.trim()} is now on sale at VitalPaws`,
            productIds: [savedId],
            source: "inline",
          });
          addToast("Customers notified about this sale", "success");
        } catch {
          addToast("Saved, but the sale email could not be sent", "warning");
        }
      }

      navigate("/admin/products");
    } catch (err) {
      addToast(
        err?.message || (isEditMode ? "Failed to update product." : "Failed to create product."),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-pf-loading">Loading product…</div>
      </div>
    );
  }

  const hasAnyImage = existingImages.length > 0 || imagePreviews.length > 0;

  // Live sale-price preview
  const priceNum = Number(form.price) || 0;
  const valNum = Number(form.discountValue) || 0;
  const previewSalePrice =
    form.discountType === "percent"
      ? Math.round(priceNum * (1 - Math.min(100, Math.max(0, valNum)) / 100) * 100) / 100
      : valNum;
  const previewPct =
    form.discountType === "percent"
      ? Math.round(valNum)
      : priceNum > 0 ? Math.round(((priceNum - valNum) / priceNum) * 100) : 0;

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
                />
              </div>

              {/* Description */}
              <div className="admin-field">
                <label className="admin-label">
                  Description <span className="admin-required">*</span>
                </label>
                <RichTextEditor
                  preset="standard"
                  value={form.description}
                  onChange={(html) => setField("description", html)}
                  placeholder="Describe the product in detail… (min 10 characters)"
                  maxLength={2000}
                  showCharCount
                  minHeight="160px"
                />
              </div>

              {/* Price + Quantity */}
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
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="pf-quantity">
                    Stock Qty <span className="admin-required">*</span>
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
                      className={`admin-pf-cat-chip${form.categories.includes(cat) ? " selected" : ""}`}
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

              {/* Genders */}
              <div className="admin-field">
                <span className="admin-label">Suitable For</span>
                <div className="admin-pf-genders">
                  {GENDERS.map((g) => (
                    <label key={g} className="admin-pf-gender-label">
                      <input
                        type="checkbox"
                        className="admin-pf-gender-cb"
                        checked={form.genders.includes(g)}
                        onChange={() => toggleGender(g)}
                      />
                      <span className={`admin-pf-gender-chip${form.genders.includes(g) ? " selected" : ""}`}>
                        {g}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="admin-field">
                <span className="admin-label">Colors</span>
                <div className={`admin-pf-color-input-wrap${colorInput ? " focused" : ""}`}>
                  {form.colors.map((color) => (
                    <span key={color} className="admin-pf-color-tag">
                      {color}
                      <button
                        type="button"
                        className="admin-pf-color-tag-remove"
                        onClick={() => removeColor(color)}
                        aria-label={`Remove ${color}`}
                      >
                        <FiX size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    className="admin-pf-color-input"
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={handleColorKeyDown}
                    onBlur={addColor}
                    placeholder={form.colors.length === 0 ? "Type a color and press Enter…" : "Add another…"}
                  />
                </div>
                <p className="admin-pf-color-hint">Press Enter or comma after each color</p>
              </div>
            </div>
          </div>

          {/* ── Right column: Images + Visibility ── */}
          <div className="admin-pf-col">

            {/* Images */}
            <div className="admin-card">
              <h2 className="admin-pf-section-title">
                Images
                {hasAnyImage && (
                  <span className="admin-pf-img-count">
                    {existingImages.length + imagePreviews.length} attached
                  </span>
                )}
              </h2>

              {/* Existing images (edit mode) */}
              {existingImages.length > 0 && (
                <div className="admin-pf-img-grid">
                  {existingImages.map((img, i) => (
                    <div key={i} className="admin-pf-img-thumb">
                      <img src={img.url} alt={`Image ${i + 1}`} />
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
                <div
                  className="admin-pf-img-grid"
                  style={{ marginTop: existingImages.length > 0 ? "0.75rem" : 0 }}
                >
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

              {/* Drop zone */}
              <div
                className="admin-pf-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length) {
                    handleFileChange({ target: { files: e.dataTransfer.files, value: "" } });
                  }
                }}
                style={{ marginTop: hasAnyImage ? "0.85rem" : 0 }}
              >
                <FiUpload size={22} className="admin-pf-dropzone-icon" />
                <p className="admin-pf-dropzone-text">
                  <strong>Click to upload</strong> or drag &amp; drop
                </p>
                <p className="admin-pf-dropzone-hint">PNG, JPG, WEBP · max {MAX_MB} MB · up to 10 files</p>
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

            {/* Visibility + Submit */}
            <div className="admin-card">
              <h2 className="admin-pf-section-title">Visibility</h2>

              <div className="admin-pf-toggle-row">
                <div>
                  <p className="admin-notification-label">Active</p>
                  <p className="admin-notification-desc">Show this product in the store.</p>
                </div>
                <label className="admin-toggle" aria-label="Active">
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
                  <p className="admin-notification-desc">Highlight on the homepage.</p>
                </div>
                <label className="admin-toggle" aria-label="Featured">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={form.isFeatured}
                    onChange={(e) => setField("isFeatured", e.target.checked)}
                  />
                </label>
              </div>

              <div className="admin-pf-toggle-row">
                <div>
                  <p className="admin-notification-label">On Sale</p>
                  <p className="admin-notification-desc">Apply a discount to this product.</p>
                </div>
                <label className="admin-toggle" aria-label="On Sale">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={form.onSale}
                    onChange={(e) => setField("onSale", e.target.checked)}
                  />
                </label>
              </div>

              {form.onSale && (
                <div className="admin-pf-sale">
                  <div className="admin-pf-sale-row">
                    <label className="admin-pf-sale-field">
                      <span>Discount type</span>
                      <select
                        value={form.discountType}
                        onChange={(e) => setField("discountType", e.target.value)}
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="amount">Fixed sale price (Rs)</option>
                      </select>
                    </label>
                    <label className="admin-pf-sale-field">
                      <span>{form.discountType === "percent" ? "Percent off" : "Sale price (Rs)"}</span>
                      <input
                        type="number"
                        min="0"
                        value={form.discountValue}
                        onChange={(e) => setField("discountValue", e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin-pf-sale-row">
                    <label className="admin-pf-sale-field">
                      <span>Sale starts (optional)</span>
                      <input
                        type="date"
                        value={form.saleStartsAt}
                        onChange={(e) => setField("saleStartsAt", e.target.value)}
                      />
                    </label>
                    <label className="admin-pf-sale-field">
                      <span>Sale ends (optional)</span>
                      <input
                        type="date"
                        value={form.saleEndsAt}
                        onChange={(e) => setField("saleEndsAt", e.target.value)}
                      />
                    </label>
                  </div>
                  {valNum > 0 && priceNum > 0 && (
                    <p className="admin-pf-sale-preview">
                      Sale price: <strong>Rs {previewSalePrice}</strong> (−{previewPct}%)
                    </p>
                  )}
                  <label className="admin-pf-notify-row">
                    <input
                      type="checkbox"
                      checked={notifyOnSale}
                      onChange={(e) => setNotifyOnSale(e.target.checked)}
                    />
                    <span>Email subscribed customers about this sale</span>
                  </label>
                </div>
              )}

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
                    ? (isEditMode ? "Saving…" : "Creating…")
                    : (isEditMode ? "Save Changes" : "Create Product")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sections (full-width below the grid) ── */}
        <div className="admin-card admin-pf-sections-card">
          <div className="admin-pf-sections-header">
            <div>
              <h2 className="admin-pf-section-title" style={{ marginBottom: "0.2rem" }}>
                📑 Product Sections
              </h2>
              <p className="admin-pf-sections-hint">
                Each section becomes a tab on the product page. The <strong>Overview</strong> tab always comes first and uses the description above.
              </p>
            </div>
          </div>

          {sections.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <AnimatePresence>
                  {sections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SectionCard
                        section={section}
                        index={index}
                        total={sections.length}
                        onUpdate={(changes) => updateSection(section.id, changes)}
                        onRemove={() => removeSection(section.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          )}

          <button type="button" className="admin-pf-add-section-btn" onClick={addSection}>
            <FiPlus size={16} />
            Add Section
          </button>
        </div>

      </form>
    </motion.div>
  );
};

export default AdminProductForm;
