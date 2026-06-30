import { describe, it, expect } from "vitest";
import Appointment from "./Appointment";

// Helpers
const futureDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d;
};
const pastDate = () => new Date("2000-01-01T00:00:00.000Z");

// ── Constructor ───────────────────────────────────────────────────────────────

describe("Appointment constructor", () => {
  it("applies all defaults when called with no arguments", () => {
    const a = new Appointment();
    expect(a.id).toBeNull();
    expect(a.petId).toBeNull();
    expect(a.ownerId).toBeNull();
    expect(a.professionalId).toBeNull();
    expect(a.type).toBe("");
    expect(a.status).toBe("pending");
    expect(a.dateTime).toBeInstanceOf(Date);
    expect(a.duration).toBe(30);
    expect(a.notes).toBe("");
    expect(a.createdAt).toBeInstanceOf(Date);
    expect(a.updatedAt).toBeInstanceOf(Date);
  });

  it("maps id from data.id", () => {
    const a = new Appointment({ id: "appt1" });
    expect(a.id).toBe("appt1");
  });

  it("maps id from data._id when id is absent", () => {
    const a = new Appointment({ _id: "mongo-appt" });
    expect(a.id).toBe("mongo-appt");
  });

  it("prefers data.id over data._id", () => {
    const a = new Appointment({ id: "preferred", _id: "fallback" });
    expect(a.id).toBe("preferred");
  });

  it("stores all provided fields correctly", () => {
    const dt = futureDate().toISOString();
    const created = "2024-01-01T00:00:00.000Z";
    const updated = "2024-06-01T00:00:00.000Z";
    const a = new Appointment({
      id: "a1",
      petId: "pet1",
      ownerId: "owner1",
      professionalId: "pro1",
      type: "grooming",
      status: "confirmed",
      dateTime: dt,
      duration: 60,
      notes: "Gentle please",
      createdAt: created,
      updatedAt: updated,
    });
    expect(a.petId).toBe("pet1");
    expect(a.ownerId).toBe("owner1");
    expect(a.professionalId).toBe("pro1");
    expect(a.type).toBe("grooming");
    expect(a.status).toBe("confirmed");
    expect(a.dateTime).toBeInstanceOf(Date);
    expect(a.duration).toBe(60);
    expect(a.notes).toBe("Gentle please");
    expect(a.createdAt.toISOString()).toBe(created);
    expect(a.updatedAt.toISOString()).toBe(updated);
  });

  it("defaults dateTime to now when not provided", () => {
    const before = Date.now();
    const a = new Appointment({});
    expect(a.dateTime.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ── toJSON ────────────────────────────────────────────────────────────────────

describe("Appointment.toJSON", () => {
  it("returns a plain object with all expected keys", () => {
    const a = new Appointment({ id: "a1", petId: "p1", ownerId: "o1", professionalId: "pr1" });
    const json = a.toJSON();
    expect(json).toHaveProperty("id", "a1");
    expect(json).toHaveProperty("petId", "p1");
    expect(json).toHaveProperty("ownerId", "o1");
    expect(json).toHaveProperty("professionalId", "pr1");
    expect(json).toHaveProperty("type");
    expect(json).toHaveProperty("status");
    expect(json).toHaveProperty("dateTime");
    expect(json).toHaveProperty("duration");
    expect(json).toHaveProperty("notes");
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });
});

// ── fromJSON ──────────────────────────────────────────────────────────────────

describe("Appointment.fromJSON", () => {
  it("returns an Appointment instance", () => {
    const a = Appointment.fromJSON({ _id: "x" });
    expect(a).toBeInstanceOf(Appointment);
  });

  it("correctly maps values", () => {
    const a = Appointment.fromJSON({ id: "a2", type: "vet", duration: 45 });
    expect(a.id).toBe("a2");
    expect(a.type).toBe("vet");
    expect(a.duration).toBe(45);
  });
});

// ── validate ──────────────────────────────────────────────────────────────────

describe("Appointment.validate", () => {
  const validBase = () => ({
    petId: "p1",
    ownerId: "o1",
    professionalId: "pr1",
    type: "vet",
    dateTime: futureDate().toISOString(),
    duration: 30,
    status: "pending",
  });

  it("returns isValid=true for a fully valid appointment", () => {
    const a = new Appointment(validBase());
    const { isValid, errors } = a.validate();
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("fails when petId is missing", () => {
    const data = validBase();
    delete data.petId;
    const a = new Appointment(data);
    expect(a.validate().errors).toContain("Pet ID is required");
  });

  it("fails when ownerId is missing", () => {
    const data = validBase();
    delete data.ownerId;
    const a = new Appointment(data);
    expect(a.validate().errors).toContain("Owner ID is required");
  });

  it("fails when professionalId is missing", () => {
    const data = validBase();
    delete data.professionalId;
    const a = new Appointment(data);
    expect(a.validate().errors).toContain("Professional ID is required");
  });

  it("fails when type is missing", () => {
    const data = { ...validBase(), type: "" };
    const a = new Appointment(data);
    expect(a.validate().errors).toContain("Appointment type is required");
  });

  it("fails when dateTime is in the past", () => {
    const a = new Appointment({ ...validBase(), dateTime: pastDate().toISOString() });
    expect(a.validate().errors).toContain("Appointment date cannot be in the past");
  });

  it("fails when duration is below 15", () => {
    const a = new Appointment({ ...validBase(), duration: 10 });
    expect(a.validate().errors).toContain("Duration must be between 15 and 180 minutes");
  });

  it("fails when duration is above 180", () => {
    const a = new Appointment({ ...validBase(), duration: 200 });
    expect(a.validate().errors).toContain("Duration must be between 15 and 180 minutes");
  });

  it("passes at boundary durations (15 and 180)", () => {
    expect(new Appointment({ ...validBase(), duration: 15 }).validate().isValid).toBe(true);
    expect(new Appointment({ ...validBase(), duration: 180 }).validate().isValid).toBe(true);
  });

  it("fails with an invalid status", () => {
    const a = new Appointment({ ...validBase(), status: "unknown" });
    expect(a.validate().errors).toContain("Invalid appointment status");
  });

  it("passes for all valid statuses", () => {
    for (const status of ["pending", "confirmed", "completed", "cancelled"]) {
      const a = new Appointment({ ...validBase(), status });
      expect(a.validate().isValid).toBe(true);
    }
  });

  it("accumulates multiple errors", () => {
    const a = new Appointment({ duration: 5, status: "bad" });
    const { isValid, errors } = a.validate();
    expect(isValid).toBe(false);
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});

// ── updateStatus ──────────────────────────────────────────────────────────────

describe("Appointment.updateStatus", () => {
  it("updates the status to a valid value", () => {
    const a = new Appointment({ status: "pending" });
    a.updateStatus("confirmed");
    expect(a.status).toBe("confirmed");
  });

  it("also updates updatedAt", () => {
    const a = new Appointment({ status: "pending" });
    const before = Date.now();
    a.updateStatus("completed");
    expect(a.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("transitions through all valid statuses without error", () => {
    const a = new Appointment({ status: "pending" });
    expect(() => a.updateStatus("confirmed")).not.toThrow();
    expect(() => a.updateStatus("completed")).not.toThrow();
    expect(() => a.updateStatus("cancelled")).not.toThrow();
    expect(() => a.updateStatus("pending")).not.toThrow();
  });

  it("throws for an invalid status", () => {
    const a = new Appointment();
    expect(() => a.updateStatus("rescheduled")).toThrow("Invalid appointment status");
  });

  it("throws for an empty string status", () => {
    const a = new Appointment();
    expect(() => a.updateStatus("")).toThrow("Invalid appointment status");
  });
});

// ── isUpcoming ────────────────────────────────────────────────────────────────

describe("Appointment.isUpcoming", () => {
  it("returns true when dateTime is in the future and status is not cancelled", () => {
    const a = new Appointment({ dateTime: futureDate().toISOString(), status: "pending" });
    expect(a.isUpcoming()).toBe(true);
  });

  it("returns false when status is cancelled even if dateTime is in the future", () => {
    const a = new Appointment({ dateTime: futureDate().toISOString(), status: "cancelled" });
    expect(a.isUpcoming()).toBe(false);
  });

  it("returns false when dateTime is in the past", () => {
    const a = new Appointment({ dateTime: pastDate().toISOString(), status: "pending" });
    expect(a.isUpcoming()).toBe(false);
  });
});

// ── isPast ────────────────────────────────────────────────────────────────────

describe("Appointment.isPast", () => {
  it("returns true when dateTime is in the past", () => {
    const a = new Appointment({ dateTime: pastDate().toISOString(), status: "pending" });
    expect(a.isPast()).toBe(true);
  });

  it("returns true when status is completed regardless of date", () => {
    const a = new Appointment({ dateTime: futureDate().toISOString(), status: "completed" });
    expect(a.isPast()).toBe(true);
  });

  it("returns false when dateTime is in the future and status is not completed", () => {
    const a = new Appointment({ dateTime: futureDate().toISOString(), status: "confirmed" });
    expect(a.isPast()).toBe(false);
  });
});
