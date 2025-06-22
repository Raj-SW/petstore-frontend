class Pet {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.name = data.name || "";
    this.type = data.type || "";
    this.breed = data.breed || "";
    this.age = data.age || 0;
    this.weight = data.weight || 0;
    this.owner = data.owner || null;
    this.color = data.color || "";
    this.description = data.description || "";
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      breed: this.breed,
      age: this.age,
      weight: this.weight,
      ownerId: this.ownerId,
      medicalHistory: this.medicalHistory,
      vaccinations: this.vaccinations,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json) {
    return new Pet(json);
  }

  validate() {
    const errors = [];

    if (!this.name) errors.push("Pet name is required");
    if (!this.type) errors.push("Pet type is required");

    if (this.age < 0) {
      errors.push("Age cannot be negative");
    }

    if (this.weight < 0) {
      errors.push("Weight cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  addMedicalRecord(record) {
    this.medicalHistory.push({
      ...record,
      date: new Date(),
      id: Date.now().toString(),
    });
  }

  addVaccination(vaccination) {
    this.vaccinations.push({
      ...vaccination,
      date: new Date(),
      id: Date.now().toString(),
    });
  }
}

export default Pet;
