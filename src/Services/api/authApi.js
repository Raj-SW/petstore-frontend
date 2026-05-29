// frontend/src/Services/api/authApi.js
import { api } from "../../core/api/apiClient";

const authApi = {
  // Returns { success, data: { user, accessToken } }
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Returns { success, message } — user must login separately after signup
  signup: async (userData) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  // No-op on server — token is cleared client-side in AuthContext
  logout: async () => {
    return { success: true };
  },

  // Get current user (used as background sync, not for initial auth check)
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  // Password management
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post("/auth/reset-password", { token, password });
    return response.data;
  },

  // Email verification
  resendVerification: async (email) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },

  // Profile management
  getProfile: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch("/users/update-profile", profileData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.patch("/users/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete("/users/delete-account");
    return response.data;
  },
};

export default authApi;
