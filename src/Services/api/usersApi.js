import { api } from "../../core/api/apiClient";

const usersApi = {
  // Get all users with pagination and filters
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/users${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get single user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user (Admin only)
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Update user role (Admin only)
  updateUserRole: async (id, role) => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },

  // Block/Unblock user (Admin only)
  toggleUserStatus: async (id, isActive) => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get("/users/stats");
    return response.data;
  },

  // Search users
  searchUsers: async (searchTerm, params = {}) => {
    const queryParams = {
      search: searchTerm,
      ...params,
    };
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await api.get(`/users?${queryString}`);
    return response.data;
  },
  getUserPets: async () => {
    const response = await api.get(`/pets`);
    return response.data.data;
  },
};

export default usersApi;
