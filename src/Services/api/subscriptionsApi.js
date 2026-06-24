import { api } from "../../core/api/apiClient";

const subscriptionsApi = {
  create: async (payload) => {
    const response = await api.post("/subscriptions", payload);
    return response.data;
  },
  getMine: async () => {
    const response = await api.get("/subscriptions/mine");
    return response.data;
  },
  getMineOne: async (id) => {
    const response = await api.get(`/subscriptions/mine/${id}`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/subscriptions/${id}`, data);
    return response.data;
  },
  cancel: async (id) => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },
  // Admin
  getAllAdmin: async () => {
    const response = await api.get("/subscriptions/admin");
    return response.data;
  },
  getAdminOne: async (id) => {
    const response = await api.get(`/subscriptions/admin/${id}`);
    return response.data;
  },
  updateAdmin: async (id, data) => {
    const response = await api.patch(`/subscriptions/admin/${id}`, data);
    return response.data;
  },
  // Admin — demand-vs-stock prediction across active subscriptions
  getAnalytics: async (horizon = 30) => {
    const response = await api.get(`/subscriptions/admin/analytics?horizon=${horizon}`);
    return response.data?.data ?? response.data;
  },
  // Admin — productId -> { activeSubs, unitsPerCycle } for the product-list flag
  getProductCoverage: async () => {
    const response = await api.get("/subscriptions/admin/product-coverage");
    return response.data?.data ?? response.data;
  },
};

export default subscriptionsApi;
