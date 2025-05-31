class AppointmentService {
  static API_URL = import.meta.env.VITE_NODE_API_URL;

  // Helper method to handle API requests
  static async handleRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }

      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Get all appointments
  static async getAll() {
    const response = await this.handleRequest(`${this.API_URL}/appointments`);
    return response.data;
  }

  // Get appointment by ID
  static async getById(id) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}`
    );
    return response.data;
  }

  // Create new appointment
  static async create(appointmentData) {
    const response = await this.handleRequest(`${this.API_URL}/appointments`, {
      method: "POST",
      body: JSON.stringify(appointmentData),
    });
    return response.data;
  }

  // Update appointment status (accept/reject/cancel)
  static async updateStatus(id, status, notes) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      }
    );
    return response.data;
  }

  // Cancel appointment
  static async cancel(id, cancellationReason) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}/cancel`,
      {
        method: "PATCH",
        body: JSON.stringify({ cancellationReason }),
      }
    );
    return response.data;
  }

  // Get my appointments (for a user)
  static async getMyAppointments() {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/my-appointments`
    );
    return response.data;
  }

  // Get service provider's appointments
  static async getServiceProviderAppointments() {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/provider/appointments`
    );
    return response.data;
  }

  // Get appointments by professional ID
  static async getByProfessionalId(professionalId) {
    console.log("professionalId: ", professionalId);
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/professional/${professionalId}`
    );
    return response.data;
  }

  // Get appointments by owner ID
  static async getByOwner(ownerId) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/owner/${ownerId}`
    );
    return response.data;
  }

  // Get appointments by status
  static async getByStatus(status) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/status/${status}`
    );
    return response.data;
  }

  // Get appointments by type (vet/grooming)
  static async getByType(type) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/type/${type}`
    );
    return response.data;
  }

  // Get appointments by date range
  static async getByDateRange(startDate, endDate) {
    const response = await this.handleRequest(
      `${
        this.API_URL
      }/appointments/range?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    );
    return response.data;
  }

  // Get appointments by pet ID
  static async getByPetId(petId) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/pet/${petId}`
    );
    return response.data;
  }

  // Check availability for a specific date and time
  static async checkAvailability(datetimeISO, duration, type) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/check-availability`,
      {
        method: "POST",
        body: JSON.stringify({ datetimeISO, duration, type }),
      }
    );
    return response.data.available;
  }
}

export default AppointmentService;
