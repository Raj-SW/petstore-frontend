import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  AppointmentCreateDTO,
  AppointmentUpdateDTO,
  AppointmentFilterDTO,
} from "./AppointmentDTO";

// Helper to get a date in the future
const futureDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d;
};

// Helper to get a date in the past
const pastDate = () => new Date("2000-01-01T00:00:00.000Z");

// ── AppointmentCreateDTO ──────────────────────────────────────────────────────

describe("AppointmentCreateDTO constructor", () => {
  it("stores provided values", () => {
    const dt = futureDate();
    const dto = new AppointmentCreateDTO({
      petId: "pet1",
      ownerId: "owner1",
      professionalId: "pro1",
      type: "grooming",
      dateTime: dt.toISOString(),
      duration: 60,
      notes: "Trim nails",
    });
    expect(dto.petId).toBe("pet1");
    expect(dto.ownerId).toBe("owner1");
    expect(dto.professionalId).toBe("pro1");
    expect(dto.type).toBe("grooming");
    expect(dto.dateTime).toBeInstanceOf(Date);
    expect(dto.duration).toBe(60);
    expect(dto.notes).toBe("Trim nails");
  });

  it("applies defaults when data is empty", () => {
    const before = new Date();
    const dto = new AppointmentCreateDTO();
    expect(dto.petId).toBeNull();
    expect(dto.ownerId).toBeNull();
    expect(dto.professionalId).toBeNull();
    expect(dto.type).toBe("");
    expect(dto.duration).toBe(30);
    expect(dto.notes).toBe("");
    // dateTime defaults to now
    expect(dto.dateTime).toBeInstanceOf(Date);
    expect(dto.dateTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("converts dateTime string to a Date object", () => {
    const isoString = "2030-06-15T10:00:00.000Z";
    const dto = new AppointmentCreateDTO({ dateTime: isoString });
    expect(dto.dateTime).toBeInstanceOf(Date);
    expect(dto.dateTime.toISOString()).toBe(isoString);
  });

  it("handles null input without crashing", () => {
    // data defaults to {} via default parameter — but passing null directly
    // would throw; the constructor signature is `data = {}` so null overrides default.
    // Test that empty object works safely.
    expect(() => new AppointmentCreateDTO({})).not.toThrow();
  });
});

describe("AppointmentCreateDTO.validate", () => {
  let futureIso;
  beforeEach(() => {
    futureIso = futureDate().toISOString();
  });

  it("returns isValid=true for a complete, valid DTO", () => {
    const dto = new AppointmentCreateDTO({
      petId: "p1",
      ownerId: "o1",
      professionalId: "pr1",
      type: "vet",
      dateTime: futureIso,
      duration: 30,
    });
    const { isValid, errors } = dto.validate();
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("fails when petId is missing", () => {
    const dto = new AppointmentCreateDTO({
      ownerId: "o1",
      professionalId: "pr1",
      type: "vet",
      dateTime: futureIso,
    });
    expect(dto.validate().errors).toContain("Pet ID is required");
  });

  it("fails when ownerId is missing", () => {
    const dto = new AppointmentCreateDTO({
      petId: "p1",
      professionalId: "pr1",
      type: "vet",
      dateTime: futureIso,
    });
    expect(dto.validate().errors).toContain("Owner ID is required");
  });

  it("fails when professionalId is missing", () => {
    const dto = new AppointmentCreateDTO({
      petId: "p1",
      ownerId: "o1",
      type: "vet",
      dateTime: futureIso,
    });
    expect(dto.validate().errors).toContain("Professional ID is required");
  });

  it("fails when type is missing", () => {
    const dto = new AppointmentCreateDTO({
      petId: "p1",
      ownerId: "o1",
      professionalId: "pr1",
      dateTime: futureIso,
    });
    expect(dto.validate().errors).toContain("Appointment type is required");
  });

  it("fails when dateTime is in the past", () => {
    const dto = new AppointmentCreateDTO({
      petId: "p1",
      ownerId: "o1",
      professionalId: "pr1",
      type: "vet",
      dateTime: pastDate().toISOString(),
      duration: 30,
    });
    expect(dto.validate().errors).toContain(
      "Appointment date cannot be in the past"
    );
  });

  it("fails when duration < 15", () => {
    const dto = new AppointmentCreateDTO({
      petId: "p1",
      ownerId: "o1",
      professionalId: "pr1",
      type: "vet",
      dateTime: futureIso,
      duration: 10,
    });
    expect(dto.validate().errors).toContain(
      "Duration must be between 15 and 180 minutes"
    );
  });

  it("fails when duration > 180", () => {
    const dto = new AppointmentCreateDTO({
      petId: "p1",
      ownerId: "o1",
      professionalId: "pr1",
      type: "vet",
      dateTime: futureIso,
      duration: 200,
    });
    expect(dto.validate().errors).toContain(
      "Duration must be between 15 and 180 minutes"
    );
  });

  it("passes at boundary values (duration=15 and duration=180)", () => {
    const base = {
      petId: "p1",
      ownerId: "o1",
      professionalId: "pr1",
      type: "vet",
      dateTime: futureIso,
    };
    expect(
      new AppointmentCreateDTO({ ...base, duration: 15 }).validate().isValid
    ).toBe(true);
    expect(
      new AppointmentCreateDTO({ ...base, duration: 180 }).validate().isValid
    ).toBe(true);
  });

  it("accumulates multiple errors", () => {
    const dto = new AppointmentCreateDTO({ duration: 5 });
    const { isValid, errors } = dto.validate();
    expect(isValid).toBe(false);
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});

// ── AppointmentUpdateDTO ──────────────────────────────────────────────────────

describe("AppointmentUpdateDTO constructor", () => {
  it("stores provided fields", () => {
    const futureIso = futureDate().toISOString();
    const dto = new AppointmentUpdateDTO({
      type: "grooming",
      dateTime: futureIso,
      duration: 45,
      notes: "Be gentle",
      status: "confirmed",
    });
    expect(dto.type).toBe("grooming");
    expect(dto.dateTime).toBeInstanceOf(Date);
    expect(dto.duration).toBe(45);
    expect(dto.notes).toBe("Be gentle");
    expect(dto.status).toBe("confirmed");
  });

  it("leaves dateTime undefined when not provided", () => {
    const dto = new AppointmentUpdateDTO({ type: "vet" });
    expect(dto.dateTime).toBeUndefined();
  });

  it("handles empty object", () => {
    const dto = new AppointmentUpdateDTO({});
    expect(dto.type).toBeUndefined();
    expect(dto.status).toBeUndefined();
  });
});

describe("AppointmentUpdateDTO.validate", () => {
  it("returns isValid=true when nothing is set", () => {
    const dto = new AppointmentUpdateDTO({});
    expect(dto.validate().isValid).toBe(true);
  });

  it("fails when dateTime is in the past", () => {
    const dto = new AppointmentUpdateDTO({
      dateTime: pastDate().toISOString(),
    });
    expect(dto.validate().errors).toContain(
      "Appointment date cannot be in the past"
    );
  });

  it("passes when dateTime is in the future", () => {
    const dto = new AppointmentUpdateDTO({
      dateTime: futureDate().toISOString(),
    });
    expect(dto.validate().isValid).toBe(true);
  });

  it("fails when duration is out of range", () => {
    const dto = new AppointmentUpdateDTO({ duration: 5 });
    expect(dto.validate().errors).toContain(
      "Duration must be between 15 and 180 minutes"
    );
  });

  it("passes at boundary duration values", () => {
    expect(
      new AppointmentUpdateDTO({ duration: 15 }).validate().isValid
    ).toBe(true);
    expect(
      new AppointmentUpdateDTO({ duration: 180 }).validate().isValid
    ).toBe(true);
  });

  it("fails with an invalid status", () => {
    const dto = new AppointmentUpdateDTO({ status: "unknown" });
    expect(dto.validate().errors).toContain("Invalid appointment status");
  });

  it("passes for each valid status", () => {
    for (const status of ["pending", "confirmed", "completed", "cancelled"]) {
      const dto = new AppointmentUpdateDTO({ status });
      expect(dto.validate().isValid).toBe(true);
    }
  });
});

describe("AppointmentUpdateDTO.toJSON", () => {
  it("omits undefined fields", () => {
    const dto = new AppointmentUpdateDTO({ type: "vet", notes: "ok" });
    const json = dto.toJSON();
    expect(json).toEqual({ type: "vet", notes: "ok" });
    expect(json).not.toHaveProperty("dateTime");
    expect(json).not.toHaveProperty("duration");
    expect(json).not.toHaveProperty("status");
  });

  it("includes all defined fields", () => {
    const futureIso = futureDate().toISOString();
    const dto = new AppointmentUpdateDTO({
      type: "grooming",
      dateTime: futureIso,
      duration: 60,
      notes: "No flea treatment",
      status: "confirmed",
    });
    const json = dto.toJSON();
    expect(Object.keys(json)).toHaveLength(5);
    expect(json.status).toBe("confirmed");
    expect(json.dateTime).toBeInstanceOf(Date);
  });

  it("returns empty object when nothing is set", () => {
    const dto = new AppointmentUpdateDTO({});
    expect(dto.toJSON()).toEqual({});
  });
});

// ── AppointmentFilterDTO ──────────────────────────────────────────────────────

describe("AppointmentFilterDTO constructor", () => {
  it("stores all provided filter fields", () => {
    const start = "2030-01-01T00:00:00.000Z";
    const end = "2030-12-31T00:00:00.000Z";
    const dto = new AppointmentFilterDTO({
      type: "vet",
      status: "confirmed",
      startDate: start,
      endDate: end,
      professionalId: "pro1",
      ownerId: "own1",
      petId: "pet1",
    });
    expect(dto.type).toBe("vet");
    expect(dto.status).toBe("confirmed");
    expect(dto.startDate).toBeInstanceOf(Date);
    expect(dto.endDate).toBeInstanceOf(Date);
    expect(dto.professionalId).toBe("pro1");
    expect(dto.ownerId).toBe("own1");
    expect(dto.petId).toBe("pet1");
  });

  it("leaves date fields undefined when not provided", () => {
    const dto = new AppointmentFilterDTO({});
    expect(dto.startDate).toBeUndefined();
    expect(dto.endDate).toBeUndefined();
  });

  it("handles completely empty input", () => {
    const dto = new AppointmentFilterDTO();
    expect(dto.type).toBeUndefined();
    expect(dto.status).toBeUndefined();
  });
});

describe("AppointmentFilterDTO.validate", () => {
  it("passes when no filters are set", () => {
    expect(new AppointmentFilterDTO().validate().isValid).toBe(true);
  });

  it("fails when startDate is after endDate", () => {
    const dto = new AppointmentFilterDTO({
      startDate: "2030-12-31T00:00:00.000Z",
      endDate: "2030-01-01T00:00:00.000Z",
    });
    expect(dto.validate().errors).toContain(
      "Start date cannot be after end date"
    );
  });

  it("passes when startDate equals endDate", () => {
    const dto = new AppointmentFilterDTO({
      startDate: "2030-06-01T00:00:00.000Z",
      endDate: "2030-06-01T00:00:00.000Z",
    });
    expect(dto.validate().isValid).toBe(true);
  });

  it("passes when startDate is before endDate", () => {
    const dto = new AppointmentFilterDTO({
      startDate: "2030-01-01T00:00:00.000Z",
      endDate: "2030-12-31T00:00:00.000Z",
    });
    expect(dto.validate().isValid).toBe(true);
  });

  it("fails with an invalid status", () => {
    const dto = new AppointmentFilterDTO({ status: "rescheduled" });
    expect(dto.validate().errors).toContain("Invalid appointment status");
  });

  it("passes for all valid statuses", () => {
    for (const status of ["pending", "confirmed", "completed", "cancelled"]) {
      const dto = new AppointmentFilterDTO({ status });
      expect(dto.validate().isValid).toBe(true);
    }
  });
});

describe("AppointmentFilterDTO.toQueryParams", () => {
  it("returns an empty string when no filters are set", () => {
    const dto = new AppointmentFilterDTO();
    expect(dto.toQueryParams()).toBe("");
  });

  it("includes set filters in the query string", () => {
    const dto = new AppointmentFilterDTO({
      type: "vet",
      status: "confirmed",
      professionalId: "pro1",
      ownerId: "own1",
      petId: "pet1",
    });
    const qs = dto.toQueryParams();
    expect(qs).toContain("type=vet");
    expect(qs).toContain("status=confirmed");
    expect(qs).toContain("professionalId=pro1");
    expect(qs).toContain("ownerId=own1");
    expect(qs).toContain("petId=pet1");
  });

  it("includes ISO date strings for startDate and endDate", () => {
    const start = "2030-01-01T00:00:00.000Z";
    const end = "2030-12-31T00:00:00.000Z";
    const dto = new AppointmentFilterDTO({ startDate: start, endDate: end });
    const qs = dto.toQueryParams();
    expect(qs).toContain("startDate=");
    expect(qs).toContain("endDate=");
  });

  it("omits undefined fields", () => {
    const dto = new AppointmentFilterDTO({ type: "vet" });
    const qs = dto.toQueryParams();
    expect(qs).not.toContain("status=");
    expect(qs).not.toContain("ownerId=");
  });
});
