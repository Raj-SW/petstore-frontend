import { useState } from "react";
import { FiRepeat } from "react-icons/fi";
import subscriptionsApi from "../../Services/api/subscriptionsApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./SubscribeWidget.css";

const DISCOUNT = Number(import.meta.env.VITE_SUBSCRIPTION_DISCOUNT_PERCENT) || 10;

const SubscribeWidget = ({ product, quantity = 1 }) => {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState("week");
  const [count, setCount] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const minOk = (unit === "day" ? count : count * 7) >= 7;

  const subscribe = async () => {
    if (!user) {
      addToast("Please log in to subscribe", "error");
      return;
    }
    if (!minOk) {
      addToast("Minimum interval is 7 days", "error");
      return;
    }
    const addr = user.address
      ? { street: user.address, city: "-", state: "-", country: "-", zipCode: "-" }
      : { street: "-", city: "-", state: "-", country: "-", zipCode: "-" };
    try {
      setSubmitting(true);
      await subscriptionsApi.create({
        items: [{ product: product._id || product.id, quantity }],
        shippingAddress: addr,
        paymentMethod: "stripe",
        intervalUnit: unit,
        intervalCount: Number(count),
        source: "product",
      });
      addToast("Subscribed! Manage it under My Subscriptions.", "success");
      setOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to subscribe", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sw-box">
      <button className="sw-toggle" onClick={() => setOpen((o) => !o)}>
        <FiRepeat /> Subscribe &amp; Save {DISCOUNT}%
      </button>
      {open && (
        <div className="sw-panel">
          <p className="sw-line">Auto-reorder this item and save {DISCOUNT}% every time.</p>
          <div className="sw-row">
            <span>Every</span>
            <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="sw-count"
            />
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="day">day(s)</option>
              <option value="week">week(s)</option>
            </select>
          </div>
          {!minOk && <p className="sw-warn">Minimum interval is 7 days.</p>}
          <button className="sw-confirm" disabled={submitting || !minOk} onClick={subscribe}>
            {submitting ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscribeWidget;
