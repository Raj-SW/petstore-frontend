import axios from "axios";

const API_URL = import.meta.env.VITE_NODE_API_URL;

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

class AuthService {
  async login(username, password) {
    try {
      const response = await authApi.post("/auth/login", {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await authApi.post("/auth/logout");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return error.response.data;
    }
    return { message: "An unexpected error occurred" };
  }
}

export default new AuthService();
