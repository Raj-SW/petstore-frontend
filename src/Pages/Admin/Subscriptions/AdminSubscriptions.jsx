import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiRepeat, FiPlay, FiPause, FiXCircle, FiAlertTriangle, FiEye } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import subscriptionsApi from "../../../Services/api/subscriptionsApi";
import { useToast } from "../../../context/ToastContext";
import "../Tips/AdminTips.css";
import "./AdminSubscriptions.css";

const AdminSubscriptions = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [horizon, setHorizon] = useState(30);
  const [viewed, setViewed] = useState(null);
  const { addToast } = useToast();

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchAnalytics(horizon); }, [horizon]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await subscriptionsApi.getAllAdmin();
      setItems(res.data || []);
    } catch {
      addToast("Failed to load subscriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (h) => {
    try {
      const data = await subscriptionsApi.getAnalytics(h);
      setAnalytics(data);
    } catch {
      // analytics is non-critical; ignore
    }
  };

  const setStatus = async (item, status) => {
    try {
      await subscriptionsApi.updateAdmin(item._id, { status });
      addToast(`Subscription ${status}`, "success");
      fetchAll();
    } catch {
      addToast("Update failed", "error");
    }
  };

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((s) => s.status === "active").length,
    paused: items.filter((s) => s.status === "paused").length,
  }), [items]);

  const columns = [
    {
      header: "Customer",
      accessor: "user",
      render: (value) => value?.name || "—",
    },
    {
      header: "Items",
      accessor: "items",
      sortable: false,
      render: (value) => <span className="at-pill">{Array.isArray(value) ? value.length : 0}</span>,
    },
    {
      header: "Interval",
      accessor: "intervalCount",
      sortable: false,
      render: (value, item) => `${value} ${item.intervalUnit}${value > 1 ? "s" : ""}`,
    },
    {
      header: "Next run",
      accessor: "nextRunAt",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
    {
      header: "Orders",
      accessor: "createdOrders",
      sortable: false,
      render: (value) => (Array.isArray(value) ? value.length : 0),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value, item) => (
        <span className="aps-actions">
          <span className={`at-status ${value === "active" ? "published" : "draft"}`}>{value}</span>
          <button title="View items" onClick={(e) => { e.stopPropagation(); setViewed(item); }}><FiEye /></button>
          {value === "active" && (
            <button title="Pause" onClick={(e) => { e.stopPropagation(); setStatus(item, "paused"); }}><FiPause /></button>
          )}
          {value === "paused" && (
            <button title="Resume" onClick={(e) => { e.stopPropagation(); setStatus(item, "active"); }}><FiPlay /></button>
          )}
          {value !== "cancelled" && (
            <button title="Cancel" onClick={(e) => { e.stopPropagation(); setStatus(item, "cancelled"); }}><FiXCircle /></button>
          )}
        </span>
      ),
    },
  ];

  const atRisk = analytics?.rows?.filter((r) => r.restockNeeded) || [];

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Subscriptions</h1>
          <p className="admin-page-subtitle">Recurring orders across all customers.</p>
        </div>
      </div>

      {!loading && (
        <div className="at-stats">
          <div className="at-stat-card"><FiRepeat size={18} /><div><p className="at-stat-value">{stats.total}</p><p className="at-stat-label">Total</p></div></div>
          <div className="at-stat-card"><FiPlay size={18} /><div><p className="at-stat-value">{stats.active}</p><p className="at-stat-label">Active</p></div></div>
          <div className="at-stat-card"><FiPause size={18} /><div><p className="at-stat-value">{stats.paused}</p><p className="at-stat-label">Paused</p></div></div>
        </div>
      )}

      {/* Demand prediction */}
      <div className="aps-demand">
        <div className="aps-demand-head">
          <h2 className="admin-pf-section-title" style={{ margin: 0 }}>
            <FiAlertTriangle style={{ verticalAlign: "-2px" }} /> Inventory demand forecast
          </h2>
          <label className="aps-horizon">
            Horizon&nbsp;
            <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="admin-select">
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </label>
        </div>
        {analytics ? (
          <>
            <p className="admin-page-subtitle" style={{ marginTop: 0 }}>
              {analytics.totalActiveSubscriptions} active subscriptions · {analytics.productsAtRisk} product(s) need restock within {analytics.horizonDays} days.
            </p>
            {atRisk.length > 0 ? (
              <table className="aps-demand-table">
                <thead>
                  <tr><th>Product</th><th>Variant</th><th>In stock</th><th>Projected demand</th><th>Shortfall</th></tr>
                </thead>
                <tbody>
                  {atRisk.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.variantLabel || "—"}</td>
                      <td>{r.currentStock}</td>
                      <td>{r.projectedDemand}</td>
                      <td className="aps-shortfall">+{Math.max(0, r.shortfall)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="aps-demand-ok">✓ Stock covers projected subscription demand for this horizon.</p>
            )}
          </>
        ) : (
          <p className="admin-page-subtitle">Loading forecast…</p>
        )}
      </div>

      <DataTable data={items} columns={columns} loading={loading} />

      <AnimatePresence>
        {viewed && (
          <motion.div className="admin-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewed(null)}>
            <motion.div className="admin-modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h3>Subscription — {viewed.user?.name || "Customer"}</h3>
              <p className="admin-page-subtitle" style={{ marginTop: 0 }}>
                Every {viewed.intervalCount} {viewed.intervalUnit}{viewed.intervalCount > 1 ? "s" : ""} · next run {viewed.nextRunAt ? new Date(viewed.nextRunAt).toLocaleDateString() : "—"} · {viewed.status}
              </p>
              <table className="aps-demand-table">
                <thead><tr><th>Product</th><th>Variant</th><th>Qty</th></tr></thead>
                <tbody>
                  {(viewed.items || []).map((it, i) => (
                    <tr key={i}>
                      <td>{it.product?.name || it.productName || it.name || "Product"}</td>
                      <td>{it.variantLabel || "—"}</td>
                      <td>{it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="admin-modal-actions">
                <button className="at-btn-secondary" onClick={() => setViewed(null)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminSubscriptions;
