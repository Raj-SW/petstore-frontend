import { api } from "../../core/api/apiClient";

const ordersApi = {
  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // Get user's orders
  getMyOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get all orders (Admin only)
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders/all${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (Admin only)
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Get order statistics (Admin only)
  getOrderStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders/stats${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Export orders (Admin only)
  exportOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders/export${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },
};

export default ordersApi;
