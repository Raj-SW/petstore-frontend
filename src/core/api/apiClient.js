// frontend/src/core/api/apiClient.js
import axios from "axios";

const API_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_NODE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expired or invalid — trigger logout across the app
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }

      if (status === 403 && data?.message?.includes('deactivated')) {
        // Account deactivated by admin — force logout
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }

      return Promise.reject({
        status,
        message: data?.message || data?.error || "An error occurred",
        data: data,
        originalError: error,
      });
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message: "Network error - please check your connection",
        originalError: error,
      });
    }

    return Promise.reject({
      status: -1,
      message: error.message || "An unexpected error occurred",
      originalError: error,
    });
  }
);

export default apiClient;

export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};
