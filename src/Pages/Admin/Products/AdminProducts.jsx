import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiPackage, FiAlertCircle, FiXCircle, FiCheckCircle } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import productsApi from "../../../Services/api/productsApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminProducts.css";

const resolveQty = (p) => {
  if (p.quantity !== undefined && p.quantity !== null) return Number(p.quantity);
  if (p.stock    !== undefined && p.stock    !== null) return Number(p.stock);
  return 0;
};

const AdminProducts = () => {
  const [products, setProducts]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock,    setFilterStock]    = useState("all");
  const [filterStatus,   setFilterStatus]   = useState("all");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts({ limit: 1000 });
      const raw = response.data || [];
      const normalized = raw.map((p) => ({
        ...p,
        name: p.name || p.title || "",
        _qty: resolveQty(p),
      }));
      setProducts(normalized);
    } catch {
      addToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ──
  const stats = useMemo(() => ({
    total:      products.length,
    active:     products.filter((p) => p.isActive).length,
    lowStock:   products.filter((p) => p._qty > 0 && p._qty <= 10).length,
    outOfStock: products.filter((p) => p._qty === 0).length,
  }), [products]);

  // ── Category list for filter chips ──
  const allCategories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      const arr = Array.isArray(p.categories) ? p.categories : p.category ? [p.category] : [];
      arr.forEach((c) => cats.add(c));
    });
    return [...cats].sort();
  }, [products]);

  // ── Filtered rows ──
  const filteredProducts = useMemo(() => products.filter((p) => {
    if (filterStatus === "active"   && !p.isActive) return false;
    if (filterStatus === "inactive" &&  p.isActive) return false;
    if (filterStock  === "out" && p._qty !== 0)               return false;
    if (filterStock  === "low" && !(p._qty > 0 && p._qty <= 10)) return false;
    if (filterStock  === "in"  && p._qty <= 10)               return false;
    if (filterCategory !== "all") {
      const cats = Array.isArray(p.categories) ? p.categories : p.category ? [p.category] : [];
      if (!cats.includes(filterCategory)) return false;
    }
    return true;
  }), [products, filterStatus, filterStock, filterCategory]);

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await productsApi.deleteProduct(selectedProduct._id);
      addToast("Product deleted successfully", "success");
      fetchProducts();
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch {
      addToast("Failed to delete product", "error");
    }
  };

  const columns = [
    {
      header: "Image",
      accessor: "images",
      sortable: false,
      searchable: false,
      render: (value, item) => {
        const src =
          Array.isArray(value) && value[0]
            ? (typeof value[0] === "object" ? value[0].url : value[0])
            : item.imageUrl || "https://placehold.co/50x50";
        return (
          <div className="product-image-cell">
            <img
              src={src}
              alt={item.name}
              className="product-thumbnail"
              onError={(e) => { e.target.src = "https://placehold.co/50x50"; }}
            />
          </div>
        );
      },
    },
    {
      header: "Name",
      accessor: "name",
      render: (value, item) => (
        <span className="product-name">{value || item.title || "—"}</span>
      ),
    },
    {
      header: "Category",
      accessor: "categories",
      render: (value, item) => {
        const cats = Array.isArray(value) && value.length > 0
          ? value
          : item.category ? [item.category] : [];
        return cats.length > 0 ? (
          <div className="product-cats">
            {cats.map((c) => (
              <span key={c} className="product-category">{c}</span>
            ))}
          </div>
        ) : <span className="product-category">—</span>;
      },
    },
    {
      header: "Price",
      accessor: "price",
      render: (value) => (
        <span className="product-price">${Number(value || 0).toFixed(2)}</span>
      ),
    },
    {
      header: "Stock",
      accessor: "_qty",
      render: (value) => {
        const qty = Number(value ?? 0);
        const cls = qty > 10 ? "in-stock" : qty > 0 ? "low-stock" : "out-of-stock";
        return <span className={`stock-badge ${cls}`}>{qty}</span>;
      },
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (value) => (
        <span className={`status-badge ${value ? "active" : "inactive"}`}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (value) => value ? new Date(value).toLocaleDateString() : "—",
    },
  ];

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">Manage your product inventory and listings</p>
        </div>
        <Link to="/admin/products/new" className="add-button">
          <FiPlus />
          Add Product
        </Link>
      </div>

      {/* Stats cards */}
      {!loading && (
        <div className="ap-stats">
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-stat-icon--total"><FiPackage size={18} /></div>
            <div>
              <p className="ap-stat-value">{stats.total}</p>
              <p className="ap-stat-label">Total Products</p>
            </div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-stat-icon--active"><FiCheckCircle size={18} /></div>
            <div>
              <p className="ap-stat-value">{stats.active}</p>
              <p className="ap-stat-label">Active</p>
            </div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-stat-icon--low"><FiAlertCircle size={18} /></div>
            <div>
              <p className="ap-stat-value">{stats.lowStock}</p>
              <p className="ap-stat-label">Low Stock</p>
            </div>
          </div>
          <div className="ap-stat-card">
            <div className="ap-stat-icon ap-stat-icon--out"><FiXCircle size={18} /></div>
            <div>
              <p className="ap-stat-value">{stats.outOfStock}</p>
              <p className="ap-stat-label">Out of Stock</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="ap-filters">
        <div className="ap-filter-group">
          <span className="ap-filter-label">Status</span>
          <div className="ap-filter-chips">
            {["all", "active", "inactive"].map((s) => (
              <button
                key={s}
                type="button"
                className={`ap-filter-chip${filterStatus === s ? " ap-filter-chip--on" : ""}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="ap-filter-group">
          <span className="ap-filter-label">Stock</span>
          <div className="ap-filter-chips">
            {[
              { key: "all", label: "All" },
              { key: "in",  label: "In Stock" },
              { key: "low", label: "Low" },
              { key: "out", label: "Out" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`ap-filter-chip${filterStock === key ? " ap-filter-chip--on" : ""}`}
                onClick={() => setFilterStock(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {allCategories.length > 0 && (
          <div className="ap-filter-group">
            <span className="ap-filter-label">Category</span>
            <div className="ap-filter-chips">
              <button
                type="button"
                className={`ap-filter-chip${filterCategory === "all" ? " ap-filter-chip--on" : ""}`}
                onClick={() => setFilterCategory("all")}
              >
                All
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`ap-filter-chip${filterCategory === cat ? " ap-filter-chip--on" : ""}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="admin-card">
        <DataTable
          data={filteredProducts}
          columns={columns}
          loading={loading}
          onEdit={(product) => navigate(`/admin/products/edit/${product._id}`)}
          onDelete={handleDelete}
          onView={(product) => window.open(`/product/${product._id}`, "_blank")}
        />
      </div>

      {/* Delete Confirmation Modal */}
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
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="admin-modal-title">Delete Product</h3>
              <p className="admin-modal-msg">
                Are you sure you want to delete &ldquo;{selectedProduct?.name || selectedProduct?.title}&rdquo;? This action cannot be undone.
              </p>
              <div className="admin-modal-actions">
                <button className="admin-modal-btn cancel" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                <button className="admin-modal-btn confirm" onClick={confirmDelete}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminProducts;
