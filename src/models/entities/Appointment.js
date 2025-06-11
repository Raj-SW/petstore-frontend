class Appointment {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.petId = data.petId || null;
    this.ownerId = data.ownerId || null;
    this.professionalId = data.professionalId || null;
    this.type = data.type || "";
    this.status = data.status || "pending";
    this.dateTime = data.dateTime ? new Date(data.dateTime) : new Date();
    this.duration = data.duration || 30; // in minutes
    this.notes = data.notes || "";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toJSON() {
    return {
      id: this.id,
      petId: this.petId,
      ownerId: this.ownerId,
      professionalId: this.professionalId,
      type: this.type,
      status: this.status,
      dateTime: this.dateTime,
      duration: this.duration,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json) {
    return new Appointment(json);
  }

  validate() {
    const errors = [];

    if (!this.petId) errors.push("Pet ID is required");
    if (!this.ownerId) errors.push("Owner ID is required");
    if (!this.professionalId) errors.push("Professional ID is required");
    if (!this.type) errors.push("Appointment type is required");

    if (this.dateTime < new Date()) {
      errors.push("Appointment date cannot be in the past");
    }

    if (this.duration < 15 || this.duration > 180) {
      errors.push("Duration must be between 15 and 180 minutes");
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(this.status)) {
      errors.push("Invalid appointment status");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  updateStatus(newStatus) {
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Invalid appointment status");
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  isUpcoming() {
    return this.dateTime > new Date() && this.status !== "cancelled";
  }

  isPast() {
    return this.dateTime < new Date() || this.status === "completed";
  }
}

export default Appointment;
