import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiImage, FiCheckCircle, FiEdit3, FiStar } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import galleryApi from "../../../Services/api/galleryApi";
import { useToast } from "../../../context/ToastContext";
import { getCategoryTheme, formatEventDate } from "../../Gallery/galleryTheme";
import "../Tips/AdminTips.css";

const AdminGallery = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await galleryApi.getPostsAdmin();
      setPosts(response.data || []);
    } catch {
      addToast("Failed to fetch gallery posts", "error");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((p) => p.published).length,
    drafts: posts.filter((p) => !p.published).length,
    featured: posts.filter((p) => p.featured).length,
  }), [posts]);

  const toggleField = async (post, field) => {
    try {
      await galleryApi.updatePost(post._id, { [field]: !post[field] });
      addToast(`Post ${field} updated`, "success");
      fetchPosts();
    } catch {
      addToast(`Failed to update ${field}`, "error");
    }
  };

  const handleDelete = (post) => {
    setSelected(post);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await galleryApi.deletePost(selected._id);
      addToast("Post deleted successfully", "success");
      fetchPosts();
      setDeleteModalOpen(false);
      setSelected(null);
    } catch {
      addToast("Failed to delete post", "error");
    }
  };

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (value) => <span className="at-title">{value}</span>,
    },
    {
      header: "Category",
      accessor: "category",
      render: (value) => <span className="at-pill">{getCategoryTheme(value).label}</span>,
    },
    {
      header: "Event date",
      accessor: "eventDate",
      render: (value) => (value ? formatEventDate(value) : "—"),
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
          <h1 className="admin-page-title">Gallery</h1>
          <p className="admin-page-subtitle">Manage gallery posts, featured picks, and drafts</p>
        </div>
        <Link to="/admin/gallery/new" className="add-button">
          <FiPlus />
          New Post
        </Link>
      </div>

      {!loading && (
        <div className="at-stats">
          <div className="at-stat-card">
            <FiImage size={18} />
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
        data={posts}
        columns={columns}
        loading={loading}
        onEdit={(post) => navigate(`/admin/gallery/edit/${post._id}`)}
        onDelete={handleDelete}
        onView={(post) => window.open(`/gallery/${post.slug || post._id}`, "_blank")}
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
              <h3>Delete post?</h3>
              <p>&ldquo;{selected?.title}&rdquo; will be permanently removed.</p>
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

export default AdminGallery;
