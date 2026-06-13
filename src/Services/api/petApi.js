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

  // Add photos to a pet (gallery, max 6). files = File[] or FileList
  addPetImages: async (petId, files) => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("petImages", f));
    // Don't set Content-Type manually — let the browser add the multipart boundary.
    const response = await api.post(`/pets/${petId}/images`, form);
    return response.data; // { success, data: pet }
  },

  // Delete one photo by its Cloudinary publicId
  deletePetImage: async (petId, publicId) => {
    const response = await api.delete(
      `/pets/${petId}/images/${encodeURIComponent(publicId)}`
    );
    return response.data;
  },

  // Set a photo as the cover (move to index 0)
  setPrimaryPetImage: async (petId, publicId) => {
    const response = await api.patch(
      `/pets/${petId}/images/${encodeURIComponent(publicId)}/primary`
    );
    return response.data;
  },
};

export default petApi;
