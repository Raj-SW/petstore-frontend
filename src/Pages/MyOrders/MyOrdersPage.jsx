// frontend/src/Pages/MyOrders/MyOrdersPage.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaBox, FaTruck, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaBan,
} from "react-icons/fa";
import ordersApi from "../../Services/api/ordersApi";
import { useToast } from "../../context/ToastContext";
import "./MyOrdersPage.css";

const STATUS_META = {
  pending:    { label: "Pending",    icon: <FaBox />,                           cls: "order-badge--pending" },
  processing: { label: "Processing", icon: <FaSpinner className="spin" />,      cls: "order-badge--processing" },
  shipped:    { label: "Shipped",    icon: <FaTruck />,                         cls: "order-badge--shipped" },
  delivered:  { label: "Delivered",  icon: <FaCheckCircle />,                   cls: "order-badge--delivered" },
  cancelled:  { label: "Cancelled",  icon: <FaTimesCircle />,                   cls: "order-badge--cancelled" },
};

const PAYMENT_META = {
  pending:   { label: "Payment Pending", cls: "pay-badge--pending" },
  completed: { label: "Paid",            cls: "pay-badge--paid" },
  failed:    { label: "Payment Failed",  cls: "pay-badge--failed" },
  refunded:  { label: "Refunded",        cls: "pay-badge--refunded" },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => addToast("Failed to load orders.", "error"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    try {
      await ordersApi.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );
      addToast("Order cancelled successfully.", "success");
    } catch (err) {
      addToast(err?.message || "Could not cancel order.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="my-orders-state">
        <FaSpinner className="spin" size={28} />
        <p>Loading your orders…</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-orders-state">
        <FaBox size={48} />
        <h2>No orders yet</h2>
        <p>Once you place an order it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-header">
        <h1>My Orders</h1>
        <p>{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="my-orders-list">
        {orders.map((order, i) => {
          const status = STATUS_META[order.status] || STATUS_META.pending;
          const payment = PAYMENT_META[order.paymentStatus] || PAYMENT_META.pending;
          const canCancel = ["pending", "processing"].includes(order.status);
          const finalAmount =
            typeof order.finalAmount === "number"
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
              {/* Header */}
              <div className="orders-card-header">
                <div className="orders-card-meta">
                  <span className="orders-card-id">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span className="orders-card-date">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="orders-card-badges">
                  <span className={`order-badge ${status.cls}`}>
                    {status.icon} {status.label}
                  </span>
                  <span className={`pay-badge ${payment.cls}`}>
                    {payment.label}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="orders-card-items">
                {order.items?.map((item) => {
                  const product = item.product;
                  const name = product?.name || "Product";
                  const img = product?.images?.[0];
                  return (
                    <div key={item._id} className="orders-item-row">
                      {img && (
                        <img src={img} alt={name} className="orders-item-img" />
                      )}
                      <div className="orders-item-info">
                        <span className="orders-item-name">{name}</span>
                        <span className="orders-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="orders-item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="orders-card-footer">
                <div className="orders-card-total">
                  <span>Total</span>
                  <strong>${finalAmount.toFixed(2)}</strong>
                </div>

                {order.trackingNumber && (
                  <div className="orders-tracking">
                    <FaTruck size={12} />
                    <span>
                      Tracking: <strong>{order.trackingNumber}</strong>
                      {order.estimatedDelivery && (
                        <> · Est. {new Date(order.estimatedDelivery).toLocaleDateString()}</>
                      )}
                    </span>
                  </div>
                )}

                {canCancel && (
                  <button
                    type="button"
                    className="orders-cancel-btn"
                    onClick={() => handleCancel(order._id)}
                    disabled={cancellingId === order._id}
                  >
                    {cancellingId === order._id ? (
                      <><FaSpinner className="spin" size={11} /> Cancelling…</>
                    ) : (
                      <><FaBan size={11} /> Cancel Order</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
