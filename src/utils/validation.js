// Common validation rules
export const validationRules = {
  required: (value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return value !== null && value !== undefined && value !== "";
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  minLength: (min) => (value) => {
    return value && value.length >= min;
  },

  maxLength: (max) => (value) => {
    return !value || value.length <= max;
  },

  pattern: (regex) => (value) => {
    return !value || regex.test(value);
  },

  numeric: (value) => {
    return !value || /^\d+$/.test(value);
  },

  alphanumeric: (value) => {
    return !value || /^[a-zA-Z0-9]+$/.test(value);
  },

  phoneNumber: (value) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return !value || phoneRegex.test(value);
  },

  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  min: (min) => (value) => {
    return !value || Number(value) >= min;
  },

  max: (max) => (value) => {
    return !value || Number(value) <= max;
  },

  matches: (fieldName) => (value, allValues) => {
    return value === allValues[fieldName];
  },
};

// Validation message generators
export const validationMessages = {
  required: (fieldName) => `${fieldName} is required`,
  email: () => "Please enter a valid email address",
  minLength: (fieldName, min) =>
    `${fieldName} must be at least ${min} characters`,
  maxLength: (fieldName, max) =>
    `${fieldName} must not exceed ${max} characters`,
  pattern: (fieldName) => `${fieldName} format is invalid`,
  numeric: (fieldName) => `${fieldName} must contain only numbers`,
  alphanumeric: (fieldName) =>
    `${fieldName} must contain only letters and numbers`,
  phoneNumber: () => "Please enter a valid phone number",
  url: () => "Please enter a valid URL",
  min: (fieldName, min) => `${fieldName} must be at least ${min}`,
  max: (fieldName, max) => `${fieldName} must not exceed ${max}`,
  matches: (fieldName, targetField) => `${fieldName} must match ${targetField}`,
};

// Create validator function
export const createValidator = (schema) => {
  return (values) => {
    const errors = {};

    Object.keys(schema).forEach((fieldName) => {
      const fieldRules = schema[fieldName];
      const fieldValue = values[fieldName];

      for (const rule of fieldRules) {
        const { validator, message, params } = rule;

        let isValid;
        if (typeof validator === "function") {
          isValid = validator(fieldValue, values);
        } else if (validationRules[validator]) {
          const validationFn = params
            ? validationRules[validator](...params)
            : validationRules[validator];
          isValid = validationFn(fieldValue, values);
        } else {
          console.warn(`Unknown validator: ${validator}`);
          continue;
        }

        if (!isValid) {
          errors[fieldName] =
            message ||
            (validationMessages[validator]
              ? validationMessages[validator](fieldName, ...(params || []))
              : `${fieldName} is invalid`);
          break; // Stop at first error for this field
        }
      }
    });

    return errors;
  };
};

// Common validation schemas
export const commonValidations = {
  loginSchema: {
    email: [
      { validator: "required", message: "Email is required" },
      { validator: "email", message: "Please enter a valid email address" },
    ],
    password: [
      { validator: "required", message: "Password is required" },
      {
        validator: "minLength",
        params: [6],
        message: "Password must be at least 6 characters",
      },
    ],
  },

  signupSchema: {
    name: [
      { validator: "required", message: "Name is required" },
      {
        validator: "minLength",
        params: [2],
        message: "Name must be at least 2 characters",
      },
    ],
    email: [
      { validator: "required", message: "Email is required" },
      { validator: "email", message: "Please enter a valid email address" },
    ],
    password: [
      { validator: "required", message: "Password is required" },
      {
        validator: "minLength",
        params: [8],
        message: "Password must be at least 8 characters",
      },
    ],
    confirmPassword: [
      { validator: "required", message: "Please confirm your password" },
      {
        validator: "matches",
        params: ["password"],
        message: "Passwords do not match",
      },
    ],
    phoneNumber: [
      { validator: "required", message: "Phone number is required" },
      {
        validator: "phoneNumber",
        message: "Please enter a valid phone number",
      },
    ],
    address: [{ validator: "required", message: "Address is required" }],
  },

  productSchema: {
    name: [
      { validator: "required", message: "Product name is required" },
      {
        validator: "minLength",
        params: [3],
        message: "Product name must be at least 3 characters",
      },
    ],
    description: [
      { validator: "required", message: "Description is required" },
      {
        validator: "minLength",
        params: [10],
        message: "Description must be at least 10 characters",
      },
    ],
    price: [
      { validator: "required", message: "Price is required" },
      {
        validator: "min",
        params: [0],
        message: "Price must be greater than 0",
      },
    ],
    stock: [
      { validator: "required", message: "Stock quantity is required" },
      { validator: "min", params: [0], message: "Stock must be 0 or greater" },
    ],
    category: [{ validator: "required", message: "Category is required" }],
  },
};

// Helper function to format field names
export const formatFieldName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
