// Simulated veterinarian data
const veterinarians = [
  {
    id: 1,
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@petstore.com",
    phone: "+230 345 6789",
    specialization: "General Practice",
    qualifications: ["DVM", "MSc Veterinary Medicine"],
    experience: 8,
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
    experience: 12,
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
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@petstore.com",
    phone: "+230 567 8901",
    specialization: "Dermatology",
    qualifications: ["DVM", "Diplomate ACVD"],
    experience: 6,
    rating: 4.8,
    reviews: 45,
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    availability: {
      monday: { start: "10:00", end: "18:00" },
      tuesday: { start: "10:00", end: "18:00" },
      wednesday: { start: "10:00", end: "18:00" },
      thursday: { start: "10:00", end: "18:00" },
      friday: { start: "10:00", end: "18:00" },
    },
  },
  {
    id: 4,
    name: "Dr. James Thompson",
    email: "james.thompson@petstore.com",
    phone: "+230 678 9012",
    specialization: "Cardiology",
    qualifications: ["DVM", "Diplomate ACVIM"],
    experience: 10,
    rating: 4.9,
    reviews: 89,
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    availability: {
      monday: { start: "08:30", end: "16:30" },
      tuesday: { start: "08:30", end: "16:30" },
      wednesday: { start: "08:30", end: "16:30" },
      thursday: { start: "08:30", end: "16:30" },
      friday: { start: "08:30", end: "16:30" },
    },
  },
  {
    id: 5,
    name: "Dr. Lisa Patel",
    email: "lisa.patel@petstore.com",
    phone: "+230 789 0123",
    specialization: "Internal Medicine",
    qualifications: ["DVM", "Diplomate ACVIM"],
    experience: 7,
    rating: 4.7,
    reviews: 56,
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    availability: {
      monday: { start: "09:30", end: "17:30" },
      tuesday: { start: "09:30", end: "17:30" },
      wednesday: { start: "09:30", end: "17:30" },
      thursday: { start: "09:30", end: "17:30" },
      friday: { start: "09:30", end: "17:30" },
    },
  },
  {
    id: 6,
    name: "Dr. David Kim",
    email: "david.kim@petstore.com",
    phone: "+230 890 1234",
    specialization: "Orthopedics",
    qualifications: ["DVM", "Diplomate ACVS"],
    experience: 9,
    rating: 4.8,
    reviews: 67,
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    availability: {
      monday: { start: "08:00", end: "16:00" },
      tuesday: { start: "08:00", end: "16:00" },
      wednesday: { start: "08:00", end: "16:00" },
      thursday: { start: "08:00", end: "16:00" },
      friday: { start: "08:00", end: "16:00" },
    },
  },
  {
    id: 7,
    name: "Dr. Maria Garcia",
    email: "maria.garcia@petstore.com",
    phone: "+230 901 2345",
    specialization: "Neurology",
    qualifications: ["DVM", "Diplomate ACVIM"],
    experience: 11,
    rating: 4.9,
    reviews: 72,
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    availability: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
    },
  },
  {
    id: 8,
    name: "Dr. Robert Johnson",
    email: "robert.johnson@petstore.com",
    phone: "+230 012 3456",
    specialization: "Emergency Medicine",
    qualifications: ["DVM", "Diplomate ACVECC"],
    experience: 8,
    rating: 4.7,
    reviews: 63,
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    availability: {
      monday: { start: "10:00", end: "18:00" },
      tuesday: { start: "10:00", end: "18:00" },
      wednesday: { start: "10:00", end: "18:00" },
      thursday: { start: "10:00", end: "18:00" },
      friday: { start: "10:00", end: "18:00" },
    },
  },
  {
    id: 9,
    name: "Dr. Sophia Lee",
    email: "sophia.lee@petstore.com",
    phone: "+230 123 4567",
    specialization: "Ophthalmology",
    qualifications: ["DVM", "Diplomate ACVO"],
    experience: 7,
    rating: 4.8,
    reviews: 49,
    image: "https://randomuser.me/api/portraits/women/39.jpg",
    availability: {
      monday: { start: "08:30", end: "16:30" },
      tuesday: { start: "08:30", end: "16:30" },
      wednesday: { start: "08:30", end: "16:30" },
      thursday: { start: "08:30", end: "16:30" },
      friday: { start: "08:30", end: "16:30" },
    },
  },
  {
    id: 10,
    name: "Dr. William Brown",
    email: "william.brown@petstore.com",
    phone: "+230 234 5678",
    specialization: "Dentistry",
    qualifications: ["DVM", "Diplomate AVDC"],
    experience: 6,
    rating: 4.6,
    reviews: 42,
    image: "https://randomuser.me/api/portraits/men/72.jpg",
    availability: {
      monday: { start: "09:30", end: "17:30" },
      tuesday: { start: "09:30", end: "17:30" },
      wednesday: { start: "09:30", end: "17:30" },
      thursday: { start: "09:30", end: "17:30" },
      friday: { start: "09:30", end: "17:30" },
    },
  },
  {
    id: 11,
    name: "Dr. Olivia Martinez",
    email: "olivia.martinez@petstore.com",
    phone: "+230 345 6789",
    specialization: "Behavioral Medicine",
    qualifications: ["DVM", "Diplomate ACVB"],
    experience: 5,
    rating: 4.7,
    reviews: 38,
    image: "https://randomuser.me/api/portraits/women/51.jpg",
    availability: {
      monday: { start: "08:00", end: "16:00" },
      tuesday: { start: "08:00", end: "16:00" },
      wednesday: { start: "08:00", end: "16:00" },
      thursday: { start: "08:00", end: "16:00" },
      friday: { start: "08:00", end: "16:00" },
    },
  },
  {
    id: 12,
    name: "Dr. Daniel Wong",
    email: "daniel.wong@petstore.com",
    phone: "+230 456 7890",
    specialization: "Radiology",
    qualifications: ["DVM", "Diplomate ACVR"],
    experience: 9,
    rating: 4.8,
    reviews: 54,
    image: "https://randomuser.me/api/portraits/men/82.jpg",
    availability: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
    },
  },
  {
    id: 13,
    name: "Dr. Emma Anderson",
    email: "emma.anderson@petstore.com",
    phone: "+230 567 8901",
    specialization: "Oncology",
    qualifications: ["DVM", "Diplomate ACVIM"],
    experience: 10,
    rating: 4.9,
    reviews: 61,
    image: "https://randomuser.me/api/portraits/women/63.jpg",
    availability: {
      monday: { start: "10:00", end: "18:00" },
      tuesday: { start: "10:00", end: "18:00" },
      wednesday: { start: "10:00", end: "18:00" },
      thursday: { start: "10:00", end: "18:00" },
      friday: { start: "10:00", end: "18:00" },
    },
  },
  {
    id: 14,
    name: "Dr. Alexander Taylor",
    email: "alexander.taylor@petstore.com",
    phone: "+230 678 9012",
    specialization: "Reproductive Medicine",
    qualifications: ["DVM", "Diplomate ACT"],
    experience: 8,
    rating: 4.7,
    reviews: 47,
    image: "https://randomuser.me/api/portraits/men/91.jpg",
    availability: {
      monday: { start: "08:30", end: "16:30" },
      tuesday: { start: "08:30", end: "16:30" },
      wednesday: { start: "08:30", end: "16:30" },
      thursday: { start: "08:30", end: "16:30" },
      friday: { start: "08:30", end: "16:30" },
    },
  },
  {
    id: 15,
    name: "Dr. Isabella Clark",
    email: "isabella.clark@petstore.com",
    phone: "+230 789 0123",
    specialization: "Nutrition",
    qualifications: ["DVM", "Diplomate ACVN"],
    experience: 7,
    rating: 4.8,
    reviews: 52,
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    availability: {
      monday: { start: "09:30", end: "17:30" },
      tuesday: { start: "09:30", end: "17:30" },
      wednesday: { start: "09:30", end: "17:30" },
      thursday: { start: "09:30", end: "17:30" },
      friday: { start: "09:30", end: "17:30" },
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
