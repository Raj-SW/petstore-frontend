import { api } from "../../core/api/apiClient";

const ordersApi = {
  // Create a new order (customer)
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // Get the logged-in user's own orders (customer)
  getMyOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders/my-orders${queryString ? "?" + queryString : ""}`
    );
    return response.data;
  },

  // Get ALL orders (Admin only)
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders${queryString ? "?" + queryString : ""}`
    );
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (Admin only) — PATCH not PUT
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order — PATCH /orders/:id/cancel, not DELETE /orders/:id
  cancelOrder: async (id) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },
};

export default ordersApi;
