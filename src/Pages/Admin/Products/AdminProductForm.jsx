import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiX, FiPlus } from "react-icons/fi";
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
import ImageManager from "../../../Components/Admin/ImageManager/ImageManager";
import announcementsApi from "../../../Services/api/announcementsApi";
import { mergeCombinations, generateCombinations, comboKey } from "../../../utils/variantMatrix";
import CreatableTagSelect from "../../../Components/CreatableTagSelect/CreatableTagSelect";
import "./AdminProductForm.css";

const normalizeImage = (img) =>
  typeof img === "object"
    ? { url: img.url, publicId: img.publicId || "" }
    : { url: img, publicId: "" };
const normalizeImages = (images) =>
  Array.isArray(images) ? images.map(normalizeImage).filter((img) => img.url && img.publicId) : [];

/* ─── Section card (sortable) ────────────────────────────────────────────── */
const SectionCard = ({ section, index, onUpdate, onRemove }) => {
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

// Quick-pick suggestions — admins can also type any new value (free-form tags).
const CATEGORY_SUGGESTIONS      = ["dogs", "cats", "fish", "birds", "general", "apparel"];
const SUITABLE_FOR_SUGGESTIONS  = ["Male", "Female", "Unisex"];

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
  vetRecommended: false,
  onSale:        false,
  discountType:  "percent",
  discountValue: "",
  saleStartsAt:  "",
  saleEndsAt:    "",
};

