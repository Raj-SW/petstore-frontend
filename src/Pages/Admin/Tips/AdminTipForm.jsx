import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { RichTextEditor } from "../../../Components/RichText";
import tipsApi from "../../../Services/api/tipsApi";
import { useToast } from "../../../context/ToastContext";
import { ANIMAL_TYPES, CATEGORIES, DIFFICULTIES, capitalize } from "../../PetCareTips/tipTheme";
import "./AdminTipForm.css";

const EMPTY_FORM = {
  title: "",
  coverImage: "",
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
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await tipsApi.getTipAdmin(id);
        const t = res.data;
        setForm({
          title: t.title || "",
          coverImage: t.coverImage || "",
          body: t.body || "",
          animalType: t.animalType || "dog",
          category: t.category || "nutrition",
          breed: t.breed || "",
          difficulty: t.difficulty || "beginner",
          featured: Boolean(t.featured),
          published: Boolean(t.published),
        });
      } catch {
        addToast("Failed to load tip", "error");
        navigate("/admin/tips");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, addToast, navigate]);

  const set = (field) => (e) => {
    const value = e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    if (form.title.trim().length < 2) errs.title = "Title must be at least 2 characters";
    if (!form.body || form.body === "<p></p>") errs.body = "Tip body is required";
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
      const payload = { ...form, breed: form.breed.trim() };
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
          <label htmlFor="atf-cover">Cover image URL (optional)</label>
          <input id="atf-cover" type="url" value={form.coverImage} onChange={set("coverImage")} placeholder="https://…" />
          {errors.coverImage && <p className="atf-error">{errors.coverImage}</p>}
        </div>

        <div className="atf-row">
          <div className="atf-field">
            <label htmlFor="atf-animal">Animal</label>
            <select id="atf-animal" value={form.animalType} onChange={set("animalType")}>
              {ANIMAL_TYPES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
          <div className="atf-field">
            <label htmlFor="atf-category">Category</label>
            <select id="atf-category" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{capitalize(c)}</option>
              ))}
            </select>
          </div>
          <div className="atf-field">
            <label htmlFor="atf-difficulty">Difficulty</label>
            <select id="atf-difficulty" value={form.difficulty} onChange={set("difficulty")}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{capitalize(d)}</option>
              ))}
            </select>
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

        <div className="atf-toggles">
          <label className="atf-check">
            <input type="checkbox" checked={form.featured} onChange={set("featured")} />
            Featured (shows in the featured section)
          </label>
          <label className="atf-check">
            <input type="checkbox" checked={form.published} onChange={set("published")} />
            Published (visible to users)
          </label>
        </div>

        <div className="atf-actions">
          <Link to="/admin/tips" className="at-btn-secondary">Cancel</Link>
          <button type="submit" className="atf-submit" disabled={saving}>
            <FiSave size={15} /> {saving ? "Saving…" : isEdit ? "Save changes" : "Create tip"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminTipForm;
