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
  updateAdmin: async (id, data) => {
    const response = await api.patch(`/subscriptions/admin/${id}`, data);
    return response.data;
  },
};

export default subscriptionsApi;
