import { api } from "../../core/api/apiClient";

const announcementsApi = {
  // Admin: create + send an announcement
  // payload: { subject, message?, productIds: [], source?: 'inline' | 'composer' }
  createAnnouncement: async (payload) => {
    const response = await api.post("/announcements", payload);
    return response.data;
  },

  // Admin: campaign history
  getAnnouncements: async () => {
    const response = await api.get("/announcements");
    return response.data;
  },
};

export default announcementsApi;
