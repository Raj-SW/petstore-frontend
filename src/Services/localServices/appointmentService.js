import axios from "axios";

class AppointmentService {
  static API_URL = import.meta.env.VITE_NODE_API_URL;
  static MAX_RETRIES = 3;
  static TIMEOUT = 5000;

  static async handleRequest(url, options = {}, retryCount = 0) {
    try {
      const response = await axios({
        url,
        ...options,
        timeout: this.TIMEOUT,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      return response;
    } catch (error) {
      if (error.response?.status === 429 && retryCount < this.MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000)
        );
        return this.handleRequest(url, options, retryCount + 1);
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout");
      }

      console.error("API Error:", error);
      throw error;
    }
  }

  // Get all appointments
  static async getAllMyAppointments() {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/my-appointments`
    );
    return response.data.data;
  }

  // Get appointment by ID
  static async getById(id) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}`
    );
    return response.data.data;
  }

  // Create new appointment
  static async create(appointmentData) {
    const response = await this.handleRequest(`${this.API_URL}/appointments`, {
      method: "POST",
      data: appointmentData,
    });
    return response.data.data;
  }

  // Update appointment
  static async update(id, appointmentData) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}`,
      {
        method: "PUT",
        data: appointmentData,
      }
    );
    return response.data.data;
  }

  // Update appointment status
  static async updateStatus(id, status, notes) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}/status`,
      {
        method: "PATCH",
        data: { status, notes },
      }
    );
    return response.data.data;
  }

  // Delete appointment
  static async delete(id) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}`,
      {
        method: "DELETE",
      }
    );
    return response.data.data;
  }

  // Get appointments by type
  static async getAllMyAppointmentsByType(type) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/type/${type}`
    );
    return response.data.data;
  }

  // Get appointments by date range
  static async getByDateRange(startDate, endDate) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/range`,
      {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      }
    );
    return response.data.data;
  }

  // Check availability
  static async checkAvailability(datetimeISO, duration, type) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/check-availability`,
      {
        method: "POST",
        data: { datetimeISO, duration, type },
      }
    );
    return response.data.available;
  }

  // Get my appointments (for a user)
  static async getMyAppointments() {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/my-appointments`
    );
    return response.data.data;
  }

  // Get service provider's appointments
  static async getServiceProviderAppointments() {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/provider/appointments`
    );
    return response.data.data;
  }

  // Get appointments by professional ID
  static async getByProfessionalId(professionalId) {
    console.log("professionalId: ", professionalId);
    const response = await this.handleRequest(
      `${this.API_URL}/professionals/${professionalId}`
    );
    return response.data.data;
  }

  // Get appointments by owner ID
  static async getByOwner(ownerId) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/owner/${ownerId}`
    );
    return response.data.data;
  }

  // Get appointments by status
  static async getByStatus(status) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/status/${status}`
    );
    return response.data.data;
  }

  // Get appointments by pet ID
  static async getByPetId(petId) {
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/pet/${petId}`
    );
    return response.data.data;
  }

  // Fetch appointments for a specific professional (using axios)
  static async getProfessionalAppointments(professionalId) {
    try {
      const API_URL = import.meta.env.VITE_NODE_API_URL;
      const response = await axios.get(
        `${API_URL}/appointments/professional/${professionalId}`,
        { withCredentials: true }
      );
      console.log("Professional Appointments response: ", response.data);
      return response.data; // returns the whole response, e.g. { success, data, pagination }
    } catch (error) {
      console.error("Error fetching professional appointments:", error);
      throw error;
    }
  }
}

export default AppointmentService;
