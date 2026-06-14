import { api } from "../../core/api/apiClient";

const feedbackApi = {
  // Public: submit feedback (multipart — name, role, rating, message, photos[])
  // Pass a pre-built FormData; do NOT set Content-Type manually (the browser
  // sets the multipart boundary automatically via the axios client).
  submitFeedback: async (formData) => {
    const response = await api.post("/feedback", formData);
    return response.data;
  },

  // Public: approved feedback only. params: { limit }
  getFeedback: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    const qs = new URLSearchParams(clean).toString();
    const response = await api.get(`/feedback${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  // Admin: all feedback
  getFeedbackAdmin: async () => {
    const response = await api.get("/feedback/admin/all");
    return response.data;
  },

  // Admin: update (e.g. approve/reject)
  updateFeedback: async (id, data) => {
    const response = await api.patch(`/feedback/${id}`, data);
    return response.data;
  },

  // Admin: delete
  deleteFeedback: async (id) => {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
  },
};

export default feedbackApi;
