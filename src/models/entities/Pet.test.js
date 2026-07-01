import { describe, it, expect } from "vitest";
import Pet from "./Pet";

// ── Constructor ───────────────────────────────────────────────────────────────

describe("Pet constructor", () => {
  it("applies all defaults when called with no arguments", () => {
    const p = new Pet();
    expect(p.id).toBeNull();
    expect(p.name).toBe("");
    expect(p.type).toBe("");
    expect(p.breed).toBe("");
    expect(p.age).toBe(0);
    expect(p.weight).toBe(0);
    expect(p.owner).toBeNull();
    expect(p.color).toBe("");
    expect(p.description).toBe("");
    expect(p.createdAt).toBeInstanceOf(Date);
    expect(p.updatedAt).toBeInstanceOf(Date);
  });

  it("applies all defaults when called with an empty object", () => {
    const p = new Pet({});
    expect(p.id).toBeNull();
    expect(p.name).toBe("");
  });

  it("maps id from data.id", () => {
    const p = new Pet({ id: "pet1" });
    expect(p.id).toBe("pet1");
  });

  it("maps id from data._id when id is absent", () => {
    const p = new Pet({ _id: "mongo-pet" });
    expect(p.id).toBe("mongo-pet");
  });

  it("prefers data.id over data._id", () => {
    const p = new Pet({ id: "preferred", _id: "fallback" });
    expect(p.id).toBe("preferred");
  });

  it("stores all provided fields correctly", () => {
    const createdAt = "2024-01-01T00:00:00.000Z";
    const updatedAt = "2024-06-01T00:00:00.000Z";
    const p = new Pet({
      id: "p1",
      name: "Buddy",
      type: "Dog",
      breed: "Labrador",
      age: 3,
      weight: 25,
      owner: "owner1",
      color: "Golden",
      description: "Friendly dog",
      createdAt,
      updatedAt,
    });
    expect(p.name).toBe("Buddy");
    expect(p.type).toBe("Dog");
    expect(p.breed).toBe("Labrador");
    expect(p.age).toBe(3);
    expect(p.weight).toBe(25);
    expect(p.owner).toBe("owner1");
    expect(p.color).toBe("Golden");
    expect(p.description).toBe("Friendly dog");
    expect(p.createdAt.toISOString()).toBe(createdAt);
    expect(p.updatedAt.toISOString()).toBe(updatedAt);
  });

  it("defaults createdAt/updatedAt to now when not provided", () => {
    const before = Date.now();
    const p = new Pet({});
    expect(p.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(p.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ── toJSON ────────────────────────────────────────────────────────────────────

describe("Pet.toJSON", () => {
  it("returns a plain object with all expected keys", () => {
    const p = new Pet({ id: "p1", name: "Bella", type: "Cat" });
    const json = p.toJSON();
    expect(json).toHaveProperty("id", "p1");
    expect(json).toHaveProperty("name", "Bella");
    expect(json).toHaveProperty("type", "Cat");
    expect(json).toHaveProperty("breed");
    expect(json).toHaveProperty("age");
    expect(json).toHaveProperty("weight");
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });
});

// ── fromJSON ──────────────────────────────────────────────────────────────────

describe("Pet.fromJSON", () => {
  it("returns a Pet instance", () => {
    const p = Pet.fromJSON({ _id: "x", name: "Rex" });
    expect(p).toBeInstanceOf(Pet);
  });

  it("correctly maps values from the JSON object", () => {
    const p = Pet.fromJSON({ id: "p2", name: "Luna", type: "Cat", age: 2 });
    expect(p.id).toBe("p2");
    expect(p.name).toBe("Luna");
    expect(p.type).toBe("Cat");
    expect(p.age).toBe(2);
  });
});

// ── validate ──────────────────────────────────────────────────────────────────

describe("Pet.validate", () => {
  it("returns isValid=true for a valid pet", () => {
    const p = new Pet({ name: "Buddy", type: "Dog", age: 3, weight: 20 });
    const { isValid, errors } = p.validate();
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("fails when name is missing", () => {
    const p = new Pet({ type: "Dog" });
    expect(p.validate().errors).toContain("Pet name is required");
  });

  it("fails when type is missing", () => {
    const p = new Pet({ name: "Buddy" });
    expect(p.validate().errors).toContain("Pet type is required");
  });

  it("fails when age is negative", () => {
    const p = new Pet({ name: "Buddy", type: "Dog", age: -1 });
    expect(p.validate().errors).toContain("Age cannot be negative");
  });

  it("passes when age is zero", () => {
    const p = new Pet({ name: "Buddy", type: "Dog", age: 0 });
    expect(p.validate().errors).not.toContain("Age cannot be negative");
  });

  it("fails when weight is negative", () => {
    const p = new Pet({ name: "Buddy", type: "Dog", weight: -5 });
    expect(p.validate().errors).toContain("Weight cannot be negative");
  });

  it("passes when weight is zero", () => {
    const p = new Pet({ name: "Buddy", type: "Dog", weight: 0 });
    expect(p.validate().errors).not.toContain("Weight cannot be negative");
  });

  it("accumulates multiple errors", () => {
    const p = new Pet({ age: -1, weight: -1 });
    const { isValid, errors } = p.validate();
    expect(isValid).toBe(false);
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ── addMedicalRecord ──────────────────────────────────────────────────────────

describe("Pet.addMedicalRecord", () => {
  it("appends a record with a generated date and id", () => {
    const p = new Pet({ name: "Buddy", type: "Dog" });
    // medicalHistory is not initialized in constructor, but addMedicalRecord pushes to it
    // Initialize it first as the class doesn't set it in constructor
    p.medicalHistory = [];
    p.addMedicalRecord({ diagnosis: "Flu", treatment: "Rest" });
    expect(p.medicalHistory).toHaveLength(1);
    expect(p.medicalHistory[0].diagnosis).toBe("Flu");
    expect(p.medicalHistory[0].treatment).toBe("Rest");
    expect(p.medicalHistory[0].date).toBeInstanceOf(Date);
    expect(typeof p.medicalHistory[0].id).toBe("string");
  });

  it("can add multiple records", () => {
    const p = new Pet({ name: "Buddy", type: "Dog" });
    p.medicalHistory = [];
    p.addMedicalRecord({ diagnosis: "Cold" });
    p.addMedicalRecord({ diagnosis: "Injury" });
    expect(p.medicalHistory).toHaveLength(2);
  });
});

// ── addVaccination ────────────────────────────────────────────────────────────

describe("Pet.addVaccination", () => {
  it("appends a vaccination with a generated date and id", () => {
    const p = new Pet({ name: "Buddy", type: "Dog" });
    p.vaccinations = [];
    p.addVaccination({ name: "Rabies", nextDue: "2026-01-01" });
    expect(p.vaccinations).toHaveLength(1);
    expect(p.vaccinations[0].name).toBe("Rabies");
    expect(p.vaccinations[0].nextDue).toBe("2026-01-01");
    expect(p.vaccinations[0].date).toBeInstanceOf(Date);
    expect(typeof p.vaccinations[0].id).toBe("string");
  });

  it("can add multiple vaccinations", () => {
    const p = new Pet({ name: "Buddy", type: "Dog" });
    p.vaccinations = [];
    p.addVaccination({ name: "Rabies" });
    p.addVaccination({ name: "Distemper" });
    expect(p.vaccinations).toHaveLength(2);
  });
});
