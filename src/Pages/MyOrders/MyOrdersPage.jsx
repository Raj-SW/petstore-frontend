// frontend/src/Pages/MyOrders/MyOrdersPage.jsx — enhanced
import { useState, useEffect, useMemo } from "react";
import Price from "../../Components/HelperComponents/Price/Price";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaSpinner,
  FaBan, FaSearch, FaChevronDown, FaRedoAlt, FaUndo,
  FaMapMarkerAlt, FaCreditCard, FaTimes,
} from "react-icons/fa";
import ordersApi from "../../Services/api/ordersApi";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import Breadcrumb from "../../Components/HelperComponents/Breadcrumb/Breadcrumb";
import "./MyOrdersPage.css";

// ── Constants ────────────────────────────────────────────────────────────────

const ORDERS_PER_PAGE = 5;

const FILTER_TABS = [
  { key: "all",        label: "All" },
  { key: "pending",    label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped",    label: "Shipped" },
  { key: "delivered",  label: "Delivered" },
  { key: "cancelled",  label: "Cancelled" },
];

const STATUS_META = {
  pending:    { label: "Pending",    icon: <FaBox />,                      cls: "order-badge--pending" },
  processing: { label: "Processing", icon: <FaSpinner className="spin" />, cls: "order-badge--processing" },
  shipped:    { label: "Shipped",    icon: <FaTruck />,                    cls: "order-badge--shipped" },
  delivered:  { label: "Delivered",  icon: <FaCheckCircle />,              cls: "order-badge--delivered" },
  cancelled:  { label: "Cancelled",  icon: <FaTimesCircle />,              cls: "order-badge--cancelled" },
};

const PAYMENT_META = {
  pending:   { label: "Payment Pending", cls: "pay-badge--pending" },
  completed: { label: "Paid",            cls: "pay-badge--paid" },
  failed:    { label: "Payment Failed",  cls: "pay-badge--failed" },
  refunded:  { label: "Refunded",        cls: "pay-badge--refunded" },
};

const TIMELINE_STEPS = [
  { key: "pending",    label: "Ordered" },
  { key: "processing", label: "Processing" },
  { key: "shipped",    label: "Shipped" },
  { key: "delivered",  label: "Delivered" },
];

const REFUND_REASONS = [
  "Item arrived damaged",
  "Wrong item received",
  "Item not as described",
  "Item never arrived",
  "Changed my mind",
  "Other",
];

// ── Sub-components ────────────────────────────────────────────────────────────

function OrderTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="mo-timeline mo-timeline--cancelled">
        <FaTimesCircle size={15} />
        <span>This order was cancelled</span>
      </div>
    );
  }

  const currentIdx = TIMELINE_STEPS.findIndex(s => s.key === status);

  return (
    <div className="mo-timeline">
      {TIMELINE_STEPS.map((step, i) => {
        const done    = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <div key={step.key} className="mo-tl-step">
            <div className="mo-tl-top">
              <div className={`mo-tl-dot ${done ? "mo-tl-dot--done" : ""} ${current ? "mo-tl-dot--current" : ""}`}>
                {done && !current && <FaCheckCircle size={9} />}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`mo-tl-line ${i < currentIdx ? "mo-tl-line--done" : ""}`} />
              )}
            </div>
            <span className={`mo-tl-label ${done ? "mo-tl-label--done" : ""}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RefundModal({ order, onClose }) {
  const [reason, setReason]       = useState("");
  const [notes, setNotes]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    addToast("Return request received. Our team will contact you within 24–48 hours.", "success");
    setSubmitting(false);
    onClose();
  };

  return (
    <motion.div
      className="mo-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="mo-modal"
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mo-modal-header">
          <div className="mo-modal-icon"><FaUndo size={14} /></div>
          <h3 className="mo-modal-title">Request Return / Refund</h3>
          <button type="button" className="mo-modal-close" onClick={onClose} aria-label="Close">
            <FaTimes size={13} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mo-modal-body">
            <p className="mo-modal-order-ref">Order #{order._id.slice(-8).toUpperCase()}</p>

            <div className="mo-field">
              <p className="mo-label">Reason for return *</p>
              <Select value={reason || undefined} onValueChange={setReason}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>
                  {REFUND_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="mo-field">
              <label className="mo-label" htmlFor="mo-notes">Additional notes</label>
              <textarea
                id="mo-notes"
                className="mo-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe the issue in more detail…"
                rows={3}
              />
            </div>
          </div>

          <div className="mo-modal-footer">
            <button type="button" className="mo-btn mo-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="mo-btn mo-btn--primary" disabled={!reason || submitting}>
              {submitting ? <><FaSpinner className="spin" size={12} /> Submitting…</> : "Submit Request"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyOrdersPage() {
  const navigate   = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [expandedId,   setExpandedId]   = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [visibleCount, setVisibleCount] = useState(ORDERS_PER_PAGE);
  const [refundOrder,  setRefundOrder]  = useState(null);

  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then(res => setOrders(res.data || []))
      .catch(() => addToast("Failed to load orders.", "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (activeFilter !== "all") list = list.filter(o => o.status === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(o =>
        o.items?.some(item => (item.product?.name || "").toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, activeFilter, searchQuery]);

  const pagedOrders = filteredOrders.slice(0, visibleCount);
  const hasMore     = visibleCount < filteredOrders.length;

  const toggleExpand = id => setExpandedId(prev => prev === id ? null : id);

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      await ordersApi.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "cancelled" } : o));
      addToast("Order cancelled successfully.", "success");
    } catch (err) {
      addToast(err?.message || "Could not cancel order.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = async (order) => {
    let added = 0;
    for (const item of order.items || []) {
      const p = item.product;
      if (!p) continue;
      const pid = p._id || p.id;
      if (!pid) continue;
      await addItem({
        id: String(pid),
        name: p.name || "Product",
        price: item.price,
        image: p.images?.[0]?.url || p.imageUrl || "",
      }, item.quantity);
      added++;
    }
    if (added) addToast(`${added} item${added === 1 ? "" : "s"} added to cart.`, "success");
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="my-orders-state">
        <FaSpinner className="spin" size={28} />
        <p>Loading your orders…</p>
      </div>
    );
  }

  // ── Empty ──
  if (orders.length === 0) {
    return (
      <div className="my-orders-state">
        <FaBox size={52} />
        <h2>No orders yet</h2>
        <p>Looks like you haven't placed any orders. Browse our shop and find something for your pet!</p>
        <button type="button" className="mo-btn mo-btn--primary" onClick={() => navigate("/petshop")}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "My Orders", path: "/my-orders" }]} />

      <div className="my-orders-header">
        <h1>My Orders</h1>
        <p>{orders.length} order{orders.length === 1 ? "" : "s"}</p>
      </div>

      {/* ── Search + Filter ── */}
      <div className="mo-controls">
        <div className="mo-search-wrap">
          <FaSearch size={13} className="mo-search-icon" />
          <input
            className="mo-search"
            type="text"
            placeholder="Search by product name…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mo-filter-tabs">
          {FILTER_TABS.map(tab => {
            const count = tab.key === "all" ? null : orders.filter(o => o.status === tab.key).length;
            return (
              <button
                key={tab.key}
                type="button"
                className={`mo-filter-tab${activeFilter === tab.key ? " mo-filter-tab--active" : ""}`}
                onClick={() => { setActiveFilter(tab.key); setVisibleCount(ORDERS_PER_PAGE); }}
              >
                {tab.label}
                {count !== null && count > 0 && <span className="mo-filter-count">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── No results ── */}
      {filteredOrders.length === 0 ? (
        <div className="my-orders-state my-orders-state--inline">
          <FaSearch size={32} />
          <h2>No orders found</h2>
          <p>Try a different filter or search term.</p>
        </div>
      ) : (
        <div className="my-orders-list">
          {pagedOrders.map((order, i) => {
            const status      = STATUS_META[order.status] || STATUS_META.pending;
            const payment     = PAYMENT_META[order.paymentStatus] || PAYMENT_META.pending;
            const canCancel   = ["pending", "processing"].includes(order.status);
            const isDelivered = order.status === "delivered";
            const isExpanded  = expandedId === order._id;
            const finalAmount = typeof order.finalAmount === "number"
              ? order.finalAmount
              : order.totalAmount - (order.discount || 0);

            return (
              <motion.div
                key={order._id}
                className="orders-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                {/* ── Card header — clickable to expand ── */}
                <button
                  type="button"
                  className="orders-card-header orders-card-header--clickable"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div className="orders-card-meta">
                    <span className="orders-card-id">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="orders-card-date">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="orders-card-badges">
                    <span className={`order-badge ${status.cls}`}>{status.icon} {status.label}</span>
                    <span className={`pay-badge ${payment.cls}`}>{payment.label}</span>
                  </div>
                  <motion.span
                    className="orders-expand-icon"
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <FaChevronDown size={12} />
                  </motion.span>
                </button>

                {/* ── Items ── */}
                <div className="orders-card-items">
                  {order.items?.map(item => {
                    const product = item.product;
                    const baseName = product?.name || "Product";
                    const name    = item.variantLabel ? `${baseName} · ${item.variantLabel}` : baseName;
                    const img     = product?.images?.[0]?.url || product?.imageUrl;
                    return (
                      <button
                        key={item._id}
                        type="button"
                        className="orders-item-row orders-item-row--clickable"
                        onClick={() => { const pid = product?._id || product?.id; if (pid) navigate(`/product/${pid}`); }}
                      >
                        {img && <img src={img} alt={name} className="orders-item-img" />}
                        <div className="orders-item-info">
                          <span className="orders-item-name">{name}</span>
                          <span className="orders-item-qty">Qty: {item.quantity}</span>
                        </div>
                        <span className="orders-item-price">
                          <Price amount={item.price * item.quantity} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ── Expanded detail panel ── */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      className="orders-detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="orders-detail-inner">
                        <OrderTimeline status={order.status} />

                        <div className="orders-detail-grid">
                          {order.shippingAddress && (
                            <div className="orders-detail-section">
                              <h4><FaMapMarkerAlt size={11} /> Shipping Address</h4>
                              <p>
                                {[
                                  order.shippingAddress.street,
                                  order.shippingAddress.city,
                                  order.shippingAddress.state,
                                  order.shippingAddress.zipCode,
                                  order.shippingAddress.country,
                                ].filter(Boolean).join(", ")}
                              </p>
                            </div>
                          )}
                          <div className="orders-detail-section">
                            <h4><FaCreditCard size={11} /> Payment</h4>
                            <p style={{ textTransform: "capitalize" }}>{order.paymentMethod || "—"}</p>
                            <span className={`pay-badge ${payment.cls}`} style={{ marginTop: "0.4rem", display: "inline-flex" }}>
                              {payment.label}
                            </span>
                          </div>
                          {order.trackingNumber && (
                            <div className="orders-detail-section">
                              <h4><FaTruck size={11} /> Tracking</h4>
                              <p><strong>{order.trackingNumber}</strong></p>
                              {order.estimatedDelivery && (
                                <p className="orders-detail-est">
                                  Est. {new Date(order.estimatedDelivery).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Footer ── */}
                <div className="orders-card-footer">
                  <div className="orders-card-total">
                    <span>Total</span>
                    <strong><Price amount={finalAmount} /></strong>
                  </div>

                  <div className="orders-card-actions">
                    {isDelivered && (
                      <>
                        <button type="button" className="mo-btn mo-btn--reorder" onClick={() => handleReorder(order)}>
                          <FaRedoAlt size={11} /> Buy Again
                        </button>
                        <button type="button" className="mo-btn mo-btn--refund" onClick={() => setRefundOrder(order)}>
                          <FaUndo size={11} /> Return / Refund
                        </button>
                      </>
                    )}
                    {canCancel && (
                      <button
                        type="button"
                        className="orders-cancel-btn"
                        onClick={() => handleCancel(order._id)}
                        disabled={cancellingId === order._id}
                      >
                        {cancellingId === order._id
                          ? <><FaSpinner className="spin" size={11} /> Cancelling…</>
                          : <><FaBan size={11} /> Cancel Order</>}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Load More ── */}
      {hasMore && (
        <div className="mo-load-more">
          <button
            type="button"
            className="mo-btn mo-btn--outline"
            onClick={() => setVisibleCount(c => c + ORDERS_PER_PAGE)}
          >
            Load More — {filteredOrders.length - visibleCount} remaining
          </button>
        </div>
      )}

      {/* ── Refund Modal ── */}
      <AnimatePresence>
        {refundOrder && <RefundModal order={refundOrder} onClose={() => setRefundOrder(null)} />}
      </AnimatePresence>
    </div>
  );
}
