import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPause, FiPlay, FiSkipForward, FiX } from "react-icons/fi";
import subscriptionsApi from "../../Services/api/subscriptionsApi";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";
import "./MySubscriptions.css";

const intervalLabel = (unit, count) => `Every ${count} ${unit}${count > 1 ? "s" : ""}`;

const MySubscriptions = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await subscriptionsApi.getMine();
      setSubs(res.data || []);
    } catch {
      addToast("Failed to load subscriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  const act = async (id, data, msg) => {
    try {
      await subscriptionsApi.update(id, data);
      addToast(msg, "success");
      fetchSubs();
    } catch {
      addToast("Action failed", "error");
    }
  };

  const cancel = async (id) => {
    try {
      await subscriptionsApi.cancel(id);
      addToast("Subscription cancelled", "success");
      fetchSubs();
    } catch {
      addToast("Failed to cancel", "error");
    }
  };

  return (
    <motion.div
      className="ms-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="ms-title">My Subscriptions</h1>
      {loading && <p className="ms-empty">Loading…</p>}
      {!loading && subs.length === 0 && (
        <p className="ms-empty">You have no active subscriptions yet.</p>
      )}

      <div className="ms-list">
        {subs.map((s) => {
          let statusAction = null;
          if (s.status === "active") {
            statusAction = (
              <button onClick={() => act(s._id, { status: "paused" }, "Paused")}>
                <FiPause /> Pause
              </button>
            );
          } else if (s.status === "paused") {
            statusAction = (
              <button onClick={() => act(s._id, { status: "active" }, "Resumed")}>
                <FiPlay /> Resume
              </button>
            );
          }
          return (
          <div key={s._id} className={`ms-card ms-${s.status}`}>
            <div className="ms-card-head">
              <span className={`ms-status ms-status-${s.status}`}>{s.status}</span>
              <span className="ms-interval">{s.cadenceLabel || intervalLabel(s.intervalUnit, s.intervalCount)}</span>
            </div>
            <ul className="ms-items">
              {s.items.map((it, i) => (
                <li key={it.product?._id ? `${it.product._id}-${i}` : i} className="ms-item">
                  {it.product?.images?.[0]?.url && (
                    <img className="ms-item-img" src={it.product.images[0].url} alt="" loading="lazy" />
                  )}
                  <span className="ms-item-name">{(it.product?.name) || "Item"}</span>
                  {it.variantLabel ? ` · ${it.variantLabel}` : ""} × {it.quantity}
                </li>
              ))}
            </ul>
            {s.perCycleTotal != null && (
              <p className="ms-pricing">
                <span className="ms-percycle">{formatPrice(s.perCycleTotal)}</span>
                <span className="ms-percycle-label"> / delivery</span>
                {s.savings > 0 && <span className="ms-savings">You save {formatPrice(s.savings)}</span>}
              </p>
            )}
            <p className="ms-next">
              Next order: {s.nextRunAt ? new Date(s.nextRunAt).toLocaleDateString() : "—"}
              {s.discountPercent ? ` · ${s.discountPercent}% off` : ""}
            </p>
            {Array.isArray(s.orderHistory) && s.orderHistory.length > 0 && (
              <details className="ms-history">
                <summary>Past orders ({s.orderHistory.length})</summary>
                <ul>
                  {s.orderHistory.map((o) => (
                    <li key={o.id}>
                      {new Date(o.date).toLocaleDateString()} · {formatPrice(o.total)} · {o.status}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div className="ms-actions">
              {statusAction}
              <button onClick={() => act(s._id, { action: "skip" }, "Skipped next order")}>
                <FiSkipForward /> Skip next
              </button>
              <button className="ms-cancel" onClick={() => cancel(s._id)}>
                <FiX /> Cancel
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MySubscriptions;
