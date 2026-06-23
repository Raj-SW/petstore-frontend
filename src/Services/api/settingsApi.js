import { api } from "../../core/api/apiClient";

const settingsApi = {
  // Public — shipping/tax config (checkout + admin)
  getSettings: async () => {
    const res = await api.get("/settings");
    return res.data?.data ?? res.data;
  },

  // Admin — update store shipping/tax settings
  updateSettings: async (patch) => {
    const res = await api.patch("/settings", patch);
    return res.data?.data ?? res.data;
  },
};

export default settingsApi;
