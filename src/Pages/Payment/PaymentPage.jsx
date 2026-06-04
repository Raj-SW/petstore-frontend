// frontend/src/Pages/Payment/PaymentPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { FaLock, FaSpinner, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import paymentsApi from "../../Services/api/paymentsApi";
import { useToast } from "../../context/ToastContext";
import CheckoutStepper from "../../Components/HelperComponents/CheckoutStepper/CheckoutStepper";
import "./PaymentPage.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#001c10",
      fontFamily: "'Poppins', sans-serif",
      fontWeight: "500",
      "::placeholder": { color: "#b0b0b0" },
    },
    invalid: { color: "#ff6370" },
  },
};

// ── Inner form (must live inside <Elements>) ──
function CheckoutForm({ orderId, clientSecret, orderSummary }) {
  const stripe     = useStripe();
  const elements   = useElements();
  const navigate   = useNavigate();
  const { addToast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      addToast(error.message || "Payment failed. Please try again.", "error");
      setProcessing(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      try {
        await paymentsApi.confirmPayment(orderId, paymentIntent.id, "stripe");
      } catch {
        // Stripe webhook will reconcile — still navigate forward
      }
      navigate(`/order-confirmed/${orderId}`, {
        state: {
          orderId,
          items:  orderSummary?.items  || [],
          total:  orderSummary?.total  || 0,
        },
      });
    }
  };

  const btnAmount = orderSummary?.total
    ? `Pay $${orderSummary.total.toFixed(2)}`
    : "Pay Now";

  return (
    <form className="pmt-form" onSubmit={handleSubmit}>
      <div className="pmt-card-field-wrap">
        <label className="pmt-card-label">Card details</label>
        <div className="pmt-card-element">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {import.meta.env.DEV && (
        <p className="pmt-test-hint">
          <FaLock size={11} /> Test: 4242 4242 4242 4242 · any future date · any CVC
        </p>
      )}

      <motion.button
        type="submit"
        className="pmt-pay-btn"
        disabled={!stripe || processing}
        whileHover={!processing ? { y: -4 } : {}}
        whileTap={!processing ? { scale: 0.96, y: 0 } : {}}
        transition={{ type: "spring", stiffness: 420, damping: 14 }}
      >
        {processing ? (
          <><FaSpinner className="pmt-spin" size={14} /> Processing…</>
        ) : (
          <><FaLock size={13} /> {btnAmount}</>
        )}
      </motion.button>

      {processing && (
        <motion.p
          className="pmt-processing-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Confirming your payment securely, please don't close this page…
        </motion.p>
      )}

      <div className="pmt-trust-badges">
        <span><FaShieldAlt size={12} /> SSL Encrypted</span>
        <span><FaLock size={11} /> Powered by Stripe</span>
      </div>
    </form>
  );
}

// ── Outer page ──
export default function PaymentPage() {
  const { orderId }    = useParams();
  const navigate       = useNavigate();
  const location       = useLocation();
  const { addToast }   = useToast();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading]           = useState(true);

  // Order summary passed from CartCheckoutPage via location.state
  const orderSummary = location.state || null;

  useEffect(() => {
    paymentsApi
      .initializePayment(orderId)
      .then(({ clientSecret: cs }) => {
        setClientSecret(cs);
        setLoading(false);
      })
      .catch((err) => {
        addToast(err?.message || "Could not initialize payment.", "error");
        navigate("/checkout");
      });
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="pmt-page pmt-page--loading">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="pmt-loading-inner"
        >
          <FaSpinner className="pmt-spin" size={32} />
          <p>Initializing secure payment…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pmt-page">
      {/* Stepper shows step 3 */}
      <div className="pmt-stepper-wrap">
        <CheckoutStepper currentStep={3} />
      </div>

      <div className="pmt-layout">

        {/* ── Left: Order Summary ── */}
        <motion.aside
          className="pmt-summary"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
          <h2 className="pmt-summary-title">Order Summary</h2>

          {orderSummary?.items?.length > 0 ? (
            <div className="pmt-summary-items">
              {orderSummary.items.map((item) => (
                <div key={item.id} className="pmt-summary-item">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name || item.title}
                      className="pmt-summary-item-img"
                    />
                  )}
                  <div className="pmt-summary-item-info">
                    <span className="pmt-summary-item-name">
                      {item.name || item.title}
                    </span>
                    <span className="pmt-summary-item-qty">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="pmt-summary-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="pmt-summary-empty">Order details unavailable.</p>
          )}

          {orderSummary && (
            <div className="pmt-summary-totals">
              <div className="pmt-summary-row">
                <span>Subtotal</span>
                <span>${orderSummary.subtotal?.toFixed(2)}</span>
              </div>
              <div className="pmt-summary-row">
                <span>Shipping</span>
                <span>${orderSummary.shipping?.toFixed(2)}</span>
              </div>
              <div className="pmt-summary-divider" />
              <div className="pmt-summary-row pmt-summary-row--total">
                <span>Total due</span>
                <span>${orderSummary.total?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </motion.aside>

        {/* ── Right: Payment Form ── */}
        <motion.div
          className="pmt-form-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.1 }}
        >
          <div className="pmt-form-header">
            <FaLock size={16} />
            <h2>Secure Payment</h2>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              orderId={orderId}
              clientSecret={clientSecret}
              orderSummary={orderSummary}
            />
          </Elements>
        </motion.div>

      </div>
    </div>
  );
}
