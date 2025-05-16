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
  {
    id: 3,
    name: "Sophia Chen",
    email: "sophia.chen@petstore.com",
    phone: "+230 345 6789",
    experience: "4 years",
    specialties: ["Show Grooming", "Hand Stripping", "Creative Styling"],
    rating: 4.9,
    reviews: 58,
    image: "https://randomuser.me/api/portraits/women/42.jpg",
    availability: {
      monday: { start: "08:30", end: "16:30" },
      tuesday: { start: "08:30", end: "16:30" },
      wednesday: { start: "08:30", end: "16:30" },
      thursday: { start: "08:30", end: "16:30" },
      friday: { start: "08:30", end: "16:30" },
    },
  },
  {
    id: 4,
    name: "Michael Rodriguez",
    email: "michael.rodriguez@petstore.com",
    phone: "+230 456 7890",
    experience: "6 years",
    specialties: ["Puppy Grooming", "De-shedding", "Sanitary Trim"],
    rating: 4.7,
    reviews: 49,
    image: "https://randomuser.me/api/portraits/men/88.jpg",
    availability: {
      monday: { start: "09:30", end: "17:30" },
      tuesday: { start: "09:30", end: "17:30" },
      wednesday: { start: "09:30", end: "17:30" },
      thursday: { start: "09:30", end: "17:30" },
      friday: { start: "09:30", end: "17:30" },
    },
  },
  {
    id: 5,
    name: "Olivia Kim",
    email: "olivia.kim@petstore.com",
    phone: "+230 567 8901",
    experience: "4 years",
    specialties: ["Cat Grooming", "Lion Cut", "Mat Removal"],
    rating: 4.8,
    reviews: 41,
    image: "https://randomuser.me/api/portraits/women/55.jpg",
    availability: {
      monday: { start: "10:00", end: "18:00" },
      tuesday: { start: "10:00", end: "18:00" },
      wednesday: { start: "10:00", end: "18:00" },
      thursday: { start: "10:00", end: "18:00" },
      friday: { start: "10:00", end: "18:00" },
    },
  },
  {
    id: 6,
    name: "David Patel",
    email: "david.patel@petstore.com",
    phone: "+230 678 9012",
    experience: "5 years",
    specialties: ["Breed-Specific Cuts", "Teeth Cleaning", "Paw Care"],
    rating: 4.7,
    reviews: 53,
    image: "https://randomuser.me/api/portraits/men/92.jpg",
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
    name: "Isabella Garcia",
    email: "isabella.garcia@petstore.com",
    phone: "+230 789 0123",
    experience: "3 years",
    specialties: ["Puppy First Groom", "Spa Treatment", "Flea Treatment"],
    rating: 4.6,
    reviews: 37,
    image: "https://randomuser.me/api/portraits/women/67.jpg",
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
    name: "William Johnson",
    email: "william.johnson@petstore.com",
    phone: "+230 890 1234",
    experience: "7 years",
    specialties: ["Show Dog Prep", "Hand Scissoring", "Color Treatment"],
    rating: 4.9,
    reviews: 62,
    image: "https://randomuser.me/api/portraits/men/95.jpg",
    availability: {
      monday: { start: "10:30", end: "18:30" },
      tuesday: { start: "10:30", end: "18:30" },
      wednesday: { start: "10:30", end: "18:30" },
      thursday: { start: "10:30", end: "18:30" },
      friday: { start: "10:30", end: "18:30" },
    },
  },
  {
    id: 9,
    name: "Sophia Lee",
    email: "sophia.lee@petstore.com",
    phone: "+230 901 2345",
    experience: "4 years",
    specialties: [
      "Asian Fusion Grooming",
      "Creative Coloring",
      "Puppy Training",
    ],
    rating: 4.8,
    reviews: 45,
    image: "https://randomuser.me/api/portraits/women/72.jpg",
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
    name: "Daniel Brown",
    email: "daniel.brown@petstore.com",
    phone: "+230 012 3456",
    experience: "5 years",
    specialties: ["Terrier Grooming", "Stripping", "Hand Plucking"],
    rating: 4.7,
    reviews: 48,
    image: "https://randomuser.me/api/portraits/men/98.jpg",
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
    name: "Emma Martinez",
    email: "emma.martinez@petstore.com",
    phone: "+230 123 4567",
    experience: "3 years",
    specialties: ["Poodle Grooming", "Creative Styling", "Puppy Care"],
    rating: 4.6,
    reviews: 39,
    image: "https://randomuser.me/api/portraits/women/81.jpg",
    availability: {
      monday: { start: "10:00", end: "18:00" },
      tuesday: { start: "10:00", end: "18:00" },
      wednesday: { start: "10:00", end: "18:00" },
      thursday: { start: "10:00", end: "18:00" },
      friday: { start: "10:00", end: "18:00" },
    },
  },
  {
    id: 12,
    name: "Alexander Wong",
    email: "alexander.wong@petstore.com",
    phone: "+230 234 5678",
    experience: "6 years",
    specialties: ["Show Dog Grooming", "Hand Scissoring", "Color Treatment"],
    rating: 4.9,
    reviews: 56,
    image: "https://randomuser.me/api/portraits/men/101.jpg",
    availability: {
      monday: { start: "08:00", end: "16:00" },
      tuesday: { start: "08:00", end: "16:00" },
      wednesday: { start: "08:00", end: "16:00" },
      thursday: { start: "08:00", end: "16:00" },
      friday: { start: "08:00", end: "16:00" },
    },
  },
  {
    id: 13,
    name: "Isabella Anderson",
    email: "isabella.anderson@petstore.com",
    phone: "+230 345 6789",
    experience: "4 years",
    specialties: ["Cat Grooming", "Lion Cut", "Spa Treatment"],
    rating: 4.7,
    reviews: 43,
    image: "https://randomuser.me/api/portraits/women/89.jpg",
    availability: {
      monday: { start: "09:30", end: "17:30" },
      tuesday: { start: "09:30", end: "17:30" },
      wednesday: { start: "09:30", end: "17:30" },
      thursday: { start: "09:30", end: "17:30" },
      friday: { start: "09:30", end: "17:30" },
    },
  },
  {
    id: 14,
    name: "William Taylor",
    email: "william.taylor@petstore.com",
    phone: "+230 456 7890",
    experience: "5 years",
    specialties: ["Breed-Specific Cuts", "Hand Stripping", "Show Prep"],
    rating: 4.8,
    reviews: 51,
    image: "https://randomuser.me/api/portraits/men/104.jpg",
    availability: {
      monday: { start: "10:00", end: "18:00" },
      tuesday: { start: "10:00", end: "18:00" },
      wednesday: { start: "10:00", end: "18:00" },
      thursday: { start: "10:00", end: "18:00" },
      friday: { start: "10:00", end: "18:00" },
    },
  },
  {
    id: 15,
    name: "Sophia Clark",
    email: "sophia.clark@petstore.com",
    phone: "+230 567 8901",
    experience: "3 years",
    specialties: ["Puppy Grooming", "Creative Styling", "Spa Treatment"],
    rating: 4.6,
    reviews: 35,
    image: "https://randomuser.me/api/portraits/women/92.jpg",
    availability: {
      monday: { start: "08:30", end: "16:30" },
      tuesday: { start: "08:30", end: "16:30" },
      wednesday: { start: "08:30", end: "16:30" },
      thursday: { start: "08:30", end: "16:30" },
      friday: { start: "08:30", end: "16:30" },
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
