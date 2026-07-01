import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus, FiPackage, FiAlertCircle, FiXCircle, FiCheckCircle,
  FiCheck, FiSlash, FiStar, FiTag, FiTrash2, FiX,
} from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import productsApi from "../../../Services/api/productsApi";
import subscriptionsApi from "../../../Services/api/subscriptionsApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminProducts.css";

const resolveQty = (p) => {
  if (p.quantity !== undefined && p.quantity !== null) return Number(p.quantity);
  if (p.stock    !== undefined && p.stock    !== null) return Number(p.stock);
  return 0;
};

const getProductCategories = (p) => {
  if (Array.isArray(p.categories)) return p.categories;
  if (p.category) return [p.category];
  return [];
};

const matchesStockFilter = (filterStock, qty) => {
  if (filterStock === "out") return qty === 0;
  if (filterStock === "low") return qty > 0 && qty <= 10;
  if (filterStock === "in")  return qty > 10;
  return true;
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

  // ── Bulk actions ──
  const [selectedIds,    setSelectedIds]    = useState([]);
  const [bulkBusy,       setBulkBusy]       = useState(false);
  const [saleModalOpen,  setSaleModalOpen]  = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [saleForm,       setSaleForm]       = useState({
    discountType: "percent", discountValue: "", saleStartsAt: "", saleEndsAt: "",
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Coverage is best-effort (admin-only); don't fail the list if it errors.
      const [response, coverage] = await Promise.all([
        productsApi.getProducts({ limit: 1000, isActive: 'all' }),
        subscriptionsApi.getProductCoverage().catch(() => ({})),
      ]);
      const raw = response.data || [];
      const normalized = raw.map((p) => ({
        ...p,
        name: p.name || p.title || "",
        _qty: resolveQty(p),
        _subscribedCount: coverage?.[p._id]?.activeSubs || 0,
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
    products.forEach((p) => getProductCategories(p).forEach((c) => cats.add(c)));
    return [...cats].sort((a, b) => a.localeCompare(b));
  }, [products]);

  // ── Filtered rows ──
  const filteredProducts = useMemo(() => products.filter((p) => {
    if (filterStatus === "active"   && !p.isActive) return false;
    if (filterStatus === "inactive" &&  p.isActive) return false;
    if (!matchesStockFilter(filterStock, p._qty)) return false;
    if (filterCategory !== "all" && !getProductCategories(p).includes(filterCategory)) return false;
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

  // ── Bulk action runner ──
  const runBulk = async (action, options) => {
    if (selectedIds.length === 0 || bulkBusy) return;
    try {
      setBulkBusy(true);
      const res = await productsApi.bulkAction(action, selectedIds, options);
      const d = res?.data || {};
      const summary = action === "delete"
        ? `Deleted ${d.deleted ?? selectedIds.length} product(s)`
        : `Updated ${d.modified ?? 0} of ${d.matched ?? selectedIds.length} product(s)`;
      addToast(summary, "success");
      setSelectedIds([]);
      await fetchProducts();
    } catch (e) {
      addToast(e?.message || "Bulk action failed", "error");
    } finally {
      setBulkBusy(false);
      setSaleModalOpen(false);
      setBulkDeleteOpen(false);
    }
  };

  const submitBulkSale = () => {
    const value = Number(saleForm.discountValue);
    if (value <= 0) {
      addToast("Enter a discount value greater than 0", "error");
      return;
    }
    if (saleForm.discountType === "percent" && value > 100) {
      addToast("Percent discount cannot exceed 100", "error");
      return;
    }
    if (saleForm.saleStartsAt && saleForm.saleEndsAt &&
        new Date(saleForm.saleEndsAt) < new Date(saleForm.saleStartsAt)) {
      addToast("Sale end must be after the start date", "error");
      return;
    }
    runBulk("sale", {
      discountType: saleForm.discountType,
      discountValue: value,
      saleStartsAt: saleForm.saleStartsAt || null,
      saleEndsAt: saleForm.saleEndsAt || null,
    });
  };

  const columns = [
    {
      header: "Image",
      accessor: "images",
      sortable: false,
      searchable: false,
      render: (value, item) => {
        let src;
        if (Array.isArray(value) && value[0]) {
          src = typeof value[0] === "object" ? value[0].url : value[0];
        } else {
          src = item.imageUrl || "https://placehold.co/50x50";
        }
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
        let cats;
        if (Array.isArray(value) && value.length > 0) {
          cats = value;
        } else if (item.category) {
          cats = [item.category];
        } else {
          cats = [];
        }
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
      render: (value, item) =>
        item.isOnSaleNow ? (
          <span>
            <span style={{ color: "#c0392b", fontWeight: 700 }}>
              Rs {Math.round(Number(item.effectivePrice || 0)).toLocaleString('en-US')}
            </span>{" "}
            <span style={{ textDecoration: "line-through", color: "#999", fontSize: "0.85em" }}>
              Rs {Math.round(Number(value || 0)).toLocaleString('en-US')}
            </span>{" "}
            <span style={{ background: "#c0392b", color: "#fff", fontSize: "0.7em", padding: "1px 6px", borderRadius: 5 }}>
              -{item.discountPercentLabel}%
            </span>
          </span>
        ) : (
          <span className="product-price">Rs {Math.round(Number(value || 0)).toLocaleString('en-US')}</span>
        ),
    },
    {
      header: "Stock",
      accessor: "_qty",
      render: (value) => {
        const qty = Number(value ?? 0);
        let cls;
        if (qty > 10) {
          cls = "in-stock";
        } else if (qty > 0) {
          cls = "low-stock";
        } else {
          cls = "out-of-stock";
        }
        return <span className={`stock-badge ${cls}`}>{qty}</span>;
      },
    },
    {
      header: "Subscribed",
      accessor: "_subscribedCount",
      sortable: false,
      render: (value) => (
        Number(value) > 0
          ? <span className="status-badge active" title={`${value} active subscription(s)`}>🔁 {value}</span>
          : <span className="stock-badge out-of-stock" style={{ opacity: 0.4 }}>—</span>
      ),
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

      {/* Bulk action toolbar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            className="ap-bulk-bar"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <span className="ap-bulk-count">{selectedIds.length} selected</span>
            <div className="ap-bulk-actions">
              <button type="button" className="ap-bulk-btn" disabled={bulkBusy} onClick={() => runBulk("activate")}><FiCheck /> Activate</button>
              <button type="button" className="ap-bulk-btn" disabled={bulkBusy} onClick={() => runBulk("deactivate")}><FiSlash /> Deactivate</button>
              <button type="button" className="ap-bulk-btn" disabled={bulkBusy} onClick={() => runBulk("feature")}><FiStar /> Feature</button>
              <button type="button" className="ap-bulk-btn" disabled={bulkBusy} onClick={() => runBulk("unfeature")}><FiStar /> Unfeature</button>
              <button type="button" className="ap-bulk-btn" disabled={bulkBusy} onClick={() => setSaleModalOpen(true)}><FiTag /> Put on Sale</button>
              <button type="button" className="ap-bulk-btn" disabled={bulkBusy} onClick={() => runBulk("clearSale")}><FiTag /> Clear Sale</button>
              <button type="button" className="ap-bulk-btn ap-bulk-btn--danger" disabled={bulkBusy} onClick={() => setBulkDeleteOpen(true)}><FiTrash2 /> Delete</button>
            </div>
            <button type="button" className="ap-bulk-clear" onClick={() => setSelectedIds([])} aria-label="Clear selection"><FiX /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="admin-card">
        <DataTable
          data={filteredProducts}
          columns={columns}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
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

      {/* Bulk Sale Modal */}
      <AnimatePresence>
        {saleModalOpen && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !bulkBusy && setSaleModalOpen(false)}
          >
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="admin-modal-title">Put {selectedIds.length} product(s) on sale</h3>
              <div className="ap-sale-fields">
                <div className="ap-sale-field">
                  <span>Discount type</span>
                  <Select
                    value={saleForm.discountType}
                    onValueChange={(v) => setSaleForm((f) => ({ ...f, discountType: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percent (%)</SelectItem>
                      <SelectItem value="amount">Amount (Rs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="ap-sale-field">
                  <span>Discount value</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={saleForm.discountValue}
                    onChange={(e) => setSaleForm((f) => ({ ...f, discountValue: e.target.value }))}
                    placeholder={saleForm.discountType === "percent" ? "e.g. 20" : "e.g. 150"}
                  />
                </label>
                <label className="ap-sale-field">
                  <span>Starts at (optional)</span>
                  <input
                    type="date"
                    value={saleForm.saleStartsAt}
                    onChange={(e) => setSaleForm((f) => ({ ...f, saleStartsAt: e.target.value }))}
                  />
                </label>
                <label className="ap-sale-field">
                  <span>Ends at (optional)</span>
                  <input
                    type="date"
                    value={saleForm.saleEndsAt}
                    onChange={(e) => setSaleForm((f) => ({ ...f, saleEndsAt: e.target.value }))}
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button className="admin-modal-btn cancel" disabled={bulkBusy} onClick={() => setSaleModalOpen(false)}>Cancel</button>
                <button className="admin-modal-btn confirm ap-confirm-gold" disabled={bulkBusy} onClick={submitBulkSale}>
                  {bulkBusy ? "Applying…" : "Apply sale"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Modal */}
      <AnimatePresence>
        {bulkDeleteOpen && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !bulkBusy && setBulkDeleteOpen(false)}
          >
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="admin-modal-title">Delete {selectedIds.length} product(s)</h3>
              <p className="admin-modal-msg">
                Are you sure you want to delete {selectedIds.length} selected product(s)? This action cannot be undone.
              </p>
              <div className="admin-modal-actions">
                <button className="admin-modal-btn cancel" disabled={bulkBusy} onClick={() => setBulkDeleteOpen(false)}>Cancel</button>
                <button className="admin-modal-btn confirm" disabled={bulkBusy} onClick={() => runBulk("delete")}>
                  {bulkBusy ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminProducts;
