import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { FiRepeat } from "react-icons/fi";
import subscriptionsApi from "../../Services/api/subscriptionsApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import SubscriptionChooser from "./SubscriptionChooser";
import { isIntervalValid } from "../../utils/subscriptionPricing";
import "./SubscribeWidget.css";

const DISCOUNT = Number(import.meta.env.VITE_SUBSCRIPTION_DISCOUNT_PERCENT) || 10;

const SubscribeWidget = ({
  product,
  quantity = 1,
  variantId = null,
  unitPrice = 0,
  onAddToCart,
  outOfStock = false,
}) => {
  const [mode, setMode] = useState("onetime");
  const [unit, setUnit] = useState("week");
  const [count, setCount] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const intervalOk = isIntervalValid(unit, count);

  const subscribe = async () => {
    if (!user) {
      addToast("Please log in to subscribe", "error");
      return;
    }
    if (!intervalOk) {
      addToast("Minimum interval is 7 days", "error");
      return;
    }
    const addr = {
      street: user.address || "-", city: "-", state: "-", country: "-", zipCode: "-",
    };
    try {
      setSubmitting(true);
      await subscriptionsApi.create({
        items: [{ product: product._id || product.id, variantId: variantId || null, quantity }],
        shippingAddress: addr,
        paymentMethod: "stripe",
        intervalUnit: unit,
        intervalCount: Number(count),
        source: "product",
      });
      addToast("Subscribed! Manage it under My Subscriptions.", "success");
      setMode("onetime");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to subscribe", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const subscribeMode = mode === "subscribe";
  const buttonDisabled = subscribeMode ? submitting || !intervalOk : outOfStock;

  const handleClick = () => {
    if (subscribeMode) subscribe();
    else onAddToCart?.();
  };

  return (
    <div className="sw-box">
      <SubscriptionChooser
        basePrice={(Number(unitPrice) || 0) * quantity}
        discountPercent={DISCOUNT}
        mode={mode}
        onModeChange={setMode}
        intervalCount={count}
        intervalUnit={unit}
        onIntervalCountChange={setCount}
        onIntervalUnitChange={setUnit}
      />
      <button
        type="button"
        className="sw-smartbtn"
        disabled={buttonDisabled}
        onClick={handleClick}
      >
        {subscribeMode ? (
          <>
            <FiRepeat /> {submitting ? "Subscribing…" : `Subscribe & Save ${DISCOUNT}%`}
          </>
        ) : (
          <>
            <FaShoppingCart /> {outOfStock ? "Out of Stock" : "Add to Cart"}
          </>
        )}
      </button>
    </div>
  );
};

export default SubscribeWidget;
