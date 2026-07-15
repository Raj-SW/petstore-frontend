import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiStar,
} from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import ImageManager from "../../../Components/Admin/ImageManager/ImageManager";
import feedbackApi from "../../../Services/api/feedbackApi";
import { useToast } from "../../../context/ToastContext";
import "../Tips/AdminTips.css";
import "./AdminFeedback.css";

// Normalise a photo entry to a { url, publicId } ref (legacy entries were strings)
const toPhotoRef = (p) =>
  typeof p === "object" ? { url: p.url, publicId: p.publicId || "" } : { url: p, publicId: "" };

/** Render n filled/empty stars */
const Stars = ({ rating, max = 5 }) => (
  <span className="af-stars" aria-label={`${rating} out of ${max} stars`}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} className={i < rating ? "af-star-filled" : "af-star-empty"}>
        ★
      </span>
    ))}
  </span>
);

const AdminFeedback = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // View modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewed, setViewed] = useState(null);
  const [editPhotos, setEditPhotos] = useState([]);
  const [savingPhotos, setSavingPhotos] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await feedbackApi.getFeedbackAdmin();
      setItems(res.data || []);
    } catch {
      addToast("Failed to fetch feedback", "error");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: items.length,
      approved: items.filter((f) => f.approved).length,
      pending: items.filter((f) => !f.approved).length,
    }),
    [items]
  );

  const toggleApproved = async (item) => {
    try {
      await feedbackApi.updateFeedback(item._id, { approved: !item.approved });
      addToast(
        item.approved ? "Feedback unapproved" : "Feedback approved",
        "success"
      );
      fetchFeedback();
    } catch {
      addToast("Failed to update feedback", "error");
    }
  };

  const handleDelete = (item) => {
    setSelected(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await feedbackApi.deleteFeedback(selected._id);
      addToast("Feedback deleted", "success");
      fetchFeedback();
      setDeleteModalOpen(false);
      setSelected(null);
    } catch {
      addToast("Failed to delete feedback", "error");
    }
  };

  const handleView = (item) => {
    setViewed(item);
    setEditPhotos(Array.isArray(item.photos) ? item.photos.map(toPhotoRef).filter((p) => p.url) : []);
    setViewModalOpen(true);
  };

  const savePhotos = async () => {
    if (!viewed) return;
    try {
      setSavingPhotos(true);
      await feedbackApi.updateFeedback(viewed._id, {
        photos: editPhotos.map((p) => ({ url: p.url, publicId: p.publicId })),
      });
      addToast("Photos updated", "success");
      setViewModalOpen(false);
      fetchFeedback();
    } catch {
      addToast("Failed to update photos", "error");
    } finally {
      setSavingPhotos(false);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (value, item) => (
        <div>
          <span className="at-title">{value}</span>
          {item.role && (
            <span className="af-role-sub">{item.role}</span>
          )}
        </div>
      ),
    },
    {
      header: "Rating",
      accessor: "rating",
      render: (value) => <Stars rating={value} />,
    },
    {
      header: "Message",
      accessor: "message",
      render: (value) => (
        <span className="af-message-snippet">
          {value?.length > 80 ? value.slice(0, 80) + "…" : value}
        </span>
      ),
    },
    {
      header: "Photos",
      accessor: "photos",
      sortable: false,
      render: (value) => (
        <span className="at-pill">{Array.isArray(value) ? value.length : 0}</span>
      ),
    },
    {
      header: "Approved",
      accessor: "approved",
      sortable: false,
      render: (value, item) => (
        <button
          className={`at-status ${value ? "published" : "draft"}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleApproved(item);
          }}
          title={value ? "Click to unapprove" : "Click to approve"}
        >
          {value ? "Approved" : "Pending"}
        </button>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : "—",
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
          <h1 className="admin-page-title">Feedback</h1>
          <p className="admin-page-subtitle">
            Moderate customer feedback — approve to show in &ldquo;What Our Clients Say&rdquo;
          </p>
        </div>
      </div>

      {/* Stats strip */}
      {!loading && (
        <div className="at-stats">
          <div className="at-stat-card">
            <FiMessageSquare size={18} />
            <div>
              <p className="at-stat-value">{stats.total}</p>
              <p className="at-stat-label">Total</p>
            </div>
          </div>
          <div className="at-stat-card">
            <FiClock size={18} />
            <div>
              <p className="at-stat-value">{stats.pending}</p>
              <p className="at-stat-label">Pending</p>
            </div>
          </div>
          <div className="at-stat-card">
            <FiCheckCircle size={18} />
            <div>
              <p className="at-stat-value">{stats.approved}</p>
              <p className="at-stat-label">Approved</p>
            </div>
          </div>
          <div className="at-stat-card">
            <FiStar size={18} />
            <div>
              <p className="at-stat-value">
                {items.length
                  ? (
                      items.reduce((s, f) => s + (f.rating || 0), 0) /
                      items.length
                    ).toFixed(1)
                  : "—"}
              </p>
              <p className="at-stat-label">Avg Rating</p>
            </div>
          </div>
        </div>
      )}

      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* ── View modal ── */}
      <AnimatePresence>
        {viewModalOpen && viewed && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewModalOpen(false)}
          >
            <motion.div
              className="admin-modal af-view-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="af-view-header">
                <div>
                  <h3 className="af-view-name">{viewed.name}</h3>
                  {viewed.role && (
                    <p className="af-view-role">{viewed.role}</p>
                  )}
                </div>
                <Stars rating={viewed.rating} />
              </div>
              <p className="af-view-message">{viewed.message}</p>

              <div className="af-view-photos-editor">
                <span className="admin-label">Photos — drag to reorder, delete, or add</span>
                <ImageManager
                  value={editPhotos}
                  onChange={setEditPhotos}
                  uploadUrl="/feedback/upload-image"
                  max={3}
                  onError={(msg) => addToast(msg, "error")}
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  className="at-btn-secondary"
                  onClick={() => setViewModalOpen(false)}
                  disabled={savingPhotos}
                >
                  Close
                </button>
                <button
                  className="at-btn-primary"
                  onClick={savePhotos}
                  disabled={savingPhotos}
                >
                  {savingPhotos ? "Saving…" : "Save Photos"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete modal ── */}
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
              <h3>Delete feedback?</h3>
              <p>
                Feedback from &ldquo;{selected?.name}&rdquo; will be permanently removed.
              </p>
              <div className="admin-modal-actions">
                <button
                  className="at-btn-secondary"
                  onClick={() => setDeleteModalOpen(false)}
                >
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

export default AdminFeedback;
