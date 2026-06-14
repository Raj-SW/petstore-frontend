import { api } from "../../core/api/apiClient";

const contactApi = {
  // Public submit
  submitContact: async (data) => {
    const response = await api.post("/contact", data);
    return response.data;
  },

  // Admin: list submissions (paginated + stats)
  getContactsAdmin: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    const qs = new URLSearchParams(clean).toString();
    const response = await api.get(`/contact/admin/all${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  // Admin: update status (new | read | replied)
  updateContact: async (id, data) => {
    const response = await api.patch(`/contact/${id}`, data);
    return response.data;
  },

  // Admin: delete
  deleteContact: async (id) => {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },
};

export default contactApi;
