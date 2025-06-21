import { api } from "../../core/api/apiClient";

const appointmentsApi = {
  // Create appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post("/appointments", appointmentData);
    return response.data;
  },

  // Get user's appointments
  getMyAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/appointments${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get professional's appointments
  getProfessionalAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/appointments/professional-appointments${
        queryString ? `?${queryString}` : ""
      }`
    );
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (id, status) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  // Get professional's public appointments
  getProfessionalPublicAppointments: async (professionalId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/appointments/professional/${professionalId}${
        queryString ? `?${queryString}` : ""
      }`
    );
    return response.data;
  },

  // Get available time slots
  getAvailableSlots: async (professionalId, date) => {
    const response = await api.get(
      `/appointments/available-slots/${professionalId}`,
      {
        params: { date },
      }
    );
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (id, newDateTime) => {
    const response = await api.patch(`/appointments/${id}/reschedule`, {
      dateTime: newDateTime,
    });
    return response.data;
  },

  // Add notes to appointment
  addAppointmentNotes: async (id, notes) => {
    const response = await api.patch(`/appointments/${id}/notes`, { notes });
    return response.data;
  },

  // Get appointment statistics (Admin/Professional)
  getAppointmentStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/appointments/stats${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },
};

export default appointmentsApi;
