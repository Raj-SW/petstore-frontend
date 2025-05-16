// Simulated groomer data
const groomers = [
  {
    id: 1,
    name: "Emma Thompson",
    email: "emma.thompson@petstore.com",
    phone: "+230 123 4567",
    experience: "5 years",
    specialties: ["Full Groom", "Nail Trimming", "Bath & Conditioning"],
    rating: 4.8,
    reviews: 45,
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    availability: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
    },
  },
  {
    id: 2,
    name: "James Wilson",
    email: "james.wilson@petstore.com",
    phone: "+230 234 5678",
    experience: "3 years",
    specialties: ["Deluxe Bath", "Haircut", "Ear Cleaning"],
    rating: 4.6,
    reviews: 32,
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    availability: {
      monday: { start: "10:00", end: "18:00" },
      tuesday: { start: "10:00", end: "18:00" },
      wednesday: { start: "10:00", end: "18:00" },
      thursday: { start: "10:00", end: "18:00" },
      friday: { start: "10:00", end: "18:00" },
    },
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const groomerService = {
  // Get all groomers
  getAll: async () => {
    await delay(500); // Simulate network delay
    return [...groomers];
  },

  // Get groomer by ID
  getById: async (id) => {
    await delay(300);
    const groomer = groomers.find((g) => g.id === id);
    if (!groomer) throw new Error("Groomer not found");
    return { ...groomer };
  },

  // Create new groomer
  create: async (groomerData) => {
    await delay(800);
    const newGroomer = {
      id: Math.max(...groomers.map((g) => g.id)) + 1,
      ...groomerData,
      rating: 0,
      reviews: 0,
    };
    groomers.push(newGroomer);
    return { ...newGroomer };
  },

  // Update groomer
  update: async (id, groomerData) => {
    await delay(600);
    const index = groomers.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Groomer not found");

    groomers[index] = {
      ...groomers[index],
      ...groomerData,
    };
    return { ...groomers[index] };
  },

  // Delete groomer
  delete: async (id) => {
    await delay(400);
    const index = groomers.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Groomer not found");

    const deletedGroomer = groomers[index];
    groomers.splice(index, 1);
    return { ...deletedGroomer };
  },

  // Get groomer availability
  getAvailability: async (id) => {
    await delay(300);
    const groomer = groomers.find((g) => g.id === id);
    if (!groomer) throw new Error("Groomer not found");
    return { ...groomer.availability };
  },

  // Update groomer availability
  updateAvailability: async (id, availability) => {
    await delay(600);
    const index = groomers.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Groomer not found");

    groomers[index].availability = {
      ...groomers[index].availability,
      ...availability,
    };
    return { ...groomers[index].availability };
  },
};
