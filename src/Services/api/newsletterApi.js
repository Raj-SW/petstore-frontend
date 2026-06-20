import { api } from "../../core/api/apiClient";

const newsletterApi = {
  // Public subscribe
  subscribe: async (email) => {
    const response = await api.post("/newsletter", { email });
    return response.data;
  },

  // Admin list
  getSubscribersAdmin: async () => {
    const response = await api.get("/newsletter/admin/all");
    return response.data;
  },
};

export default newsletterApi;
