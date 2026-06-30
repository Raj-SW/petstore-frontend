import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { motion } from "framer-motion";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { RichTextEditor } from "../../../Components/RichText";
import ImageManager from "../../../Components/Admin/ImageManager/ImageManager";
import tipsApi from "../../../Services/api/tipsApi";
import { useToast } from "../../../context/ToastContext";
import { ANIMAL_TYPES, CATEGORIES, DIFFICULTIES, capitalize } from "../../PetCareTips/tipTheme";
import { coverUrl } from "../../../utils/coverImage";
import "./AdminTipForm.css";

const normalizeImage = (img) =>
  typeof img === "object"
    ? { url: img.url, publicId: img.publicId || "" }
    : { url: img, publicId: "" };
const normalizeSectionImages = (images) =>
  Array.isArray(images) ? images.map(normalizeImage).filter((x) => x.url && x.publicId) : [];

const EMPTY_FORM = {
  title: "",
  body: "",
  animalType: "dog",
  category: "nutrition",
  breed: "",
  difficulty: "beginner",
  featured: false,
  published: false,
};

const AdminTipForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [cover, setCover] = useState([]); // [{ url, publicId }] (0 or 1)
  const [sections, setSections] = useState([]); // [{ id, heading, body, images }]
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const addSection = () =>
    setSections((prev) => [...prev, { id: `sec-${Date.now()}`, heading: "", body: "", images: [] }]);
  const removeSection = (sid) =>
    setSections((prev) => prev.filter((s) => s.id !== sid));
  const updateSection = (sid, changes) =>
    setSections((prev) => prev.map((s) => (s.id === sid ? { ...s, ...changes } : s)));

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await tipsApi.getTipAdmin(id);
        const t = res.data;
        setForm({
          title: t.title || "",
          body: t.body || "",
          animalType: t.animalType || "dog",
          category: t.category || "nutrition",
          breed: t.breed || "",
          difficulty: t.difficulty || "beginner",
          featured: Boolean(t.featured),
          published: Boolean(t.published),
        });
        const cu = coverUrl(t.coverImage);
        setCover(cu ? [{ url: cu, publicId: t.coverImage?.publicId || "" }] : []);
        setSections(
          Array.isArray(t.sections)
            ? t.sections.map((s, i) => ({
                id: `sec-${Date.now()}-${i}`,
                heading: s.heading || "",
                body: s.body || "",
                images: normalizeSectionImages(s.images),
              }))
            : []
        );
      } catch {
        addToast("Failed to load tip", "error");
        navigate("/admin/tips");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, addToast, navigate]);

  const set = (field) => (e) => {
    let value;
    if (!e?.target) {
      value = e;
    } else if (e.target.type === "checkbox") {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    if (form.title.trim().length < 2) errs.title = "Title must be at least 2 characters";
    if (!form.body || form.body === "<p></p>") errs.body = "Tip body is required";
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
        breed: form.breed.trim(),
        coverImage: cover[0] ? { url: cover[0].url, publicId: cover[0].publicId } : { url: "", publicId: "" },
        sections: sections
          .filter((s) => s.heading?.trim() || (s.body && s.body !== "<p></p>") || s.images?.length)
          .map(({ heading, body, images }, order) => ({
            heading: heading?.trim() ?? "",
            body: body || "",
            order,
            images: images?.map((img) => ({ url: img.url, publicId: img.publicId })) ?? [],
          })),
      };
      if (isEdit) {
        await tipsApi.updateTip(id, payload);
        addToast("Tip updated", "success");
      } else {
        await tipsApi.createTip(payload);
        addToast("Tip created", "success");
      }
      navigate("/admin/tips");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to save tip", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-page"><p>Loading…</p></div>;

  let saveBtnLabel;
  if (saving) {
    saveBtnLabel = "Saving…";
  } else if (isEdit) {
    saveBtnLabel = "Save changes";
  } else {
    saveBtnLabel = "Create tip";
  }

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <Link to="/admin/tips" className="atf-back">
            <FiArrowLeft size={14} /> Back to tips
          </Link>
          <h1 className="admin-page-title">{isEdit ? "Edit Tip" : "New Tip"}</h1>
        </div>
      </div>

      <form className="atf-form" onSubmit={handleSubmit}>
        <div className="atf-field">
          <label htmlFor="atf-title">Title</label>
          <input id="atf-title" type="text" value={form.title} onChange={set("title")} maxLength={150} />
          {errors.title && <p className="atf-error">{errors.title}</p>}
        </div>

        <div className="atf-field">
          <p className="atf-field-desc">Cover image (optional)</p>
          <ImageManager
            value={cover}
            onChange={setCover}
            uploadUrl="/tips/upload-image"
            max={1}
            onError={(msg) => addToast(msg, "error")}
          />
        </div>

        <div className="atf-row">
          <div className="atf-field">
            <p className="atf-field-desc">Animal</p>
            <Select value={form.animalType} onValueChange={set("animalType")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ANIMAL_TYPES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="atf-field">
            <p className="atf-field-desc">Category</p>
            <Select value={form.category} onValueChange={set("category")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{capitalize(c)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="atf-field">
            <p className="atf-field-desc">Difficulty</p>
            <Select value={form.difficulty} onValueChange={set("difficulty")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d} value={d}>{capitalize(d)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="atf-field">
            <label htmlFor="atf-breed">Breed (optional)</label>
            <input id="atf-breed" type="text" value={form.breed} onChange={set("breed")} maxLength={80} placeholder="e.g. Golden Retriever" />
          </div>
        </div>

        <RichTextEditor
          label="Tip body"
          value={form.body}
          onChange={set("body")}
          preset="standard"
          placeholder="Write the tip content…"
          minHeight="260px"
          error={errors.body}
        />

        <div className="atf-sections">
          <div className="atf-sections-head">
            <div>
              <p className="atf-field-desc">Sections (optional)</p>
              <p className="atf-sections-hint">Add ordered headed sections shown below the body on the tip page.</p>
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
                preset="standard"
                placeholder="Section content…"
                minHeight="160px"
              />
              <div className="atf-section-images">
                <p className="atf-section-images-label">Section images (optional, up to 8 — first is the lead)</p>
                <ImageManager
                  value={section.images || []}
                  onChange={(imgs) => updateSection(section.id, { images: imgs })}
                  uploadUrl="/tips/upload-image"
                  max={8}
                  onError={(msg) => addToast(msg, "error")}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="atf-toggles">
          <label className="atf-check">
            <input type="checkbox" checked={form.featured} onChange={set("featured")} />{" "}
            Featured (shows in the featured section)
          </label>
          <label className="atf-check">
            <input type="checkbox" checked={form.published} onChange={set("published")} />{" "}
            Published (visible to users)
          </label>
        </div>

        <div className="atf-actions">
          <Link to="/admin/tips" className="at-btn-secondary">Cancel</Link>
          <button type="submit" className="atf-submit" disabled={saving}>
            <FiSave size={15} /> {saveBtnLabel}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminTipForm;
