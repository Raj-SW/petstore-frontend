import axios from "axios";

const API_URL =
  import.meta.env.VITE_NODE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Always send cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;

      // Log errors in development
      if (import.meta.env.DEV) {
        console.error(`[API Error] ${status} ${error.config.url}`, data);
      }

      // Handle authentication errors
      if (status === 401) {
        // Redirect to login or handle session expiry
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }

      // Return a consistent error format
      return Promise.reject({
        status,
        message: data?.message || data?.error || "An error occurred",
        data: data,
        originalError: error,
      });
    }

    // Handle network errors
    if (error.request) {
      return Promise.reject({
        status: 0,
        message: "Network error - please check your connection",
        originalError: error,
      });
    }

    // Handle other errors
    return Promise.reject({
      status: -1,
      message: error.message || "An unexpected error occurred",
      originalError: error,
    });
  }
);

export default apiClient;

// Helper methods for common HTTP operations
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};
