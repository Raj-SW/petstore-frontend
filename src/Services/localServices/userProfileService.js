import axios from "axios";

const API_URL = import.meta.env.VITE_NODE_API_URL;

class UserProfileService {
  // User Profile Operations
  async getUserProfile() {
    try {
      const response = await axios.get(`${API_URL}/users/me`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserProfile(profileData) {
    try {
      const response = await axios.put(`${API_URL}/user/profile`, profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await axios.post(
        `${API_URL}/user/change-password`,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Pet Operations
  async getUserPets() {
    try {
      const response = await axios.get(`${API_URL}/user/pets`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addPet(petData) {
    try {
      const response = await axios.post(`${API_URL}/user/pets`, petData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePet(petId, petData) {
    try {
      const response = await axios.put(
        `${API_URL}/user/pets/${petId}`,
        petData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePet(petId) {
    try {
      const response = await axios.delete(`${API_URL}/user/pets/${petId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.message || "An error occurred";
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error("No response from server");
    } else {
      // Other errors
      throw new Error("Error setting up request");
    }
  }
}

export default new UserProfileService();
