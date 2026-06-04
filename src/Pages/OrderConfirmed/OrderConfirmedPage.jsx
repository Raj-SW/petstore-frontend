// frontend/src/Pages/OrderConfirmed/OrderConfirmedPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShoppingBag } from "react-icons/fa";
import ordersApi from "../../Services/api/ordersApi";
import pawSvg from "@/assets/CartoonAssets/paw.svg";
import sparkleSvg from "@/assets/CartoonAssets/sparkle.svg";
import "./OrderConfirmedPage.css";

// Staggered child variants
const childVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24, delay: i * 0.12 },
  }),
};

export default function OrderConfirmedPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();

  // Prefer data from location.state (no API call needed)
  const stateData = location.state || {};
  const [orderData, setOrderData] = useState({
    orderId: stateData.orderId || orderId,
    items:   stateData.items   || [],
    total:   stateData.total   || null,
  });
  const [loading, setLoading] = useState(!stateData.orderId);

  // Fallback: fetch if state was lost (e.g. page refresh)
  useEffect(() => {
    if (stateData.orderId) return;
    ordersApi
      .getOrderById(orderId)
      .then((res) => {
        const order = res.data || res;
        setOrderData({
          orderId: order._id,
          items:   order.items || [],
          total:   order.finalAmount ?? order.totalAmount ?? null,
        });
      })
      .catch(() => {/* show what we have */})
      .finally(() => setLoading(false));
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const shortId = (orderData.orderId || orderId || "").slice(-8).toUpperCase();

  return (
    <div className="oc-page">
      {/* ── Subtle floating paw decorations ── */}
      <img src={pawSvg}     className="oc-deco oc-deco--tl"  aria-hidden="true" alt="" />
      <img src={sparkleSvg} className="oc-deco oc-deco--tr"  aria-hidden="true" alt="" />
      <img src={pawSvg}     className="oc-deco oc-deco--bl"  aria-hidden="true" alt="" />
      <img src={sparkleSvg} className="oc-deco oc-deco--br"  aria-hidden="true" alt="" />
      <img src={pawSvg}     className="oc-deco oc-deco--mid" aria-hidden="true" alt="" />

      <div className="oc-inner">

        {/* ── Animated checkmark ── */}
        <motion.div
          className="oc-check-wrap"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
        >
          <svg viewBox="0 0 100 100" className="oc-check-svg" aria-hidden="true">
            <motion.circle
              cx="50" cy="50" r="46"
              fill="var(--color-primary-forest, #001c10)"
              stroke="var(--color-accent-gold, #D99A2B)"
              strokeWidth="4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            />
            <motion.path
              d="M 26 50 L 43 67 L 74 33"
              stroke="#fff"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.6, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>

        {/* ── Headline ── */}
        <motion.h1
          className="oc-title"
          custom={0}
          variants={childVariants}
          initial="hidden"
          animate="visible"
        >
          Order Confirmed! 🎉
        </motion.h1>

        <motion.p
          className="oc-subtitle"
          custom={1}
          variants={childVariants}
          initial="hidden"
          animate="visible"
        >
          We've received your order and will start preparing it right away.
          You'll get an update when it ships!
        </motion.p>

        {/* ── Order card ── */}
        <motion.div
          className="oc-card"
          custom={2}
          variants={childVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="oc-card-header">
            <span className="oc-order-label">Order</span>
            <span className="oc-order-id">#{shortId}</span>
          </div>

          {!loading && orderData.items.length > 0 && (
            <div className="oc-items">
              {orderData.items.map((item, i) => {
                // Support both raw CartContext items and API order items
                const name  = item.name || item.title || item.product?.name || "Product";
                const img   = item.image || item.product?.images?.[0] || null;
                const qty   = item.quantity || 1;
                const price = item.price || item.product?.price || 0;
                return (
                  <div key={item.id || item._id || i} className="oc-item">
                    {img && (
                      <img src={img} alt={name} className="oc-item-img" />
                    )}
                    <div className="oc-item-info">
                      <span className="oc-item-name">{name}</span>
                      <span className="oc-item-qty">Qty: {qty}</span>
                    </div>
                    <span className="oc-item-price">
                      ${(price * qty).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {orderData.total !== null && (
            <div className="oc-total-row">
              <span>Total paid</span>
              <strong>${Number(orderData.total).toFixed(2)}</strong>
            </div>
          )}
        </motion.div>

        {/* ── CTAs ── */}
        <motion.div
          className="oc-ctas"
          custom={3}
          variants={childVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            type="button"
            className="oc-btn oc-btn--primary"
            onClick={() => navigate("/my-orders")}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
          >
            <FaShoppingBag size={14} /> View My Orders
          </motion.button>

          <motion.button
            type="button"
            className="oc-btn oc-btn--outline"
            onClick={() => navigate("/petshop")}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
          >
            Continue Shopping
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
