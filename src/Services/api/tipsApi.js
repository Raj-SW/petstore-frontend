import { api } from "../../core/api/apiClient";

const tipsApi = {
  // Public list — params: animalType, category, difficulty, featured, search, exclude, page, limit
  getTips: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    const qs = new URLSearchParams(clean).toString();
    const response = await api.get(`/tips${qs ? "?" + qs : ""}`);
    return response.data;
  },

  // Public single by slug or id
  getTip: async (idOrSlug) => {
    const response = await api.get(`/tips/${idOrSlug}`);
    return response.data;
  },

  // Admin: all tips incl. drafts
  getTipsAdmin: async () => {
    const response = await api.get("/tips/admin/all");
    return response.data;
  },

  // Admin: single tip incl. draft
  getTipAdmin: async (id) => {
    const response = await api.get(`/tips/admin/${id}`);
    return response.data;
  },

  createTip: async (tipData) => {
    const response = await api.post("/tips", tipData);
    return response.data;
  },

  updateTip: async (id, tipData) => {
    const response = await api.patch(`/tips/${id}`, tipData);
    return response.data;
  },

  deleteTip: async (id) => {
    const response = await api.delete(`/tips/${id}`);
    return response.data;
  },
};

export default tipsApi;
