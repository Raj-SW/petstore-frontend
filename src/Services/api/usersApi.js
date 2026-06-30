import { api } from "../../core/api/apiClient";

const usersApi = {
  // Get all users with pagination and optional role filter (Admin only)
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/admin/users${queryString ? "?" + queryString : ""}`
    );
    return response.data;
  },

  // Update user role (Admin only)
  updateUserRole: async (id, role) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Toggle user active/inactive status (Admin only)
  toggleUserStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  // Delete user and cascade-delete related data (Admin only)
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Get pets belonging to the logged-in user
  getUserPets: async () => {
    const response = await api.get(`/pets`);
    return response.data.data;
  },

  // Upload/replace the current user's profile photo
  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append("avatar", file);
    // Don't set Content-Type manually — let the browser add the multipart boundary.
    const response = await api.patch("/users/upload-avatar", form);
    return response.data; // { success, data: { profileImage } }
  },
};

export default usersApi;
