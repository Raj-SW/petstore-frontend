import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiSave, FiUploadCloud, FiX } from "react-icons/fi";
import { RichTextEditor } from "../../../Components/RichText";
import galleryApi from "../../../Services/api/galleryApi";
import { useToast } from "../../../context/ToastContext";
import { GALLERY_CATEGORIES } from "../../Gallery/galleryTheme";
import "../Tips/AdminTipForm.css";
import "./AdminGalleryForm.css";

const EMPTY_FORM = {
  title: "",
  coverImage: "",
  body: "",
  category: "event",
  eventDate: "",
  location: "",
  tags: "",
  featured: false,
  published: false,
};

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const AdminGalleryForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [sections, setSections] = useState([]); // [{ id, heading, body }]
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef(null);

  const addSection = () =>
    setSections((prev) => [...prev, { id: `sec-${Date.now()}`, heading: "", body: "" }]);
  const removeSection = (sid) =>
    setSections((prev) => prev.filter((s) => s.id !== sid));
  const updateSection = (sid, changes) =>
    setSections((prev) => prev.map((s) => (s.id === sid ? { ...s, ...changes } : s)));

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await galleryApi.getPostAdmin(id);
        const p = res.data;
        setForm({
          title: p.title || "",
          coverImage: p.coverImage || "",
          body: p.body || "",
          category: p.category || "event",
          eventDate: toDateInput(p.eventDate),
          location: p.location || "",
          tags: (p.tags || []).join(", "),
          featured: Boolean(p.featured),
          published: Boolean(p.published),
        });
        setSections(
          Array.isArray(p.sections)
            ? p.sections.map((s, i) => ({ id: `sec-${Date.now()}-${i}`, heading: s.heading || "", body: s.body || "" }))
            : []
        );
      } catch {
        addToast("Failed to load post", "error");
        navigate("/admin/gallery");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, addToast, navigate]);

  const set = (field) => (e) => {
    const value = e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleCoverPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await galleryApi.uploadImage(file);
      if (url) setForm((f) => ({ ...f, coverImage: url }));
    } catch {
      addToast("Cover upload failed", "error");
    } finally {
      setUploadingCover(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (form.title.trim().length < 2) errs.title = "Title must be at least 2 characters";
    if (!form.body || form.body === "<p></p>") errs.body = "Body is required";
    if (!form.eventDate) errs.eventDate = "Event date is required";
    if (form.coverImage && !/^https?:\/\//.test(form.coverImage)) {
      errs.coverImage = "Cover image must be a valid URL";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = {
        ...form,
        location: form.location.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sections: sections
          .filter((s) => (s.heading && s.heading.trim()) || (s.body && s.body !== "<p></p>"))
          .map(({ heading, body }, order) => ({ heading: (heading || "").trim(), body: body || "", order })),
      };
      if (isEdit) {
        await galleryApi.updatePost(id, payload);
        addToast("Post updated", "success");
      } else {
        await galleryApi.createPost(payload);
        addToast("Post created", "success");
      }
      navigate("/admin/gallery");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to save post", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-page"><p>Loading…</p></div>;

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <Link to="/admin/gallery" className="atf-back">
            <FiArrowLeft size={14} /> Back to gallery
          </Link>
          <h1 className="admin-page-title">{isEdit ? "Edit Post" : "New Post"}</h1>
        </div>
      </div>

      <form className="atf-form" onSubmit={handleSubmit}>
        <div className="atf-field">
          <label htmlFor="agf-title">Title</label>
          <input id="agf-title" type="text" value={form.title} onChange={set("title")} maxLength={150} />
          {errors.title && <p className="atf-error">{errors.title}</p>}
        </div>

        <div className="atf-row">
          <div className="atf-field">
            <label htmlFor="agf-category">Category</label>
            <select id="agf-category" value={form.category} onChange={set("category")}>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="atf-field">
            <label htmlFor="agf-date">Event date</label>
            <input id="agf-date" type="date" value={form.eventDate} onChange={set("eventDate")} />
            {errors.eventDate && <p className="atf-error">{errors.eventDate}</p>}
          </div>
          <div className="atf-field">
            <label htmlFor="agf-location">Location (optional)</label>
            <input id="agf-location" type="text" value={form.location} onChange={set("location")} maxLength={160} placeholder="e.g. Bagatelle Mall" />
          </div>
        </div>

        <div className="atf-field">
          <label htmlFor="agf-tags">Tags (comma-separated, optional)</label>
          <input id="agf-tags" type="text" value={form.tags} onChange={set("tags")} placeholder="expo, community, adoption" />
        </div>

        <div className="atf-field">
          <label>Cover image (optional)</label>
          <div className="agf-cover">
            {form.coverImage ? (
              <div className="agf-cover-preview">
                <img src={form.coverImage} alt="Cover preview" />
                <button type="button" className="agf-cover-remove" onClick={() => setForm((f) => ({ ...f, coverImage: "" }))} title="Remove cover">
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <button type="button" className="agf-cover-drop" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
                <FiUploadCloud size={20} />
                {uploadingCover ? "Uploading…" : "Upload a cover image"}
              </button>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverPick} />
          </div>
          <input
            type="url"
            className="agf-cover-url"
            value={form.coverImage}
            onChange={set("coverImage")}
            placeholder="…or paste an image URL (https://…)"
          />
          {errors.coverImage && <p className="atf-error">{errors.coverImage}</p>}
        </div>

        <RichTextEditor
          label="Body"
          value={form.body}
          onChange={set("body")}
          preset="blog"
          placeholder="Tell the story… use the image button to add photos inline."
          minHeight="300px"
          error={errors.body}
          onImageUpload={galleryApi.uploadImage}
        />

        <div className="atf-sections">
          <div className="atf-sections-head">
            <div>
              <label>Sections (optional)</label>
              <p className="atf-sections-hint">Add ordered headed sections shown below the body on the post page.</p>
            </div>
            <button type="button" className="at-btn-secondary" onClick={addSection}>+ Add section</button>
          </div>
          {sections.map((section, index) => (
            <div key={section.id} className="atf-section-card">
              <div className="atf-section-card-head">
                <span className="atf-section-num">Section {index + 1}</span>
                <button type="button" className="atf-section-remove" onClick={() => removeSection(section.id)}>Remove</button>
              </div>
              <input
                type="text"
                className="atf-section-heading"
                placeholder="Section heading"
                value={section.heading}
                maxLength={150}
                onChange={(e) => updateSection(section.id, { heading: e.target.value })}
              />
              <RichTextEditor
                value={section.body}
                onChange={(html) => updateSection(section.id, { body: html })}
                preset="blog"
                placeholder="Section content…"
                minHeight="160px"
                onImageUpload={galleryApi.uploadImage}
              />
            </div>
          ))}
        </div>

        <div className="atf-toggles">
          <label className="atf-check">
            <input type="checkbox" checked={form.featured} onChange={set("featured")} />
            Featured (pinned to the top of the gallery)
          </label>
          <label className="atf-check">
            <input type="checkbox" checked={form.published} onChange={set("published")} />
            Published (visible to users)
          </label>
        </div>

        <div className="atf-actions">
          <Link to="/admin/gallery" className="at-btn-secondary">Cancel</Link>
          <button type="submit" className="atf-submit" disabled={saving}>
            <FiSave size={15} /> {saving ? "Saving…" : isEdit ? "Save changes" : "Create post"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminGalleryForm;
