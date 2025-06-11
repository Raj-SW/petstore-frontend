class AppointmentCreateDTO {
  constructor(data = {}) {
    this.petId = data.petId || null;
    this.ownerId = data.ownerId || null;
    this.professionalId = data.professionalId || null;
    this.type = data.type || "";
    this.dateTime = data.dateTime ? new Date(data.dateTime) : new Date();
    this.duration = data.duration || 30;
    this.notes = data.notes || "";
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

    return { isValid: errors.length === 0, errors };
  }
}

class AppointmentUpdateDTO {
  constructor(data = {}) {
    this.type = data.type;
    this.dateTime = data.dateTime ? new Date(data.dateTime) : undefined;
    this.duration = data.duration;
    this.notes = data.notes;
    this.status = data.status;
  }

  validate() {
    const errors = [];

    if (this.dateTime && this.dateTime < new Date()) {
      errors.push("Appointment date cannot be in the past");
    }

    if (
      this.duration !== undefined &&
      (this.duration < 15 || this.duration > 180)
    ) {
      errors.push("Duration must be between 15 and 180 minutes");
    }

    if (this.status) {
      const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
      if (!validStatuses.includes(this.status)) {
        errors.push("Invalid appointment status");
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  toJSON() {
    const json = {};
    if (this.type !== undefined) json.type = this.type;
    if (this.dateTime !== undefined) json.dateTime = this.dateTime;
    if (this.duration !== undefined) json.duration = this.duration;
    if (this.notes !== undefined) json.notes = this.notes;
    if (this.status !== undefined) json.status = this.status;
    return json;
  }
}

class AppointmentFilterDTO {
  constructor(data = {}) {
    this.type = data.type;
    this.status = data.status;
    this.startDate = data.startDate ? new Date(data.startDate) : undefined;
    this.endDate = data.endDate ? new Date(data.endDate) : undefined;
    this.professionalId = data.professionalId;
    this.ownerId = data.ownerId;
    this.petId = data.petId;
  }

  validate() {
    const errors = [];

    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      errors.push("Start date cannot be after end date");
    }

    if (this.status) {
      const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
      if (!validStatuses.includes(this.status)) {
        errors.push("Invalid appointment status");
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  toQueryParams() {
    const params = new URLSearchParams();

    if (this.type) params.append("type", this.type);
    if (this.status) params.append("status", this.status);
    if (this.startDate)
      params.append("startDate", this.startDate.toISOString());
    if (this.endDate) params.append("endDate", this.endDate.toISOString());
    if (this.professionalId)
      params.append("professionalId", this.professionalId);
    if (this.ownerId) params.append("ownerId", this.ownerId);
    if (this.petId) params.append("petId", this.petId);

    return params.toString();
  }
}

export { AppointmentCreateDTO, AppointmentUpdateDTO, AppointmentFilterDTO };
