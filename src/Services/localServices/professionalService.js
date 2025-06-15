import axios from "axios";

class ProfessionalService {
  static API_URL = import.meta.env.VITE_NODE_API_URL;
  // Fetch all professionals with optional filters
  static async getAll(params = {}) {
    try {
      const response = await axios.get(`${this.API_URL}/professionals`, {
        params,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch professionals"
      );
    }
  }

  // Fetch professionals by specialization
  static async getByRole(role) {
    try {
      const response = await axios.get(`${this.API_URL}/professionals`, {
        params: { role },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch professionals"
      );
    }
  }

  // Fetch a single professional by ID
  static async getById(id) {
    try {
      const response = await axios.get(`${this.API_URL}/professionals/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch professional"
      );
    }
  }
}

export default ProfessionalService;
