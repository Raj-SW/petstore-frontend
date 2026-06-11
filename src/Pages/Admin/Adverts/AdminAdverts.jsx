import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSave } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import advertsApi from "../../../Services/api/advertsApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminAdverts.css";

const EMPTY_FORM = { title: "", image: "", link: "", placement: "banner", active: true };

const AdminAdverts = () => {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // advert being edited, or null = create
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
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
      link: advert.link,
      placement: advert.placement,
      active: advert.active,
    });
    setModalOpen(true);
  };

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 2 || !form.link.trim()) {
      addToast("Title and link are required", "error");
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

  const handleDelete = async (advert) => {
    if (!window.confirm(`Delete advert "${advert.title}"?`)) return;
    try {
      await advertsApi.deleteAdvert(advert._id);
      addToast("Advert deleted", "success");
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
          {value === "banner" ? "Banner" : "Sponsored card"}
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
                <label htmlFor="aa-image">Image URL (optional)</label>
                <input id="aa-image" type="url" value={form.image} onChange={set("image")} placeholder="https://…" />
              </div>
              <div className="aa-field">
                <label htmlFor="aa-link">Link</label>
                <input id="aa-link" type="text" value={form.link} onChange={set("link")} placeholder="https://… or /petshop" />
              </div>
              <div className="aa-field">
                <label htmlFor="aa-placement">Placement</label>
                <select id="aa-placement" value={form.placement} onChange={set("placement")}>
                  <option value="banner">Banner (between sections)</option>
                  <option value="sponsored">Sponsored card (in grid)</option>
                </select>
              </div>
              <label className="aa-check">
                <input type="checkbox" checked={form.active} onChange={set("active")} />
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
    </motion.div>
  );
};

export default AdminAdverts;
