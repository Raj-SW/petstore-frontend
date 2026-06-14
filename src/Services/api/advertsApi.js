import { api } from "../../core/api/apiClient";

const advertsApi = {
  // Public active adverts — params: placement ("banner" | "sponsored")
  getAdverts: async (placement) => {
    const qs = placement ? `?placement=${placement}` : "";
    const response = await api.get(`/adverts${qs}`);
    return response.data;
  },

  // Admin: all adverts incl. inactive
  getAdvertsAdmin: async () => {
    const response = await api.get("/adverts/admin/all");
    return response.data;
  },

  createAdvert: async (advertData) => {
    const response = await api.post("/adverts", advertData);
    return response.data;
  },

  updateAdvert: async (id, advertData) => {
    const response = await api.patch(`/adverts/${id}`, advertData);
    return response.data;
  },

  deleteAdvert: async (id) => {
    const response = await api.delete(`/adverts/${id}`);
    return response.data;
  },

  // Admin: upload one banner image → returns the Cloudinary URL string
  uploadImage: async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const response = await api.post("/adverts/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data?.url;
  },
};

export default advertsApi;
