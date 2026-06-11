import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiBookOpen, FiCheckCircle, FiEdit3, FiStar } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import tipsApi from "../../../Services/api/tipsApi";
import { useToast } from "../../../context/ToastContext";
import { capitalize } from "../../PetCareTips/tipTheme";
import "./AdminTips.css";

const AdminTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { fetchTips(); }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const response = await tipsApi.getTipsAdmin();
      setTips(response.data || []);
    } catch {
      addToast("Failed to fetch tips", "error");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: tips.length,
    published: tips.filter((t) => t.published).length,
    drafts: tips.filter((t) => !t.published).length,
    featured: tips.filter((t) => t.featured).length,
  }), [tips]);

  const toggleField = async (tip, field) => {
    try {
      await tipsApi.updateTip(tip._id, { [field]: !tip[field] });
      addToast(`Tip ${field} updated`, "success");
      fetchTips();
    } catch {
      addToast(`Failed to update ${field}`, "error");
    }
  };

  const handleDelete = (tip) => {
    setSelectedTip(tip);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTip) return;
    try {
      await tipsApi.deleteTip(selectedTip._id);
      addToast("Tip deleted successfully", "success");
      fetchTips();
      setDeleteModalOpen(false);
      setSelectedTip(null);
    } catch {
      addToast("Failed to delete tip", "error");
    }
  };

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (value) => <span className="at-title">{value}</span>,
    },
    {
      header: "Animal",
      accessor: "animalType",
      render: (value) => <span className="at-pill">{capitalize(value)}</span>,
    },
    {
      header: "Category",
      accessor: "category",
      render: (value) => <span className="at-pill">{capitalize(value)}</span>,
    },
    {
      header: "Difficulty",
      accessor: "difficulty",
      render: (value) => capitalize(value),
    },
    {
      header: "Featured",
      accessor: "featured",
      sortable: false,
      render: (value, item) => (
        <button
          className={`at-toggle ${value ? "on" : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleField(item, "featured"); }}
          title={value ? "Unfeature" : "Feature"}
        >
          <FiStar size={14} />
        </button>
      ),
    },
    {
      header: "Status",
      accessor: "published",
      render: (value, item) => (
        <button
          className={`at-status ${value ? "published" : "draft"}`}
          onClick={(e) => { e.stopPropagation(); toggleField(item, "published"); }}
          title="Click to toggle"
        >
          {value ? "Published" : "Draft"}
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
          <h1 className="admin-page-title">Pet Care Tips</h1>
          <p className="admin-page-subtitle">Manage tips, featured picks, and drafts</p>
        </div>
        <Link to="/admin/tips/new" className="add-button">
          <FiPlus />
          New Tip
        </Link>
      </div>

      {!loading && (
        <div className="at-stats">
          <div className="at-stat-card">
            <FiBookOpen size={18} />
            <div><p className="at-stat-value">{stats.total}</p><p className="at-stat-label">Total</p></div>
          </div>
          <div className="at-stat-card">
            <FiCheckCircle size={18} />
            <div><p className="at-stat-value">{stats.published}</p><p className="at-stat-label">Published</p></div>
          </div>
          <div className="at-stat-card">
            <FiEdit3 size={18} />
            <div><p className="at-stat-value">{stats.drafts}</p><p className="at-stat-label">Drafts</p></div>
          </div>
          <div className="at-stat-card">
            <FiStar size={18} />
            <div><p className="at-stat-value">{stats.featured}</p><p className="at-stat-label">Featured</p></div>
          </div>
        </div>
      )}

      <DataTable
        data={tips}
        columns={columns}
        loading={loading}
        onEdit={(tip) => navigate(`/admin/tips/edit/${tip._id}`)}
        onDelete={handleDelete}
        onView={(tip) => window.open(`/pet-care-tips/${tip.slug || tip._id}`, "_blank")}
      />

      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModalOpen(false)}
          >
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Delete tip?</h3>
              <p>&ldquo;{selectedTip?.title}&rdquo; will be permanently removed.</p>
              <div className="admin-modal-actions">
                <button className="at-btn-secondary" onClick={() => setDeleteModalOpen(false)}>
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

export default AdminTips;
