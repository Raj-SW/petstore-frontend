// Simulated appointment data
const appointments = [
  {
    _id: 1,
    title: "Dr. Sarah Wilson",
    datetimeISO: "2025-05-16T09:00:00",
    description: "Annual wellness exam for Bella",
    status: "Confirmed",
    type: "vet",
    role: "Veterinarian",
    location: "Trou Aux Biches",
    icon: "https://randomuser.me/api/portraits/women/44.jpg",
    petId: 1,
    petName: "Bella",
    petType: "Dog",
    ownerId: 1,
    ownerName: "John Smith",
    duration: 60, // minutes
    notes: "Regular checkup and vaccinations",
    professionalId: 1,
    professionalName: "Dr. Sarah Wilson",
  },
  {
    _id: 2,
    title: "Emma Thompson",
    datetimeISO: "2025-05-16T11:00:00",
    description: "Full groom and nail trim",
    status: "Pending",
    type: "grooming",
    role: "Groomer",
    location: "Grand Baie",
    icon: "https://randomuser.me/api/portraits/women/68.jpg",
    petId: 2,
    petName: "Max",
    petType: "Cat",
    ownerId: 2,
    ownerName: "Sarah Johnson",
    duration: 90, // minutes
    notes: "Include flea treatment",
    professionalId: 2,
    professionalName: "Emma Thompson",
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class AppointmentService {
  static API_URL = import.meta.env.VITE_NODE_API_URL;
  static USE_MOCK_DATA = true; // Set to false when backend is ready

  // Helper method to handle API requests
  static async handleRequest(url, options = {}) {
    if (this.USE_MOCK_DATA) {
      await delay(500); // Simulate network delay
      return { data: [...appointments] };
    }

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
    if (this.USE_MOCK_DATA) {
      await delay(300);
      const appointment = appointments.find((a) => a._id === id);
      if (!appointment) throw new Error("Appointment not found");
      return appointment;
    }
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}`
    );
    return response.data;
  }

  // Create new appointment
  static async create(appointmentData) {
    if (this.USE_MOCK_DATA) {
      await delay(800);
      const newAppointment = {
        _id: Math.max(...appointments.map((a) => a._id)) + 1,
        ...appointmentData,
        status: "Pending",
      };
      appointments.push(newAppointment);
      return newAppointment;
    }
    const response = await this.handleRequest(`${this.API_URL}/appointments`, {
      method: "POST",
      body: JSON.stringify(appointmentData),
    });
    return response.data;
  }

  // Update appointment
  static async update(id, appointmentData) {
    if (this.USE_MOCK_DATA) {
      await delay(600);
      const index = appointments.findIndex((a) => a._id === id);
      if (index === -1) throw new Error("Appointment not found");
      appointments[index] = { ...appointments[index], ...appointmentData };
      return appointments[index];
    }
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(appointmentData),
      }
    );
    return response.data;
  }

  // Delete appointment
  static async delete(id) {
    if (this.USE_MOCK_DATA) {
      await delay(400);
      const index = appointments.findIndex((a) => a._id === id);
      if (index === -1) throw new Error("Appointment not found");
      const deletedAppointment = appointments[index];
      appointments.splice(index, 1);
      return deletedAppointment;
    }
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}`,
      {
        method: "DELETE",
      }
    );
    return response.data;
  }

  // Get appointments by status
  static async getByStatus(status) {
    if (this.USE_MOCK_DATA) {
      await delay(400);
      return appointments.filter((a) => a.status === status);
    }
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/status/${status}`
    );
    return response.data;
  }

  // Get appointments by type (vet/grooming)
  static async getByType(type) {
    if (this.USE_MOCK_DATA) {
      await delay(400);
      return appointments.filter((a) => a.type === type);
    }
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/type/${type}`
    );
    return response.data;
  }

  // Get appointments by date range
  static async getByDateRange(startDate, endDate) {
    if (this.USE_MOCK_DATA) {
      await delay(400);
      return appointments.filter((a) => {
        const date = new Date(a.datetimeISO);
        return date >= startDate && date <= endDate;
      });
    }
    const response = await this.handleRequest(
      `${
        this.API_URL
      }/appointments/range?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    );
    return response.data;
  }

  // Get appointments by pet ID
  static async getByPetId(petId) {
    if (this.USE_MOCK_DATA) {
      await delay(400);
      return appointments.filter((a) => a.petId === petId);
    }
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/pet/${petId}`
    );
    return response.data;
  }

  // Get appointments by owner ID
  static async getByOwnerId(ownerId) {
    if (this.USE_MOCK_DATA) {
      await delay(400);
      return appointments.filter((a) => a.ownerId === ownerId);
    }
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/owner/${ownerId}`
    );
    return response.data;
  }

  // Get appointments by professional ID
  static async getByProfessional(professionalId) {
    if (this.USE_MOCK_DATA) {
      await delay(400);
      const professionalAppointments = appointments.filter(
        (a) => a.professionalId === professionalId
      );
      return professionalAppointments.map((appointment) => ({
        id: appointment._id.toString(),
        title: appointment.title,
        start: appointment.datetimeISO,
        end: new Date(
          new Date(appointment.datetimeISO).getTime() +
            appointment.duration * 60000
        ),
        backgroundColor: appointment.type === "vet" ? "#28a745" : "#007bff",
        borderColor: appointment.type === "vet" ? "#28a745" : "#007bff",
        textColor: "#ffffff",
        extendedProps: {
          description: appointment.description,
          status: appointment.status,
          location: appointment.location,
          role: appointment.role,
          petName: appointment.petName,
          ownerName: appointment.ownerName,
          duration: appointment.duration,
          notes: appointment.notes,
        },
      }));
    }
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/professional/${professionalId}`
    );
    const appointments = response.data;

    // Convert appointments to FullCalendar events format
    return appointments.map((appointment) => ({
      id: appointment._id.toString(),
      title: appointment.title,
      start: appointment.datetimeISO,
      end: new Date(
        new Date(appointment.datetimeISO).getTime() +
          appointment.duration * 60000
      ),
      backgroundColor: appointment.type === "vet" ? "#28a745" : "#007bff",
      borderColor: appointment.type === "vet" ? "#28a745" : "#007bff",
      textColor: "#ffffff",
      extendedProps: {
        description: appointment.description,
        status: appointment.status,
        location: appointment.location,
        role: appointment.role,
        petName: appointment.petName,
        ownerName: appointment.ownerName,
        duration: appointment.duration,
        notes: appointment.notes,
      },
    }));
  }

  // Update appointment status
  static async updateStatus(id, status) {
    if (this.USE_MOCK_DATA) {
      await delay(400);
      const index = appointments.findIndex((a) => a._id === id);
      if (index === -1) throw new Error("Appointment not found");
      appointments[index].status = status;
      return appointments[index];
    }
    const response = await this.handleRequest(
      `${this.API_URL}/appointments/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
    return response.data;
  }

  // Check availability for a specific date and time
  static async checkAvailability(datetimeISO, duration, type) {
    if (this.USE_MOCK_DATA) {
      await delay(400);
      const date = new Date(datetimeISO);
      const endTime = new Date(date.getTime() + duration * 60000);

      // Check if there are any overlapping appointments
      const hasOverlap = appointments.some((appointment) => {
        const apptStart = new Date(appointment.datetimeISO);
        const apptEnd = new Date(
          apptStart.getTime() + appointment.duration * 60000
        );
        return (
          (date >= apptStart && date < apptEnd) ||
          (endTime > apptStart && endTime <= apptEnd) ||
          (date <= apptStart && endTime >= apptEnd)
        );
      });

      return !hasOverlap;
    }
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
