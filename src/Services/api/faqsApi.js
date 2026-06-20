import { api } from "../../core/api/apiClient";

const faqsApi = {
  // Public — active FAQs, ordered
  getFaqs: async () => {
    const response = await api.get("/faqs");
    return response.data;
  },

  // Admin
  getFaqsAdmin: async () => {
    const response = await api.get("/faqs/admin/all");
    return response.data;
  },
  createFaq: async (data) => {
    const response = await api.post("/faqs", data);
    return response.data;
  },
  updateFaq: async (id, data) => {
    const response = await api.patch(`/faqs/${id}`, data);
    return response.data;
  },
  deleteFaq: async (id) => {
    const response = await api.delete(`/faqs/${id}`);
    return response.data;
  },
};

export default faqsApi;
