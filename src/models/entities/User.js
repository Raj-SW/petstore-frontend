class User {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.username = data.username || "";
    this.email = data.email || "";
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.role = data.role || "user";
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json) {
    return new User(json);
  }

  validate() {
    const errors = [];

    if (!this.email) errors.push("Email is required");
    if (!this.username) errors.push("Username is required");

    if (this.email && !this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push("Invalid email format");
    }

    if (this.username && this.username.length < 3) {
      errors.push("Username must be at least 3 characters long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default User;
