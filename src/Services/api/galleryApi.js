import { api } from "../../core/api/apiClient";

const galleryApi = {
  // Public list — params: category, tag, featured, search, page, limit
  getPosts: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    const qs = new URLSearchParams(clean).toString();
    const response = await api.get(`/gallery${qs ? "?" + qs : ""}`);
    return response.data;
  },

  // Public single by slug or id (returns { data, related })
  getPost: async (idOrSlug) => {
    const response = await api.get(`/gallery/${idOrSlug}`);
    return response.data;
  },

  // Admin: all posts incl. drafts
  getPostsAdmin: async () => {
    const response = await api.get("/gallery/admin/all");
    return response.data;
  },

  // Admin: single post incl. draft
  getPostAdmin: async (id) => {
    const response = await api.get(`/gallery/admin/${id}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post("/gallery", postData);
    return response.data;
  },

  updatePost: async (id, postData) => {
    const response = await api.patch(`/gallery/${id}`, postData);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  },

  // Admin: upload one image → returns the Cloudinary URL string
  uploadImage: async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const response = await api.post("/gallery/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data?.url;
  },
};

export default galleryApi;
