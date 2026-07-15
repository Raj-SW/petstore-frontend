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
    // For multipart uploads (FormData), strip the default JSON Content-Type so the
    // browser sets "multipart/form-data" with the correct boundary. Without this,
    // the instance default application/json sticks and the server can't parse files.
    if (config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Endpoints where a 401 means "wrong credentials supplied in this request",
// not "your session is invalid" — they must NOT nuke the current session
// (e.g. a typo'd current password in change-password logged users out).
const CREDENTIAL_CHECK_PATHS = ["/auth/login", "/users/change-password"];

const isCredentialCheck = (url = "") =>
  CREDENTIAL_CHECK_PATHS.some((path) => url.includes(path));

// Handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401 && !isCredentialCheck(error.config?.url)) {
        // Token expired or invalid — trigger logout across the app
        globalThis.window.dispatchEvent(new CustomEvent("auth:logout"));
      }

      if (status === 403 && data?.message?.includes('deactivated')) {
        // Account deactivated by admin — force logout
        globalThis.window.dispatchEvent(new CustomEvent("auth:logout"));
      }

      // 413 from Vercel/nginx comes back as HTML with no JSON body
      const message =
        status === 413
          ? "File too large. Please use images under 15 MB and try again."
          : data?.message || data?.error || "An error occurred";

      const apiError = new Error(message);
      apiError.status = status;
      apiError.data = data;
      apiError.originalError = error;
      return Promise.reject(apiError);
    }

    if (error.request) {
      const networkError = new Error("Network error - please check your connection");
      networkError.status = 0;
      networkError.originalError = error;
      return Promise.reject(networkError);
    }

    const unexpectedError = new Error(error.message || "An unexpected error occurred");
    unexpectedError.status = -1;
    unexpectedError.originalError = error;
    return Promise.reject(unexpectedError);
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
