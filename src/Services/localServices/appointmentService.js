// Simulated appointment data
const appointments = [
  {
    id: 1,
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
  },
  {
    id: 2,
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
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const appointmentService = {
  // Get all appointments
  getAll: async () => {
    await delay(500);
    return [...appointments];
  },

  // Get appointment by ID
  getById: async (id) => {
    await delay(300);
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) throw new Error("Appointment not found");
    return { ...appointment };
  },

  // Create new appointment
  create: async (appointmentData) => {
    await delay(800);
    const newAppointment = {
      id: Math.max(...appointments.map((a) => a.id)) + 1,
      ...appointmentData,
      status: "Pending",
    };
    appointments.push(newAppointment);
    return { ...newAppointment };
  },

  // Update appointment
  update: async (id, appointmentData) => {
    await delay(600);
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Appointment not found");

    appointments[index] = {
      ...appointments[index],
      ...appointmentData,
    };
    return { ...appointments[index] };
  },

  // Delete appointment
  delete: async (id) => {
    await delay(400);
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Appointment not found");

    const deletedAppointment = appointments[index];
    appointments.splice(index, 1);
    return { ...deletedAppointment };
  },

  // Get appointments by status
  getByStatus: async (status) => {
    await delay(400);
    return appointments.filter((a) => a.status === status);
  },

  // Get appointments by type (vet/grooming)
  getByType: async (type) => {
    await delay(400);
    return appointments.filter((a) => a.type === type);
  },

  // Get appointments by date range
  getByDateRange: async (startDate, endDate) => {
    await delay(500);
    return appointments.filter((a) => {
      const appointmentDate = new Date(a.datetimeISO);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
  },

  // Get appointments by pet ID
  getByPetId: async (petId) => {
    await delay(400);
    return appointments.filter((a) => a.petId === petId);
  },

  // Get appointments by owner ID
  getByOwnerId: async (ownerId) => {
    await delay(400);
    return appointments.filter((a) => a.ownerId === ownerId);
  },

  // Update appointment status
  updateStatus: async (id, status) => {
    await delay(400);
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Appointment not found");

    appointments[index].status = status;
    return { ...appointments[index] };
  },

  // Check availability for a specific date and time
  checkAvailability: async (datetimeISO, duration, type) => {
    await delay(300);
    const requestedTime = new Date(datetimeISO);
    const endTime = new Date(requestedTime.getTime() + duration * 60000);

    return !appointments.some((a) => {
      const appointmentTime = new Date(a.datetimeISO);
      const appointmentEnd = new Date(
        appointmentTime.getTime() + a.duration * 60000
      );

      return (
        a.type === type &&
        ((requestedTime >= appointmentTime && requestedTime < appointmentEnd) ||
          (endTime > appointmentTime && endTime <= appointmentEnd) ||
          (requestedTime <= appointmentTime && endTime >= appointmentEnd))
      );
    });
  },
};
