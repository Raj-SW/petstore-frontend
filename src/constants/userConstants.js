// User roles as defined by the backend
export const USER_ROLES = {
  CUSTOMER: "customer",
  VETERINARIAN: "veterinarian",
  GROOMER: "groomer",
  TRAINER: "trainer",
  PETTAXI: "petTaxi",
  ADMIN: "admin",
};

// Professional roles (subset of user roles)
export const PROFESSIONAL_ROLES = [
  USER_ROLES.VETERINARIAN,
  USER_ROLES.GROOMER,
  USER_ROLES.TRAINER,
  USER_ROLES.PETTAXI,
];

// Role display names for UI
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.CUSTOMER]: "Customer",
  [USER_ROLES.VETERINARIAN]: "Veterinarian",
  [USER_ROLES.GROOMER]: "Pet Groomer",
  [USER_ROLES.TRAINER]: "Pet Trainer",
  [USER_ROLES.PETTAXI]: "Pet Taxi",
  [USER_ROLES.ADMIN]: "Administrator",
};

// Permission definitions
export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: "manage_users",
  MANAGE_PRODUCTS: "manage_products",
  MANAGE_ORDERS: "manage_orders",
  MANAGE_APPOINTMENTS: "manage_appointments",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_PROFESSIONALS: "manage_professionals",

  // Professional permissions
  MANAGE_OWN_APPOINTMENTS: "manage_own_appointments",
  VIEW_CLIENT_INFO: "view_client_info",
  UPDATE_AVAILABILITY: "update_availability",
  MANAGE_SERVICES: "manage_services",

  // Customer permissions
  BOOK_APPOINTMENTS: "book_appointments",
  MAKE_PURCHASES: "make_purchases",
  MANAGE_PETS: "manage_pets",
  WRITE_REVIEWS: "write_reviews",
};

// Role-based permission mappings
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_PROFESSIONALS,
    // Admins can also do everything customers can
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.MAKE_PURCHASES,
    PERMISSIONS.MANAGE_PETS,
    PERMISSIONS.WRITE_REVIEWS,
  ],
  [USER_ROLES.VETERINARIAN]: [
    PERMISSIONS.MANAGE_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_CLIENT_INFO,
    PERMISSIONS.UPDATE_AVAILABILITY,
    PERMISSIONS.MANAGE_SERVICES,
    // Professionals can also be customers
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.MAKE_PURCHASES,
    PERMISSIONS.MANAGE_PETS,
    PERMISSIONS.WRITE_REVIEWS,
  ],
  [USER_ROLES.GROOMER]: [
    PERMISSIONS.MANAGE_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_CLIENT_INFO,
    PERMISSIONS.UPDATE_AVAILABILITY,
    PERMISSIONS.MANAGE_SERVICES,
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.MAKE_PURCHASES,
    PERMISSIONS.MANAGE_PETS,
    PERMISSIONS.WRITE_REVIEWS,
  ],
  [USER_ROLES.TRAINER]: [
    PERMISSIONS.MANAGE_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_CLIENT_INFO,
    PERMISSIONS.UPDATE_AVAILABILITY,
    PERMISSIONS.MANAGE_SERVICES,
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.MAKE_PURCHASES,
    PERMISSIONS.MANAGE_PETS,
    PERMISSIONS.WRITE_REVIEWS,
  ],
  [USER_ROLES.CUSTOMER]: [
    PERMISSIONS.BOOK_APPOINTMENTS,
    PERMISSIONS.MAKE_PURCHASES,
    PERMISSIONS.MANAGE_PETS,
    PERMISSIONS.WRITE_REVIEWS,
  ],
};

// Helper functions
export const hasRole = (user, role) => {
  return user?.role === role;
};

export const hasAnyRole = (user, roles) => {
  return roles.includes(user?.role);
};

export const hasPermission = (user, permission) => {
  if (!user?.role) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

export const isProfessional = (user) => {
  return PROFESSIONAL_ROLES.includes(user?.role);
};

export const isAdmin = (user) => {
  return user?.role === USER_ROLES.ADMIN;
};

export const isCustomer = (user) => {
  return user?.role === USER_ROLES.CUSTOMER;
};
