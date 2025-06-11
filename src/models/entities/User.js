class User {
  constructor(data = {}) {
    this.id = data._id || "";
    this.name = data.name || "";
    this.email = data.email || "";
    this.phoneNumber = data.phoneNumber || "";
    this.address = data.address || "";
    this.role = data.role || "customer";
    this.isEmailVerified = data.isEmailVerified || false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toJSON() {
    return {
      _id: this.id,
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      address: this.address,
      role: this.role,
      isEmailVerified: this.isEmailVerified,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  validate() {
    const errors = [];

    if (!this.name) {
      errors.push("Name is required");
    }

    if (!this.email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push("Invalid email format");
    }

    if (!this.phoneNumber) {
      errors.push("Phone number is required");
    }

    if (!this.address) {
      errors.push("Address is required");
    }

    return errors;
  }

  static fromJSON(json) {
    return new User(json);
  }
}

export default User;
