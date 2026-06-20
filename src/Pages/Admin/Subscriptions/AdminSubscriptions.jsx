import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FiRepeat, FiPlay, FiPause, FiXCircle } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import subscriptionsApi from "../../../Services/api/subscriptionsApi";
import { useToast } from "../../../context/ToastContext";
import "../Tips/AdminTips.css";
import "./AdminSubscriptions.css";

const AdminSubscriptions = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { fetchAll(); }, []);

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

      <DataTable data={items} columns={columns} loading={loading} />
    </motion.div>
  );
};

export default AdminSubscriptions;
