import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { FiPlus, FiSave, FiUploadCloud } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import advertsApi from "../../../Services/api/advertsApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminAdverts.css";

const EMPTY_FORM = { title: "", image: "", link: "", placement: "banner", order: 0, active: true };

const AdminAdverts = () => {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // advert being edited, or null = create
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const imageInputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => { fetchAdverts(); }, []);

  const fetchAdverts = async () => {
    try {
      setLoading(true);
      const response = await advertsApi.getAdvertsAdmin();
      setAdverts(response.data || []);
    } catch {
      addToast("Failed to fetch adverts", "error");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (advert) => {
    setEditing(advert);
    setForm({
      title: advert.title,
      image: advert.image || "",
      link: advert.link || "",
      placement: advert.placement,
      order: advert.order ?? 0,
      active: advert.active,
    });
    setModalOpen(true);
  };

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB — matches server limit

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      addToast("Image is too large. Please use an image under 15 MB.", "error");
      return;
    }
    setUploadingImage(true);
    try {
      const url = await advertsApi.uploadImage(file);
      if (url) setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      addToast(err?.message || "Image upload failed.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Link is required for banner/sponsored, optional for hero carousel slides.
    const linkOptional = form.placement === "hero" || form.placement === "promo" || form.placement === "shop";
    if (form.title.trim().length < 2 || (!linkOptional && !form.link.trim())) {
      addToast("Title is required (and a link for banner/sponsored adverts)", "error");
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await advertsApi.updateAdvert(editing._id, form);
        addToast("Advert updated", "success");
      } else {
        await advertsApi.createAdvert(form);
        addToast("Advert created", "success");
      }
      setModalOpen(false);
      fetchAdverts();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to save advert", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (advert) => {
    try {
      await advertsApi.updateAdvert(advert._id, { active: !advert.active });
      addToast("Advert updated", "success");
      fetchAdverts();
    } catch {
      addToast("Failed to update advert", "error");
    }
  };

  const handleDelete = (advert) => {
    setDeleteTarget(advert);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await advertsApi.deleteAdvert(deleteTarget._id);
      addToast("Advert deleted", "success");
      setDeleteTarget(null);
      fetchAdverts();
    } catch {
      addToast("Failed to delete advert", "error");
    }
  };

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (value) => <span className="aa-title">{value}</span>,
    },
    {
      header: "Placement",
      accessor: "placement",
      render: (value) => (
        <span className={`aa-placement ${value}`}>
          {{ banner: "Banner", sponsored: "Sponsored card", hero: "Homepage hero", promo: "Homepage promo", shop: "Pet Shop banner" }[value] || value}
        </span>
      ),
    },
    {
      header: "Link",
      accessor: "link",
      sortable: false,
      render: (value) => <span className="aa-link">{value}</span>,
    },
    {
      header: "Active",
      accessor: "active",
      render: (value, item) => (
        <button
          className={`aa-status ${value ? "on" : "off"}`}
          onClick={(e) => { e.stopPropagation(); toggleActive(item); }}
          title="Click to toggle"
        >
          {value ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
  ];

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Adverts</h1>
          <p className="admin-page-subtitle">Banner and sponsored placements on the tips page</p>
        </div>
        <button className="add-button" onClick={openCreate}>
          <FiPlus />
          New Advert
        </button>
      </div>

      <DataTable
        data={adverts}
        columns={columns}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.form
              className="admin-modal aa-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSave}
            >
              <h3>{editing ? "Edit advert" : "New advert"}</h3>

              <div className="aa-field">
                <label htmlFor="aa-title">Title</label>
                <input id="aa-title" type="text" value={form.title} onChange={set("title")} maxLength={120} />
              </div>
              <div className="aa-field">
                <label htmlFor="aa-placement">Placement</label>
                <Select
                  value={form.placement}
                  onValueChange={(v) => setForm((f) => ({ ...f, placement: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner (between sections)</SelectItem>
                    <SelectItem value="sponsored">Sponsored card (in grid)</SelectItem>
                    <SelectItem value="hero">Homepage carousel (hero banner)</SelectItem>
                    <SelectItem value="promo">Homepage engagement promo</SelectItem>
                    <SelectItem value="shop">Pet Shop page banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="aa-field">
                <label>Image{["hero", "promo", "shop"].includes(form.placement) ? "" : " (optional)"}</label>
                {form.image && (
                  <img src={form.image} alt="Advert preview" className="aa-image-preview" loading="lazy" />
                )}
                <div className="aa-image-upload">
                  <button
                    type="button"
                    className="aa-upload-btn"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <FiUploadCloud size={15} /> {uploadingImage ? "Uploading…" : "Upload image"}
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImagePick}
                  />
                </div>
                <input
                  id="aa-image"
                  type="url"
                  value={form.image}
                  onChange={set("image")}
                  placeholder="…or paste an image URL (https://…)"
                />
                {form.placement === "hero" && (
                  <p className="aa-hint">Recommended ~1920 × 680 px (wide banner). Keep key content centered.</p>
                )}
                {form.placement === "promo" && (
                  <p className="aa-hint">Shown beside the homepage Ask-a-Question / Feedback forms. Recommended ~720 × 900 px (portrait card).</p>
                )}
                {form.placement === "shop" && (
                  <p className="aa-hint">Shown at the top of the Pet Shop page. Recommended ~1600 × 500 px (wide banner). Keep key content left-aligned.</p>
                )}
              </div>
              <div className="aa-field">
                <label htmlFor="aa-link">
                  Link{form.placement === "hero" || form.placement === "promo" ? " (optional)" : ""}
                </label>
                <input id="aa-link" type="text" value={form.link} onChange={set("link")} placeholder="https://… or /petshop" />
              </div>
              <div className="aa-field">
                <label htmlFor="aa-order">Order (lower shows first)</label>
                <input id="aa-order" type="number" min="0" value={form.order} onChange={set("order")} />
              </div>
              <label className="aa-check">
                <input type="checkbox" checked={form.active} onChange={set("active")} />{" "}
                Active
              </label>

              <div className="admin-modal-actions">
                <button type="button" className="at-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="aa-submit" disabled={saving}>
                  <FiSave size={14} /> {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Delete advert?</h3>
              <p>&ldquo;{deleteTarget.title}&rdquo; will be permanently removed.</p>
              <div className="admin-modal-actions">
                <button className="at-btn-secondary" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button className="at-btn-danger" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminAdverts;
