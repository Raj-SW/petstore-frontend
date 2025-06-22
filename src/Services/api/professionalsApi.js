import { api } from "../../core/api/apiClient";

const professionalsApi = {
  // Get all professionals with filters (supports ?role=petTaxi query)
  getProfessionals: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/professionals${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get professionals by role using path parameter
  getProfessionalsByRole: async (role) => {
    const response = await api.get(`/professionals/role/${role}`);
    return response.data.data;
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
    return response.data.data;
  },

  // Update professional profile (authenticated route)
  updateProfessional: async (id, professionalData) => {
    const response = await api.patch(
      `/professionals/${id}/profile`,
      professionalData
    );
    return response.data;
  },

  // Update professional availability (authenticated route)
  updateAvailability: async (id, availability) => {
    const response = await api.patch(`/professionals/${id}/availability`, {
      availability,
    });
    return response.data;
  },

  // Toggle professional active status (authenticated route)
  toggleProfessionalStatus: async (id, isActive) => {
    const response = await api.patch(`/professionals/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  // Update professional rating (authenticated route)
  updateProfessionalRating: async (id, rating) => {
    const response = await api.patch(`/professionals/${id}/rating`, { rating });
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

  // Get professional statistics
  getProfessionalStats: async (id) => {
    const response = await api.get(`/professionals/${id}/stats`);
    return response.data;
  },
};

export default professionalsApi;
