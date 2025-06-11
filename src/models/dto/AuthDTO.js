class LoginDTO {
  constructor(data = {}) {
    this.username = data.username || "";
    this.password = data.password || "";
  }

  validate() {
    const errors = [];
    if (!this.username) errors.push("Username is required");
    if (!this.password) errors.push("Password is required");
    return { isValid: errors.length === 0, errors };
  }
}

class SignupDTO {
  constructor(data = {}) {
    this.username = data.username || "";
    this.email = data.email || "";
    this.password = data.password || "";
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
  }

  validate() {
    const errors = [];
    if (!this.username) errors.push("Username is required");
    if (!this.email) errors.push("Email is required");
    if (!this.password) errors.push("Password is required");

    if (this.email && !this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push("Invalid email format");
    }

    if (this.password && this.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    return { isValid: errors.length === 0, errors };
  }
}

class PasswordResetDTO {
  constructor(data = {}) {
    this.email = data.email || "";
  }

  validate() {
    const errors = [];
    if (!this.email) errors.push("Email is required");

    if (this.email && !this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push("Invalid email format");
    }

    return { isValid: errors.length === 0, errors };
  }
}

class PasswordChangeDTO {
  constructor(data = {}) {
    this.oldPassword = data.oldPassword || "";
    this.newPassword = data.newPassword || "";
  }

  validate() {
    const errors = [];
    if (!this.oldPassword) errors.push("Current password is required");
    if (!this.newPassword) errors.push("New password is required");

    if (this.newPassword && this.newPassword.length < 6) {
      errors.push("New password must be at least 6 characters long");
    }

    return { isValid: errors.length === 0, errors };
  }
}

export { LoginDTO, SignupDTO, PasswordResetDTO, PasswordChangeDTO };
