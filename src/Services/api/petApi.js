import { api } from "../../core/api/apiClient";

const petApi = {
  // Create a new pet
  createPet: async (petData) => {
    const response = await api.post("/pets", petData);
    return response.data;
  },

  // Get all user's pets
  getUserPets: async () => {
    const response = await api.get("/pets");
    console.log(response.data);
    return response.data;
  },

  // Get single pet by ID
  getPetById: async (petId) => {
    const response = await api.get(`/pets/${petId}`);
    return response.data;
  },

  // Update pet information
  updatePet: async (petId, petData) => {
    const response = await api.patch(`/pets/${petId}`, petData);
    return response.data;
  },

  // Delete pet
  deletePet: async (petId) => {
    const response = await api.delete(`/pets/${petId}`);
    return response.data;
  },
};

export default petApi;
