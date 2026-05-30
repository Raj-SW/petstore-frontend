// frontend/src/Pages/Payment/PaymentPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { FaLock, FaSpinner, FaCheckCircle } from "react-icons/fa";
import paymentsApi from "../../Services/api/paymentsApi";
import { useToast } from "../../context/ToastContext";
import "./PaymentPage.css";

// Load Stripe once outside of component render to avoid re-creating on re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: "inherit",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444" },
  },
};

// Inner component — must be rendered inside <Elements> to access useStripe/useElements
function CheckoutForm({ orderId, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    // Confirm the payment on the Stripe side using the clientSecret
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
        // Notify our backend that the payment succeeded
        await paymentsApi.confirmPayment(orderId, paymentIntent.id, "stripe");
      } catch {
        // Payment went through on Stripe but backend confirmation failed.
        // The Stripe webhook will reconcile it. We still navigate forward.
        addToast("Payment received! Your order will be confirmed shortly.", "success");
      }
      setSucceeded(true);
      setTimeout(() => navigate("/my-orders"), 2200);
    }
  };

  if (succeeded) {
    return (
      <div className="payment-success">
        <FaCheckCircle size={52} className="payment-success-icon" />
        <h2>Payment Successful!</h2>
        <p>Redirecting to your orders…</p>
      </div>
    );
  }

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <div className="payment-card-field">
        <label className="payment-card-label">Card details</label>
        <div className="payment-card-element">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <p className="payment-test-hint">
        <FaLock size={11} /> Test card: 4242 4242 4242 4242 · any future date · any CVC
      </p>

      <button
        type="submit"
        className="payment-btn"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <FaSpinner className="spin" size={14} />
            Processing…
          </>
        ) : (
          <>
            <FaLock size={13} />
            Pay Now
          </>
        )}
      </button>
    </form>
  );
}

// Outer component — initializes Stripe and fetches the clientSecret
export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="payment-page payment-page--loading">
        <FaSpinner className="spin" size={28} />
        <p>Initializing secure payment…</p>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <motion.div
        className="payment-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="payment-header">
          <FaLock size={16} />
          <h2>Secure Payment</h2>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm orderId={orderId} clientSecret={clientSecret} />
        </Elements>
      </motion.div>
    </div>
  );
}
