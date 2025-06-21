import { api } from "../../core/api/apiClient";

const professionalsApi = {
  // Get all professionals with filters
  getProfessionals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/professionals${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get professionals by role
  getProfessionalsByRole: async (role, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/professionals/role/${role}${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get available professionals
  getAvailableProfessionals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/professionals/available${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get single professional by ID
  getProfessionalById: async (id) => {
    const response = await api.get(`/professionals/${id}`);
    return response.data;
  },

  // Update professional info
  updateProfessional: async (id, professionalData) => {
    const response = await api.put(`/professionals/${id}`, professionalData);
    return response.data;
  },

  // Update professional rating
  updateProfessionalRating: async (id, rating) => {
    const response = await api.post(`/professionals/${id}/rating`, { rating });
    return response.data;
  },

  // Get professional appointments
  getProfessionalAppointments: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/appointments/professional/${id}${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Update professional availability
  updateAvailability: async (id, availability) => {
    const response = await api.patch(`/professionals/${id}/availability`, {
      availability,
    });
    return response.data;
  },

  // Toggle professional active status
  toggleProfessionalStatus: async (id, isActive) => {
    const response = await api.patch(`/professionals/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  // Get professional statistics
  getProfessionalStats: async (id) => {
    const response = await api.get(`/professionals/${id}/stats`);
    return response.data;
  },
};

export default professionalsApi;
