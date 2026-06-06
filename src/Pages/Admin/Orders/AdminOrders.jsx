import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX, FiUser, FiMapPin, FiCreditCard,
  FiPackage, FiTruck, FiFileText, FiSearch,
} from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import ordersApi from "../../../Services/api/ordersApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminOrders.css";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const getStatusClass = (status) => {
  const map = {
    pending:    "ao-badge ao-badge--pending",
    processing: "ao-badge ao-badge--processing",
    shipped:    "ao-badge ao-badge--shipped",
    delivered:  "ao-badge ao-badge--delivered",
    cancelled:  "ao-badge ao-badge--cancelled",
  };
  return map[status?.toLowerCase()] || "ao-badge";
};

const getPaymentClass = (status) => {
  const map = {
    pending:   "ao-badge ao-badge--pending",
    completed: "ao-badge ao-badge--delivered",
    failed:    "ao-badge ao-badge--cancelled",
    refunded:  "ao-badge ao-badge--shipped",
  };
  return map[status?.toLowerCase()] || "ao-badge";
};

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const AdminOrders = () => {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [drawerOrder, setDrawerOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const { addToast } = useToast();

  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [search,        setSearch]        = useState("");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAllOrders({ limit: 1000 });
      setOrders(response.data || response || []);
    } catch {
      addToast("Failed to fetch orders", "error");
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
      if (drawerOrder?._id === order._id) {
        setDrawerOrder((prev) => ({ ...prev, status: newStatus }));
      }
      addToast(`Order status updated to "${newStatus}"`, "success");
    } catch {
      addToast("Failed to update order status", "error");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [order._id]: false }));
    }
  };

  // ── Filtered list ──
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filterStatus  !== "all" && o.status?.toLowerCase()        !== filterStatus)  return false;
      if (filterPayment !== "all" && o.paymentStatus?.toLowerCase() !== filterPayment) return false;
      if (q) {
        const id       = o._id?.slice(-6).toLowerCase();
        const name     = o.user?.name?.toLowerCase()  || "";
        const email    = o.user?.email?.toLowerCase() || o.userEmail?.toLowerCase() || "";
        if (!id.includes(q) && !name.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [orders, filterStatus, filterPayment, search]);

  // Stats
  const totalOrders  = orders.length;
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
        <div className="admin-order-customer-cell">
          <span className="admin-order-customer-name">
            {value?.name || item.userEmail || "—"}
          </span>
          {value?.email && (
            <span className="admin-order-customer-email">{value.email}</span>
          )}
        </div>
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
        <span className="admin-order-total">{fmt(value)}</span>
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
      header: "Payment",
      accessor: "paymentStatus",
      render: (value) => (
        <span className={getPaymentClass(value)}>{value || "pending"}</span>
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

  // ── Drawer helpers ──
  const addr = drawerOrder?.shippingAddress;
  const hasAddress = addr && Object.values(addr).some(Boolean);
  const hasTracking = drawerOrder?.trackingNumber;
  const hasNotes = drawerOrder?.notes;
  const hasDiscount = drawerOrder?.discount > 0;

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

      {/* ── Filter bar ── */}
      <div className="ao-filter-card">
        {/* Search row */}
        <div className="ao-search-wrap">
          <FiSearch size={14} className="ao-search-icon" />
          <input
            type="text"
            className="ao-search-input"
            placeholder="Search by order ID, customer name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="ao-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
              <FiX size={13} />
            </button>
          )}
        </div>

        <div className="ao-filter-divider" />

        {/* Chips row */}
        <div className="ao-filter-rows">
          <div className="ao-filter-row">
            <span className="ao-filter-label">Order Status</span>
            <div className="ao-chips">
              {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`ao-chip${filterStatus === s ? " ao-chip--on" : ""}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="ao-filter-row">
            <span className="ao-filter-label">Payment</span>
            <div className="ao-chips">
              {["all", "pending", "completed", "failed", "refunded"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`ao-chip${filterPayment === s ? " ao-chip--on" : ""}`}
                  onClick={() => setFilterPayment(s)}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: result count + clear */}
        {(filterStatus !== "all" || filterPayment !== "all" || search) && (
          <div className="ao-filter-footer">
            <span className="ao-result-count">
              Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
            </span>
            <button
              type="button"
              className="ao-clear-btn"
              onClick={() => { setFilterStatus("all"); setFilterPayment("all"); setSearch(""); }}
            >
              <FiX size={12} /> Clear all
            </button>
          </div>
        )}
      </div>

      <div className="admin-card">
        <DataTable
          hideSearch
          data={filteredOrders}
          columns={columns}
          loading={loading}
          showActions={true}
          customActions={customActions}
        />
      </div>

      {/* ── Order Detail Drawer ── */}
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
              {/* Header */}
              <div className="admin-drawer-header">
                <div>
                  <h2 className="admin-drawer-title">
                    Order #{drawerOrder._id?.slice(-6).toUpperCase()}
                  </h2>
                  <p className="admin-drawer-subtitle">
                    {drawerOrder.createdAt
                      ? new Date(drawerOrder.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <button
                  className="admin-drawer-close"
                  onClick={() => setDrawerOrder(null)}
                  aria-label="Close drawer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="admin-drawer-body">

                {/* ── Customer ── */}
                <div className="aod-section">
                  <div className="aod-section-title"><FiUser size={13} /> Customer</div>
                  <div className="aod-card">
                    <p className="aod-primary">
                      {drawerOrder.user?.name || "—"}
                    </p>
                    {drawerOrder.user?.email && (
                      <p className="aod-secondary">{drawerOrder.user.email}</p>
                    )}
                  </div>
                </div>

                {/* ── Order Status ── */}
                <div className="aod-section">
                  <div className="aod-section-title"><FiPackage size={13} /> Order Status</div>
                  <div className="aod-card aod-card--row">
                    <span className={getStatusClass(drawerOrder.status)}>
                      {drawerOrder.status || "pending"}
                    </span>
                    <select
                      className="admin-status-select"
                      value={drawerOrder.status || "pending"}
                      onChange={(e) => handleStatusChange(drawerOrder, e.target.value)}
                      disabled={statusLoading[drawerOrder._id]}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── Payment ── */}
                <div className="aod-section">
                  <div className="aod-section-title"><FiCreditCard size={13} /> Payment</div>
                  <div className="aod-card">
                    <div className="aod-row">
                      <span className="aod-label">Status</span>
                      <span className={getPaymentClass(drawerOrder.paymentStatus)}>
                        {drawerOrder.paymentStatus || "pending"}
                      </span>
                    </div>
                    <div className="aod-row">
                      <span className="aod-label">Method</span>
                      <span className="aod-value">
                        {drawerOrder.paymentMethod?.replace(/_/g, " ") || "—"}
                      </span>
                    </div>
                    {drawerOrder.paymentDetails?.transactionId && (
                      <div className="aod-row">
                        <span className="aod-label">Transaction ID</span>
                        <span className="aod-value aod-mono">
                          {drawerOrder.paymentDetails.transactionId}
                        </span>
                      </div>
                    )}
                    {drawerOrder.paymentDetails?.paymentDate && (
                      <div className="aod-row">
                        <span className="aod-label">Paid on</span>
                        <span className="aod-value">
                          {new Date(drawerOrder.paymentDetails.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Shipping Address ── */}
                {hasAddress && (
                  <div className="aod-section">
                    <div className="aod-section-title"><FiMapPin size={13} /> Shipping Address</div>
                    <div className="aod-card">
                      {addr.street && <p className="aod-addr-line">{addr.street}</p>}
                      {(addr.city || addr.state || addr.zipCode) && (
                        <p className="aod-addr-line">
                          {[addr.city, addr.state, addr.zipCode].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {addr.country && <p className="aod-addr-line">{addr.country}</p>}
                    </div>
                  </div>
                )}

                {/* ── Tracking ── */}
                {hasTracking && (
                  <div className="aod-section">
                    <div className="aod-section-title"><FiTruck size={13} /> Tracking</div>
                    <div className="aod-card">
                      <div className="aod-row">
                        <span className="aod-label">Tracking #</span>
                        <span className="aod-value aod-mono">{drawerOrder.trackingNumber}</span>
                      </div>
                      {drawerOrder.estimatedDelivery && (
                        <div className="aod-row">
                          <span className="aod-label">Est. Delivery</span>
                          <span className="aod-value">
                            {new Date(drawerOrder.estimatedDelivery).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Items ── */}
                <div className="aod-section">
                  <div className="aod-section-title">
                    <FiPackage size={13} /> Items ({drawerOrder.items?.length ?? 0})
                  </div>
                  {drawerOrder.items?.length > 0 ? (
                    <ul className="aod-items">
                      {drawerOrder.items.map((item, idx) => {
                        const name =
                          item.product?.name ||
                          item.productName ||
                          item.name ||
                          `Item ${idx + 1}`;
                        const img =
                          item.product?.images?.[0]?.url ||
                          item.product?.imageUrl ||
                          null;
                        const unitPrice = item.price || 0;
                        const qty = item.quantity || 1;
                        return (
                          <li key={idx} className="aod-item">
                            {img ? (
                              <img src={img} alt={name} className="aod-item-img" />
                            ) : (
                              <div className="aod-item-img aod-item-img--placeholder" />
                            )}
                            <div className="aod-item-info">
                              <span className="aod-item-name">{name}</span>
                              <span className="aod-item-meta">
                                {fmt(unitPrice)} × {qty}
                              </span>
                            </div>
                            <span className="aod-item-total">{fmt(unitPrice * qty)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="admin-drawer-empty">No items found.</p>
                  )}
                </div>

                {/* ── Order Summary ── */}
                <div className="aod-section">
                  <div className="aod-summary">
                    <div className="aod-summary-row">
                      <span>Subtotal</span>
                      <span>{fmt(drawerOrder.totalAmount)}</span>
                    </div>
                    {hasDiscount && (
                      <div className="aod-summary-row aod-summary-row--discount">
                        <span>
                          Discount
                          {drawerOrder.discountCode && (
                            <span className="aod-discount-code"> ({drawerOrder.discountCode})</span>
                          )}
                        </span>
                        <span>−{fmt(drawerOrder.discount)}</span>
                      </div>
                    )}
                    <div className="aod-summary-row aod-summary-row--total">
                      <span>Total</span>
                      <span>{fmt((drawerOrder.totalAmount || 0) - (drawerOrder.discount || 0))}</span>
                    </div>
                  </div>
                </div>

                {/* ── Notes ── */}
                {hasNotes && (
                  <div className="aod-section">
                    <div className="aod-section-title"><FiFileText size={13} /> Notes</div>
                    <div className="aod-card">
                      <p className="aod-notes-text">{drawerOrder.notes}</p>
                    </div>
                  </div>
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