const resolveCategories = (p) => {
  if (Array.isArray(p.categories) && p.categories.length > 0) return p.categories;
  if (p.category) return [p.category];
  return ["general"];
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const isEditMode = Boolean(id);

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [loading,    setLoading]    = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [notifyOnSale, setNotifyOnSale] = useState(false);

  // Image state — ordered refs [{ url, publicId }]; index 0 = cover.
  // Uploads happen immediately inside <ImageManager>, so the form just holds refs.
  const [images, setImages] = useState([]);


  // Sections (dynamic rich-text tabs)
  const [sections, setSections] = useState([]);
  const [variants, setVariants] = useState([]); // [{ label, price, quantity }] or matrix rows with optionValues
  // Option axes (matrix products) — [{ name, values: [] }], max 4
  const [options, setOptions] = useState([]);
  const [optionValueInputs, setOptionValueInputs] = useState([]); // per-axis pending value text
  const [removedCombos, setRemovedCombos] = useState(new Set());
  // Distinct attribute values across products — dropdown suggestions
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    api.get("/products/filter-options")
      .then((res) => setSuggestions(res?.data?.data ?? null))
      .catch(() => {}); // silent — hardcoded quick-picks still work
  }, []);

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
          categories: resolveCategories(p),
          colors:    Array.isArray(p.colors)  ? p.colors  : [],
          genders:   Array.isArray(p.genders) ? p.genders : [],
          isActive:  p.isActive  ?? true,
          isFeatured:p.isFeatured ?? false,
          vetRecommended: p.vetRecommended ?? false,
          onSale:        p.onSale ?? false,
          discountType:  p.discountType ?? "percent",
          discountValue: p.discountValue ?? "",
          saleStartsAt:  p.saleStartsAt ? p.saleStartsAt.slice(0, 10) : "",
          saleEndsAt:    p.saleEndsAt ? p.saleEndsAt.slice(0, 10) : "",
        });

        const loadedOptions = Array.isArray(p.options)
          ? p.options.map((o) => ({ name: o.name, values: [...(o.values || [])] }))
          : [];
        setOptions(loadedOptions);
        setOptionValueInputs(loadedOptions.map(() => ""));
        // Combos absent from the stored variants were removed by the admin —
        // seed them so the merge effect doesn't resurrect them as blank rows.
        if (loadedOptions.length > 0) {
          const storedKeys = new Set(
            (p.variants || [])
              .filter((v) => v.optionValues)
              .map((v) => comboKey(v.optionValues, loadedOptions))
          );
          setRemovedCombos(new Set(
            generateCombinations(loadedOptions)
              .map((c) => c.key)
              .filter((k) => !storedKeys.has(k))
          ));
        }
        setVariants(
          Array.isArray(p.variants)
            ? p.variants.map((v) => ({
                _key: v._id || crypto.randomUUID(),
                label: v.label,
                optionValues: v.optionValues || undefined,
                price: v.price,
                quantity: v.quantity,
                images: normalizeImages(v.images),
              }))
            : []
        );
        setSections(
          Array.isArray(p.sections)
            ? p.sections.map((s, i) => ({ id: `sec-${Date.now()}-${i}`, title: s.title || "", body: s.body || "" }))
            : []
        );

        const imgs = normalizeImages(p.images);
        setImages(imgs);
      } catch {
        addToast("Failed to load product data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));


  // Update one variant's fields (incl. its images array)
  const updateVariant = (i, changes) =>
    setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, ...changes } : x)));

  const removeVariant = (i) =>
    setVariants((vs) => vs.filter((_, j) => j !== i));

  // Quick-picks = hardcoded defaults ∪ values already used on other products
  const categorySuggestions = [...new Set([...CATEGORY_SUGGESTIONS, ...(suggestions?.categories || [])])];
  const suitableForSuggestions = [...new Set([...SUITABLE_FOR_SUGGESTIONS, ...(suggestions?.genders || [])])];
  const colorSuggestions = suggestions?.colors || [];

  // ── Option axes (matrix products) ───────────────────────────────────────────
  const axesComplete = options.length > 0 && options.every((o) => o.name.trim() && o.values.length > 0);

  // Regenerate the combination rows whenever the axes change (preserves
  // price/stock/images of surviving combinations via their key).
  useEffect(() => {
    if (!axesComplete) return;
    setVariants((vs) => mergeCombinations(options, vs, removedCombos));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options), removedCombos]);

  const addOptionAxis = () => {
    if (options.length >= 4) return;
    setOptions((os) => [...os, { name: "", values: [] }]);
    setOptionValueInputs((ins) => [...ins, ""]);
  };

  const removeOptionAxis = (i) => {
    setOptions((os) => os.filter((_, j) => j !== i));
    setOptionValueInputs((ins) => ins.filter((_, j) => j !== i));
    setRemovedCombos(new Set()); // keys are axis-dependent — reset
    // Dropping the last axis returns to the flat editor with stale matrix rows — clear them.
    if (options.length === 1) setVariants([]);
  };

  const updateOptionAxis = (i, changes) =>
    setOptions((os) => os.map((o, j) => (j === i ? { ...o, ...changes } : o)));

  const addOptionValue = (i, raw) => {
    const val = (raw ?? optionValueInputs[i] ?? "").trim();
    if (!val) return;
    if (!options[i].values.includes(val)) {
      updateOptionAxis(i, { values: [...options[i].values, val] });
    }
    setOptionValueInputs((ins) => ins.map((x, j) => (j === i ? "" : x)));
  };

  const removeOptionValue = (i, val) =>
    updateOptionAxis(i, { values: options[i].values.filter((v) => v !== val) });

  const removeCombination = (key) =>
    setRemovedCombos((s) => new Set(s).add(key));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      addToast("Product name must be at least 2 characters.", "error");
      return false;
    }
    const descPlain = (
      new DOMParser().parseFromString(form.description, "text/html").body.textContent ?? ""
    ).trim();
    if (!descPlain || descPlain.length < 10) {
      addToast("Description must be at least 10 characters.", "error");
      return false;
    }
    if (options.length > 0) {
      if (!axesComplete) {
        addToast("Give every option a name and at least one value.", "error");
        return false;
      }
      if (variants.length === 0) {
        addToast("Keep at least one combination.", "error");
        return false;
      }
      const bad = variants.some((v) => v.price === "" || Number(v.price) < 0 || v.quantity === "" || Number(v.quantity) < 0);
      if (bad) {
        addToast("Each combination needs a price and stock.", "error");
        return false;
      }
    } else if (variants.length > 0) {
      const bad = variants.some((v) => !v.label.trim() || v.price === "" || Number(v.price) < 0 || v.quantity === "" || Number(v.quantity) < 0);
      if (bad) {
        addToast("Each variant needs a label, price and stock.", "error");
        return false;
      }
    } else {
      if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
        addToast("Please enter a valid price.", "error");
        return false;
      }
      if (form.quantity === "" || Number.isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
        addToast("Please enter a valid stock quantity.", "error");
        return false;
      }
    }
    if (form.categories.length === 0) {
      addToast("Select at least one category.", "error");
      return false;
    }
    if (images.length === 0) {
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
    // Always send `variants` — even when empty. Omitting it on an update left the
    // server unable to tell "no variants" from "field not provided", so deleting
    // every variant never cleared them. When empty, also send the top-level
    // price/quantity that then apply to the (now simple) product.
    // Option axes — server derives combination labels from these + optionValues.
    fd.append("options", JSON.stringify(
      options.map((o) => ({ name: o.name.trim(), values: o.values }))
    ));
    fd.append("variants", JSON.stringify(
      variants.map((v) => ({
        label: (v.label || "").trim() || Object.values(v.optionValues || {}).join(" · "),
        ...(v.optionValues ? { optionValues: v.optionValues } : {}),
        price: Number(v.price),
        quantity: Number(v.quantity),
        images: (v.images || []).map((img) => ({ url: img.url, publicId: img.publicId })),
      }))
    ));
    if (variants.length === 0) {
      fd.append("price",     Number(form.price));
      fd.append("quantity",  Number(form.quantity) || 0);
    }
    fd.append("isActive",    String(form.isActive));
    fd.append("isFeatured",  String(form.isFeatured));
    fd.append("vetRecommended", String(form.vetRecommended));
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

    // ImageManager already uploaded every image — submit the final ordered refs.
    fd.append("imageRefs", JSON.stringify(
      images.map((img) => ({ url: img.url, publicId: img.publicId }))
    ));

    try {
      setSubmitting(true);
      let res;
      if (isEditMode) {
        res = await api.patch(`/products/${id}`, fd);
        addToast("Product updated successfully.", "success");
      } else {
        res = await api.post("/products", fd);
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

  // Live sale-price preview
  const priceNum = Number(form.price) || 0;
  const valNum = Number(form.discountValue) || 0;
  const previewSalePrice =
    form.discountType === "percent"
      ? Math.round(priceNum * (1 - Math.min(100, Math.max(0, valNum)) / 100) * 100) / 100
      : valNum;
  let previewPct;
  if (form.discountType === "percent") {
    previewPct = Math.round(valNum);
  } else {
    previewPct = priceNum > 0 ? Math.round(((priceNum - valNum) / priceNum) * 100) : 0;
  }

  let submitBtnLabel;
  if (submitting) {
    submitBtnLabel = isEditMode ? "Saving…" : "Creating…";
  } else {
    submitBtnLabel = isEditMode ? "Save Changes" : "Create Product";
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
                <p className="admin-label">
                  Description <span className="admin-required">*</span>
                </p>
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

              {/* Price + Quantity (hidden when variants are used — derived from them) */}
              {variants.length === 0 && (
                <div className="admin-pf-row">
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="pf-price">
                      Price (Rs) <span className="admin-required">*</span>
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
              )}

              {/* Option axes (matrix products): Weight × Flavour × … max 4 */}
              <div className="admin-field apf-variants">
                <div className="apf-variants-head">
                  <span className="admin-label">Product options (e.g. Weight, Flavour)</span>
                  {options.length < 4 && (
                    <button type="button" className="apf-variant-add" onClick={addOptionAxis}>
                      + Add option
                    </button>
                  )}
                </div>
                {options.map((axis, i) => (
                  <div key={i} className="apf-variant-block">
                    <div className="apf-variant-row">
                      <input
                        className="admin-input"
                        placeholder="Option name (e.g. Weight)"
                        value={axis.name}
                        list="apf-option-name-suggestions"
                        onChange={(e) => updateOptionAxis(i, { name: e.target.value })}
                      />
                      <button type="button" className="apf-variant-remove" onClick={() => removeOptionAxis(i)}>
                        Remove
                      </button>
                    </div>
                    <div className={`admin-pf-color-input-wrap${optionValueInputs[i] ? " focused" : ""}`}>
                      {axis.values.map((val) => (
                        <span key={val} className="admin-pf-color-tag">
                          {val}
                          <button
                            type="button"
                            className="admin-pf-color-tag-remove"
                            onClick={() => removeOptionValue(i, val)}
                            aria-label={`Remove ${val}`}
                          >
                            <FiX size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        className="admin-pf-color-input"
                        value={optionValueInputs[i] ?? ""}
                        onChange={(e) => setOptionValueInputs((ins) => ins.map((x, j) => (j === i ? e.target.value : x)))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addOptionValue(i); }
                          if (e.key === "Backspace" && !optionValueInputs[i] && axis.values.length > 0) {
                            removeOptionValue(i, axis.values[axis.values.length - 1]);
                          }
                        }}
                        onBlur={() => addOptionValue(i)}
                        placeholder={axis.values.length === 0 ? "Type a value and press Enter… (e.g. 5kg)" : "Add another…"}
                      />
                    </div>
                  </div>
                ))}
                <datalist id="apf-option-name-suggestions">
                  {(suggestions?.optionNames || []).map((n) => <option key={n} value={n} />)}
                </datalist>
              </div>

              {/* Combination table (matrix) or flat variants (legacy/simple) */}
              <div className="admin-field apf-variants">
                <div className="apf-variants-head">
                  <span className="admin-label">
                    {options.length > 0 ? "Combinations (price & stock per combination)" : "Weight / size variants"}
                  </span>
                  {options.length === 0 && (
                    <button
                      type="button"
                      className="apf-variant-add"
                      onClick={() => setVariants((vs) => [...vs, { _key: crypto.randomUUID(), label: "", price: "", quantity: "", images: [] }])}
                    >
                      + Add variant
                    </button>
                  )}
                </div>
                {variants.length > 0 && (
                  <p className="apf-hint">Price &amp; stock are set per {options.length > 0 ? "combination" : "variant"} — the top-level price/stock are derived automatically.</p>
                )}
                {options.length > 0 && !axesComplete && (
                  <p className="apf-hint">Give every option a name and at least one value to generate the combinations.</p>
                )}
                {variants.map((v, i) => (
                  <div key={v.key || v._key || v._id || i} className="apf-variant-block">
                    <div className="apf-variant-row">
                      {v.optionValues ? (
                        <span className="admin-input apf-combo-label">
                          {Object.values(v.optionValues).join(" · ")}
                        </span>
                      ) : (
                        <input
                          className="admin-input"
                          placeholder="Label (e.g. 5kg)"
                          value={v.label}
                          onChange={(e) => updateVariant(i, { label: e.target.value })}
                        />
                      )}
                      <input
                        className="admin-input"
                        type="number" min="0" step="0.01" placeholder="Price (Rs)"
                        value={v.price}
                        onChange={(e) => updateVariant(i, { price: e.target.value })}
                      />
                      <input
                        className="admin-input"
                        type="number" min="0" step="1" placeholder="Stock"
                        value={v.quantity}
                        onChange={(e) => updateVariant(i, { quantity: e.target.value })}
                      />
                      <button
                        type="button"
                        className="apf-variant-remove"
                        onClick={() => (v.key ? removeCombination(v.key) : removeVariant(i))}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="apf-variant-images">
                      <span className="apf-variant-images-label">Variant images (optional, up to 6)</span>
                      <ImageManager
                        value={v.images || []}
                        onChange={(imgs) => updateVariant(i, { images: imgs })}
                        uploadUrl="/products/upload-image"
                        max={6}
                        onError={(msg) => addToast(msg, "error")}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Categories */}
              <div className="admin-field">
                <CreatableTagSelect
                  label="Categories"
                  required
                  value={form.categories}
                  onChange={(vals) => setField("categories", vals)}
                  options={categorySuggestions}
                  placeholder="Select or create a category…"
                />
                {form.categories.length === 0 && (
                  <p className="admin-pf-cats-hint">Add at least one category</p>
                )}
              </div>

              {/* Suitable For */}
              <div className="admin-field">
                <CreatableTagSelect
                  label="Suitable For"
                  value={form.genders}
                  onChange={(vals) => setField("genders", vals)}
                  options={suitableForSuggestions}
                  placeholder="e.g. Male, Female, Unisex…"
                />
              </div>

              {/* Colors */}
              <div className="admin-field">
                <CreatableTagSelect
                  label="Colors"
                  value={form.colors}
                  onChange={(vals) => setField("colors", vals)}
                  options={colorSuggestions}
                  placeholder="e.g. Black, Red, Blue…"
                />
              </div>
            </div>
          </div>

          {/* ── Right column: Images + Visibility ── */}
          <div className="admin-pf-col">

            {/* Images */}
            <div className="admin-card">
              <h2 className="admin-pf-section-title">
                Images
                {images.length > 0 && (
                  <span className="admin-pf-img-count">{images.length} attached</span>
                )}
              </h2>
              <p className="apf-hint" style={{ marginTop: 0 }}>
                Drag to reorder · the first image is the cover shown everywhere.
              </p>
              <ImageManager
                value={images}
                onChange={setImages}
                uploadUrl="/products/upload-image"
                max={10}
                onError={(msg) => addToast(msg, "error")}
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
                  <p className="admin-notification-label">Vet Recommended</p>
                  <p className="admin-notification-desc">Show in the "Vet Recommended This Month" homepage section.</p>
                </div>
                <label className="admin-toggle" aria-label="Vet Recommended">
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={form.vetRecommended}
                    onChange={(e) => setField("vetRecommended", e.target.checked)}
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
                    <div className="admin-pf-sale-field">
                      <span>Discount type</span>
                      <Select
                        value={form.discountType}
                        onValueChange={(v) => setField("discountType", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percentage (%)</SelectItem>
                          <SelectItem value="amount">Fixed sale price (Rs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                  {submitBtnLabel}
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
