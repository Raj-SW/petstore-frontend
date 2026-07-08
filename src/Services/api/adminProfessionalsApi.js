import { api } from "../../core/api/apiClient";

const adminProfessionalsApi = {
  list: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await api.get(`/admin/professionals${qs ? "?" + qs : ""}`);
    return res.data; // { success, data, pagination }
  },

  create: async (payload) => {
    const res = await api.post("/admin/professionals", payload);
    return res.data;
  },

  promote: async (payload) => {
    const res = await api.post("/admin/professionals/promote", payload);
    return res.data;
  },

  update: async (id, professionalInfo, role) => {
    const res = await api.patch(`/admin/professionals/${id}`, { professionalInfo, ...(role ? { role } : {}) });
    return res.data;
  },

  toggleStatus: async (id, isActive) => {
    const res = await api.patch(`/admin/professionals/${id}/status`, { isActive });
    return res.data;
  },

  offboard: async (id) => {
    const res = await api.delete(`/admin/professionals/${id}`);
    return res.data;
  },

  uploadImage: async (file) => {
    const form = new FormData();
    form.append("image", file);
    const res = await api.post("/admin/professionals/upload-image", form);
    return res.data; // { success, data: { url, publicId } }
  },

  // Reuse the admin users endpoint to find customers to promote.
  searchUsers: async (search) => {
    const qs = new URLSearchParams({ search, role: "customer" }).toString();
    const res = await api.get(`/admin/users?${qs}`);
    return res.data;
  },
};

export default adminProfessionalsApi;
