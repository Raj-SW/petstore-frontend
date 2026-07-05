import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  FiBox, FiAlertTriangle, FiXCircle, FiDollarSign,
  FiRefreshCw, FiPlus, FiEdit3, FiClock, FiX,
} from "react-icons/fi";
import inventoryApi from "../../../Services/api/inventoryApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminInventory.css";

// ── Constants ──────────────────────────────────────────────────────

const STATUS_OPTS = [
  { value: "all", label: "All Stock" },
  { value: "in",  label: "In Stock" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
];

const BADGE = {
  in:  { cls: "inv-badge--in",  label: "In Stock" },
  low: { cls: "inv-badge--low", label: "Low Stock" },
  out: { cls: "inv-badge--out", label: "Out of Stock" },
};

const MOVEMENT_TYPE_COLORS = {
  order:        "inv-movement-badge--order",
  cancellation: "inv-movement-badge--cancellation",
  restock:      "inv-movement-badge--restock",
  adjustment:   "inv-movement-badge--adjustment",
};

const EMPTY_RESTOCK  = { open: false, product: null, units: "",  note: "" };
const EMPTY_ADJUST   = { open: false, product: null, newQty: "", note: "" };
const EMPTY_HISTORY  = { open: false, product: null, movements: [], loading: false };

// ── Component ──────────────────────────────────────────────────────

export default function AdminInventory() {
  const { addToast } = useToast();

  const [products, setProducts]   = useState([]);
  const [stats, setStats]         = useState({ total: 0, out: 0, low: 0, in: 0, totalValue: 0 });
  const [loading, setLoading]     = useState(true);

  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [threshold, setThreshold] = useState(10);

  const [restock,  setRestock]    = useState(EMPTY_RESTOCK);
  const [adjust,   setAdjust]     = useState(EMPTY_ADJUST);
  const [history,  setHistory]    = useState(EMPTY_HISTORY);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getInventory({
        search:    search      || undefined,
        status:    statusFilter === "all" ? undefined : statusFilter,
        threshold: threshold === 10 ? undefined : threshold,
        limit:     200,
      });
      setProducts(res.data   || []);
      if (res.stats) setStats(res.stats);
    } catch {
      addToast("Failed to load inventory", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, threshold]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // ── Helpers ────────────────────────────────────────────────────

  // Handle all image formats: Cloudinary object array, string array, legacy single string
  const productImg = (p) => {
    if (p.images?.[0]?.url)                           return p.images[0].url;
    if (typeof p.images?.[0] === "string" && p.images[0]) return p.images[0];
    if (p.imageUrl)                                   return p.imageUrl;
    if (p.imageUrls?.[0])                             return p.imageUrls[0];
    return null; // onError handler shows placeholder
  };

  // Handle both new `name` field and legacy `title` field
  const productName = (p) => p.name || p.title || "—";

  // Handle both `categories` array and legacy singular `category` string
  const productCategory = (p) => p.categories?.[0] || p.category || "—";

  // ── Restock ────────────────────────────────────────────────────

  const handleRestock = async (e) => {
    e.preventDefault();
    const units = Number.parseInt(restock.units, 10);
    if (!units || units <= 0) { addToast("Enter a positive number of units", "error"); return; }
    setSubmitting(true);
    try {
      await inventoryApi.restockProduct(
        restock.product._id, units, restock.note,
        restock.product.variantId || null
      );
      addToast(`Added ${units} unit${units === 1 ? "" : "s"} to "${productName(restock.product)}"`, "success");
      setRestock(EMPTY_RESTOCK);
      fetchInventory();
    } catch (err) {
      addToast(err?.response?.data?.message || "Restock failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Adjust ─────────────────────────────────────────────────────

  const handleAdjust = async (e) => {
    e.preventDefault();
    const newQty = Number.parseInt(adjust.newQty, 10);
    if (newQty == null || Number.isNaN(newQty) || newQty < 0) {
      addToast("Enter a valid quantity (≥ 0)", "error"); return;
    }
    if (!adjust.note.trim()) {
      addToast("A note is required for adjustments", "error"); return;
    }
    setSubmitting(true);
    try {
      await inventoryApi.adjustStock(
        adjust.product._id, newQty, adjust.note,
        adjust.product.variantId || null
      );
      addToast(`Stock for "${productName(adjust.product)}" adjusted to ${newQty}`, "success");
      setAdjust(EMPTY_ADJUST);
      fetchInventory();
    } catch (err) {
      addToast(err?.response?.data?.message || "Adjustment failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── History ────────────────────────────────────────────────────

  const openHistory = async (product) => {
    setHistory({ open: true, product, movements: [], loading: true });
    try {
      const params = product.variantId ? { variantId: product.variantId } : {};
      const res = await inventoryApi.getMovements(product._id, params);
      setHistory(h => ({ ...h, movements: res.data || [], loading: false }));
    } catch {
      setHistory(h => ({ ...h, loading: false }));
      addToast("Failed to load movement history", "error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────

  let inventoryTableContent;
  if (loading) {
    inventoryTableContent = <div className="inv-loading">Loading inventory…</div>;
  } else if (products.length === 0) {
    inventoryTableContent = <div className="inv-empty">No products match your filters.</div>;
  } else {
    inventoryTableContent = (
      <div className="inv-table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {products.map((p, i) => {
                const badge = BADGE[p.stockStatus] || BADGE.in;
                return (
                  <motion.tr
                    key={`${p._id}_${p.variantId || "base"}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(i * 0.022, 0.3) }}
                  >
                    <td>
                      <div className="inv-product-cell">
                        <img
                          src={productImg(p) || "https://placehold.co/48x48"}
                          alt={productName(p)}
                          className="inv-product-img"
                          loading="lazy"
                          onError={e => { e.target.src = "https://placehold.co/48x48"; }}
                        />
                        <span className="inv-product-name">{productName(p)}</span>
                      </div>
                    </td>
                    <td>
                      {p.variantLabel
                        ? <span className="inv-variant-label">{p.variantLabel}</span>
                        : <span className="inv-no-variant">—</span>
                      }
                    </td>
                    <td>
                      <span className="inv-category">
                        {productCategory(p)}
                      </span>
                    </td>
                    <td>
                      <span className={`inv-qty${p.stockStatus === "out" ? " inv-qty--zero" : ""}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td>
                      <span className={`inv-badge ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <span className={`inv-active ${p.isActive ? "inv-active--yes" : "inv-active--no"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="inv-actions">
                        <button
                          className="inv-action-btn inv-action-btn--restock"
                          onClick={() => setRestock({ open: true, product: p, units: "", note: "" })}
                          title="Add stock"
                        >
                          <FiPlus size={12} /> Restock
                        </button>
                        <button
                          className="inv-action-btn inv-action-btn--adjust"
                          onClick={() => setAdjust({ open: true, product: p, newQty: String(p.quantity), note: "" })}
                          title="Manual adjust"
                        >
                          <FiEdit3 size={12} /> Adjust
                        </button>
                        <button
                          className="inv-action-btn inv-action-btn--history"
                          onClick={() => openHistory(p)}
                          title="View history"
                        >
                          <FiClock size={12} /> History
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  }

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
          <h1 className="admin-page-title">Inventory</h1>
          <p className="admin-page-subtitle">
            Monitor stock levels, restock products, and review movement history.
          </p>
        </div>
        <button className="inv-refresh-btn" onClick={fetchInventory}>
          <FiRefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div className="inv-stats-strip">
        {[
          { icon: <FiBox />,          label: "Total SKUs",      value: stats.total,                           cls: "inv-stat--default" },
          { icon: <FiAlertTriangle />, label: "Low Stock",       value: stats.low,                             cls: "inv-stat--warn" },
          { icon: <FiXCircle />,       label: "Out of Stock",    value: stats.out,                             cls: "inv-stat--danger" },
          { icon: <FiDollarSign />,    label: "Inventory Value", value: `Rs ${Math.round(stats.totalValue || 0).toLocaleString('en-US')}`, cls: "inv-stat--success" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className={`inv-stat ${s.cls}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <div className="inv-stat-icon">{s.icon}</div>
            <div>
              <p className="inv-stat-value">{s.value}</p>
              <p className="inv-stat-label">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="admin-card inv-toolbar">
        <input
          className="inv-search"
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="inv-threshold">
          <label htmlFor="inv-threshold">Low-stock at:</label>
          <input
            id="inv-threshold"
            type="number"
            min={1}
            max={999}
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="inv-threshold-input"
          />
          <span className="inv-threshold-unit">units</span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        {inventoryTableContent}
      </div>

      {/* ── Restock modal ── */}
      <AnimatePresence>
        {restock.open && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !submitting && setRestock(EMPTY_RESTOCK)}
          >
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{ scale: 0.92,    opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="admin-modal-title">Restock — {productName(restock.product)}</h3>
              <p className="admin-modal-msg">
                Current stock: <strong>{restock.product?.quantity ?? 0}</strong> units
              </p>
              <form onSubmit={handleRestock}>
                <div className="inv-modal-field">
                  <label htmlFor="inv-restock-units">
                    Units to add <span className="admin-required">*</span>
                  </label>
                  <input
                    id="inv-restock-units"
                    type="number" min={1}
                    className="admin-input"
                    placeholder="e.g. 50"
                    value={restock.units}
                    onChange={e => setRestock(r => ({ ...r, units: e.target.value }))}
                    required autoFocus
                  />
                </div>
                <div className="inv-modal-field">
                  <label htmlFor="inv-restock-note">Note (optional)</label>
                  <input
                    id="inv-restock-note"
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Monthly supplier delivery"
                    value={restock.note}
                    onChange={e => setRestock(r => ({ ...r, note: e.target.value }))}
                  />
                </div>
                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-modal-btn cancel"
                    onClick={() => setRestock(EMPTY_RESTOCK)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-modal-btn confirm"
                    disabled={submitting}
                  >
                    {submitting ? "Saving…" : "Add Stock"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Adjust modal ── */}
      <AnimatePresence>
        {adjust.open && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !submitting && setAdjust(EMPTY_ADJUST)}
          >
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{ scale: 0.92,    opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="admin-modal-title">Adjust Stock — {productName(adjust.product)}</h3>
              <p className="admin-modal-msg">
                Current stock: <strong>{adjust.product?.quantity ?? 0}</strong> units
              </p>
              <form onSubmit={handleAdjust}>
                <div className="inv-modal-field">
                  <label htmlFor="inv-adjust-qty">
                    New quantity <span className="admin-required">*</span>
                  </label>
                  <input
                    id="inv-adjust-qty"
                    type="number" min={0}
                    className="admin-input"
                    value={adjust.newQty}
                    onChange={e => setAdjust(a => ({ ...a, newQty: e.target.value }))}
                    required autoFocus
                  />
                </div>
                <div className="inv-modal-field">
                  <label htmlFor="inv-adjust-reason">
                    Reason for adjustment <span className="admin-required">*</span>
                  </label>
                  <input
                    id="inv-adjust-reason"
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Damaged goods written off"
                    value={adjust.note}
                    onChange={e => setAdjust(a => ({ ...a, note: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-modal-btn cancel"
                    onClick={() => setAdjust(EMPTY_ADJUST)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-modal-btn confirm"
                    disabled={submitting}
                  >
                    {submitting ? "Saving…" : "Save Adjustment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Movement history drawer ── */}
      <AnimatePresence>
        {history.open && (
          <>
            <motion.div
              className="inv-drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setHistory(EMPTY_HISTORY)}
            />
            <motion.aside
              className="inv-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <div className="inv-drawer-header">
                <div>
                  <h3>Movement History</h3>
                  <p>{history.product ? productName(history.product) : ""}</p>
                </div>
                <button
                  className="inv-drawer-close"
                  onClick={() => setHistory(EMPTY_HISTORY)}
                  aria-label="Close"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="inv-drawer-body">
                {(() => {
                  if (history.loading) {
                    return <div className="inv-drawer-state">Loading history…</div>;
                  }
                  if (history.movements.length === 0) {
                    return <div className="inv-drawer-state">No movements recorded yet.</div>;
                  }
                  return (
                    <div className="inv-movement-list">
                      {history.movements.map((m) => (
                        <div key={m._id} className="inv-movement-item">
                          <div className={`inv-movement-type-badge ${MOVEMENT_TYPE_COLORS[m.type] || ""}`}>
                            {m.type}
                          </div>
                          <div className="inv-movement-info">
                            <span className="inv-movement-delta">
                              {m.delta > 0 ? `+${m.delta}` : m.delta} units
                              <span className="inv-movement-qty">
                                &nbsp;({m.prevQty} → {m.newQty})
                              </span>
                              {m.variantLabel && (
                                <span className="inv-modal-variant-chip">{m.variantLabel}</span>
                              )}
                            </span>
                            {m.note && (
                              <span className="inv-movement-note">{m.note}</span>
                            )}
                            <span className="inv-movement-meta">
                              {m.createdBy?.name || "System"} ·{" "}
                              {new Date(m.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
