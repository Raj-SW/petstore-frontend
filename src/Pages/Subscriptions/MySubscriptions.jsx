import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPause, FiPlay, FiSkipForward, FiX, FiRepeat } from "react-icons/fi";
import subscriptionsApi from "../../Services/api/subscriptionsApi";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";
import SkeletonCard from "../../Components/HelperComponents/SkeletonCard/SkeletonCard";
import "./MySubscriptions.css";

const intervalLabel = (unit, count) => `Every ${count} ${unit}${count > 1 ? "s" : ""}`;

const MySubscriptions = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  // Id of the subscription with an action in flight — disables its buttons
  // (Skip could double-fire and skip two cycles on a fast double-click).
  const [busyId, setBusyId] = useState(null);
  // Cancel needs an explicit confirm step: one stray click irreversibly
  // cancelled a subscription. First click arms, second confirms.
  const [confirmCancelId, setConfirmCancelId] = useState(null);
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
    if (busyId) return;
    setBusyId(id);
    try {
      await subscriptionsApi.update(id, data);
      addToast(msg, "success");
      await fetchSubs();
    } catch {
      addToast("Action failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id) => {
    if (confirmCancelId !== id) {
      setConfirmCancelId(id);
      return;
    }
    if (busyId) return;
    setBusyId(id);
    try {
      await subscriptionsApi.cancel(id);
      addToast("Subscription cancelled", "success");
      await fetchSubs();
    } catch {
      addToast("Failed to cancel", "error");
    } finally {
      setBusyId(null);
      setConfirmCancelId(null);
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
      {!loading && subs.length === 0 && (
        <div className="ms-empty">
          <FiRepeat size={34} className="ms-empty-icon" aria-hidden="true" />
          <h2 className="ms-empty-title">No subscriptions yet</h2>
          <p className="ms-empty-text">
            Subscribe to your pet&apos;s favourites and they&apos;ll arrive on
            schedule — no reordering, and you save on every delivery.
          </p>
          <Link to="/petshop" className="ms-empty-cta">Browse the Shop</Link>
        </div>
      )}

      <div className="ms-list">
        {loading && <SkeletonCard variant="row" count={3} />}
        {subs.map((s) => {
          const busy = busyId === s._id;
          let statusAction = null;
          if (s.status === "active") {
            statusAction = (
              <button disabled={busy} onClick={() => act(s._id, { status: "paused" }, "Paused")}>
                <FiPause /> Pause
              </button>
            );
          } else if (s.status === "paused") {
            statusAction = (
              <button disabled={busy} onClick={() => act(s._id, { status: "active" }, "Resumed")}>
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
              <button disabled={busy} onClick={() => act(s._id, { action: "skip" }, "Skipped next order")}>
                <FiSkipForward /> Skip next
              </button>
              <button
                className={`ms-cancel${confirmCancelId === s._id ? " ms-cancel--confirm" : ""}`}
                disabled={busy}
                onClick={() => cancel(s._id)}
                onBlur={() => setConfirmCancelId((c) => (c === s._id ? null : c))}
              >
                <FiX /> {confirmCancelId === s._id ? "Tap again to confirm" : "Cancel"}
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
