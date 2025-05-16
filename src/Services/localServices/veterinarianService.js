// Simulated veterinarian data
const veterinarians = [
  {
    id: 1,
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@petstore.com",
    phone: "+230 345 6789",
    specialization: "General Practice",
    qualifications: ["DVM", "MSc Veterinary Medicine"],
    experience: "8 years",
    rating: 4.9,
    reviews: 78,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    availability: {
      monday: { start: "08:00", end: "16:00" },
      tuesday: { start: "08:00", end: "16:00" },
      wednesday: { start: "08:00", end: "16:00" },
      thursday: { start: "08:00", end: "16:00" },
      friday: { start: "08:00", end: "16:00" },
    },
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    email: "michael.chen@petstore.com",
    phone: "+230 456 7890",
    specialization: "Surgery",
    qualifications: ["DVM", "Board Certified Surgeon"],
    experience: "12 years",
    rating: 4.7,
    reviews: 65,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    availability: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
    },
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const veterinarianService = {
  // Get all veterinarians
  getAll: async () => {
    await delay(500);
    return [...veterinarians];
  },

  // Get veterinarian by ID
  getById: async (id) => {
    await delay(300);
    const vet = veterinarians.find((v) => v.id === id);
    if (!vet) throw new Error("Veterinarian not found");
    return { ...vet };
  },

  // Create new veterinarian
  create: async (vetData) => {
    await delay(800);
    const newVet = {
      id: Math.max(...veterinarians.map((v) => v.id)) + 1,
      ...vetData,
      rating: 0,
      reviews: 0,
    };
    veterinarians.push(newVet);
    return { ...newVet };
  },

  // Update veterinarian
  update: async (id, vetData) => {
    await delay(600);
    const index = veterinarians.findIndex((v) => v.id === id);
    if (index === -1) throw new Error("Veterinarian not found");

    veterinarians[index] = {
      ...veterinarians[index],
      ...vetData,
    };
    return { ...veterinarians[index] };
  },

  // Delete veterinarian
  delete: async (id) => {
    await delay(400);
    const index = veterinarians.findIndex((v) => v.id === id);
    if (index === -1) throw new Error("Veterinarian not found");

    const deletedVet = veterinarians[index];
    veterinarians.splice(index, 1);
    return { ...deletedVet };
  },

  // Get veterinarian availability
  getAvailability: async (id) => {
    await delay(300);
    const vet = veterinarians.find((v) => v.id === id);
    if (!vet) throw new Error("Veterinarian not found");
    return { ...vet.availability };
  },

  // Update veterinarian availability
  updateAvailability: async (id, availability) => {
    await delay(600);
    const index = veterinarians.findIndex((v) => v.id === id);
    if (index === -1) throw new Error("Veterinarian not found");

    veterinarians[index].availability = {
      ...veterinarians[index].availability,
      ...availability,
    };
    return { ...veterinarians[index].availability };
  },

  // Get veterinarians by specialization
  getBySpecialization: async (specialization) => {
    await delay(400);
    return veterinarians.filter((v) => v.specialization === specialization);
  },
};
