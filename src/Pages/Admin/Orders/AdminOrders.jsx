import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import ordersApi from "../../../Services/api/ordersApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminOrders.css";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const getStatusClass = (status) => {
  const map = {
    pending: "admin-order-status--pending",
    processing: "admin-order-status--processing",
    shipped: "admin-order-status--shipped",
    delivered: "admin-order-status--delivered",
    cancelled: "admin-order-status--cancelled",
  };
  return `admin-order-status ${map[status?.toLowerCase()] || ""}`;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOrder, setDrawerOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAllOrders({ limit: 1000 });
      setOrders(response.data || response || []);
    } catch (error) {
      addToast("Failed to fetch orders", "error");
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    setStatusLoading((prev) => ({ ...prev, [order._id]: true }));
    try {
      await ordersApi.updateOrderStatus(order._id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, status: newStatus } : o))
      );
      addToast(`Order status updated to "${newStatus}"`, "success");
    } catch (error) {
      addToast("Failed to update order status", "error");
      console.error("Error updating order status:", error);
    } finally {
      setStatusLoading((prev) => ({ ...prev, [order._id]: false }));
    }
  };

  // Derived stats
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const columns = [
    {
      header: "Order #",
      accessor: "_id",
      render: (value) => (
        <span className="admin-order-id">#{value?.slice(-6).toUpperCase()}</span>
      ),
    },
    {
      header: "Customer",
      accessor: "user",
      render: (value, item) => (
        <span className="admin-order-customer">
          {item.userEmail || value?.email || value?.name || "—"}
        </span>
      ),
    },
    {
      header: "Items",
      accessor: "items",
      render: (value) => (
        <span className="admin-order-items-count">{value?.length ?? 0}</span>
      ),
    },
    {
      header: "Total",
      accessor: "totalAmount",
      render: (value) => (
        <span className="admin-order-total">${(value || 0).toFixed(2)}</span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span className={getStatusClass(value)}>{value || "pending"}</span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      render: (value) => value ? new Date(value).toLocaleDateString() : "—",
    },
  ];

  const customActions = (order) => (
    <div className="admin-order-actions">
      <button
        className="admin-action-btn admin-action-btn--view"
        onClick={() => setDrawerOrder(order)}
        title="View order details"
      >
        View
      </button>
      <select
        className="admin-status-select"
        value={order.status || "pending"}
        onChange={(e) => handleStatusChange(order, e.target.value)}
        disabled={statusLoading[order._id]}
        aria-label={`Change status for order ${order._id?.slice(-6)}`}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
    </div>
  );

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">Track and manage all customer orders</p>
        </div>
      </div>

      {/* Stat pills */}
      <div className="admin-stats-row">
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{totalOrders}</span>
          <span className="admin-stat-pill-lbl">Total Orders</span>
        </div>
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{pendingCount}</span>
          <span className="admin-stat-pill-lbl">Pending</span>
        </div>
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">${totalRevenue.toFixed(2)}</span>
          <span className="admin-stat-pill-lbl">Revenue</span>
        </div>
      </div>

      <div className="admin-card">
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          showActions={true}
          customActions={customActions}
        />
      </div>

      {/* Order Detail Drawer */}
      <AnimatePresence>
        {drawerOrder && (
          <>
            <motion.div
              className="admin-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOrder(null)}
            />
            <motion.div
              className="admin-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="admin-drawer-header">
                <h2 className="admin-drawer-title">
                  Order #{drawerOrder._id?.slice(-6).toUpperCase()}
                </h2>
                <button
                  className="admin-drawer-close"
                  onClick={() => setDrawerOrder(null)}
                  aria-label="Close drawer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="admin-drawer-body">
                <div className="admin-drawer-section">
                  <p className="admin-drawer-label">Customer</p>
                  <p className="admin-drawer-value">
                    {drawerOrder.userEmail || drawerOrder.user?.email || drawerOrder.user?.name || "—"}
                  </p>
                </div>
                <div className="admin-drawer-section">
                  <p className="admin-drawer-label">Status</p>
                  <span className={getStatusClass(drawerOrder.status)}>
                    {drawerOrder.status || "pending"}
                  </span>
                </div>
                <div className="admin-drawer-section">
                  <p className="admin-drawer-label">Total</p>
                  <p className="admin-drawer-value admin-drawer-value--bold">
                    ${(drawerOrder.totalAmount || 0).toFixed(2)}
                  </p>
                </div>
                <div className="admin-drawer-section">
                  <p className="admin-drawer-label">Date</p>
                  <p className="admin-drawer-value">
                    {drawerOrder.createdAt
                      ? new Date(drawerOrder.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>

                <div className="admin-drawer-divider" />

                <p className="admin-drawer-label">Items ({drawerOrder.items?.length ?? 0})</p>
                {drawerOrder.items && drawerOrder.items.length > 0 ? (
                  <ul className="admin-drawer-items">
                    {drawerOrder.items.map((item, idx) => (
                      <li key={idx} className="admin-drawer-item">
                        <div className="admin-drawer-item-info">
                          <span className="admin-drawer-item-name">
                            {item.productName || item.name || `Item ${idx + 1}`}
                          </span>
                          <span className="admin-drawer-item-qty">
                            × {item.quantity || 1}
                          </span>
                        </div>
                        <span className="admin-drawer-item-price">
                          ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-drawer-empty">No items found for this order.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminOrders;
