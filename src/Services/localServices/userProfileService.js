import { api } from "../../core/api/apiClient"; // authenticated client

class UserProfileService {
  async updateUserProfile(profileData) {
    const response = await api.patch("/users/update-profile", profileData);
    return response.data;
  }

  async changePassword(passwordData) {
    const response = await api.patch("/users/change-password", passwordData);
    return response.data;
  }

  async addPet(petData) {
    const response = await api.post("/pets", petData);
    return response.data;
  }

  async updatePet(petId, petData) {
    const response = await api.patch(`/pets/${petId}`, petData);
    return response.data;
  }

  async deletePet(petId) {
    const response = await api.delete(`/pets/${petId}`);
    return response.data;
  }

  async getPet(petId) {
    const response = await api.get(`/pets/${petId}`);
    return response.data;
  }
}

export default new UserProfileService();
