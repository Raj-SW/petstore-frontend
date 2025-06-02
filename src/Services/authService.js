import axios from "axios";

const API_URL = import.meta.env.VITE_NODE_API_URL;

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class AuthService {
  async login(username, password) {
    try {
      const response = await authApi.post("/auth/login", {
        username,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signup(userData) {
    try {
      const response = await authApi.post("/auth/signup", userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateToken() {
    try {
      const response = await authApi.get("/auth/validate");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(userData) {
    try {
      const response = await authApi.put("/auth/user", userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      const response = await authApi.put("/auth/password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestPasswordReset(email) {
    try {
      const response = await authApi.post("/auth/reset-password", { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await authApi.post("/auth/reset-password/confirm", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem("token");
  }

  getCurrentUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      // Decode JWT token to get user info
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        message: error.response.data.message || "An error occurred",
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        message: "No response from server",
        status: 0,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        message: error.message || "An error occurred",
        status: 0,
      };
    }
  }
}

export default new AuthService();
