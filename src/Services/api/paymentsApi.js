// frontend/src/Services/api/paymentsApi.js
import { api } from "../../core/api/apiClient";

const paymentsApi = {
  // Initialize a Stripe PaymentIntent for an order.
  // Returns { clientSecret, paymentIntentId, orderId, paymentMethod }
  initializePayment: async (orderId, paymentMethod = "stripe") => {
    const response = await api.post(`/payments/orders/${orderId}/initialize`, {
      paymentMethod,
    });
    return response.data.data;
  },

  // Confirm payment after Stripe client-side confirmation.
  // paymentIntentId = the Stripe PaymentIntent id
  confirmPayment: async (orderId, paymentIntentId, paymentMethod = "stripe") => {
    const response = await api.post(`/payments/orders/${orderId}/confirm`, {
      paymentIntentId,
      paymentMethod,
    });
    return response.data.data;
  },
};

export default paymentsApi;
