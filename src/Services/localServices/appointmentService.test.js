import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("axios", () => {
  const fn = vi.fn();
  fn.get = vi.fn();
  fn.post = vi.fn();
  return { default: fn };
});

import axios from "axios";
import AppointmentService from "./appointmentService";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const firstCall = () => axios.mock.calls[0][0];

describe("AppointmentService", () => {
  it("getAllMyAppointments unwraps data.data", async () => {
    axios.mockResolvedValue({ data: { data: [{ id: 1 }] } });
    await expect(AppointmentService.getAllMyAppointments()).resolves.toEqual([
      { id: 1 },
    ]);
    expect(firstCall().url).toContain("/appointments/my-appointments");
  });

  it("create POSTs the appointment data", async () => {
    axios.mockResolvedValue({ data: { data: { id: 9 } } });
    await AppointmentService.create({ type: "vet" });
    expect(firstCall()).toMatchObject({
      method: "POST",
      data: { type: "vet" },
    });
    expect(firstCall().url).toContain("/appointments");
  });

  it("updateStatus PATCHes status + notes", async () => {
    axios.mockResolvedValue({ data: { data: {} } });
    await AppointmentService.updateStatus("9", "done", "all good");
    expect(firstCall()).toMatchObject({
      method: "PATCH",
      data: { status: "done", notes: "all good" },
    });
    expect(firstCall().url).toContain("/appointments/9/status");
  });

  it("checkAvailability returns response.data.available", async () => {
    axios.mockResolvedValue({ data: { available: true } });
    await expect(
      AppointmentService.checkAvailability("2026-07-01T10:00", 30, "vet"),
    ).resolves.toBe(true);
  });

  it("getByDateRange serializes dates to ISO params", async () => {
    axios.mockResolvedValue({ data: { data: [] } });
    const start = new Date("2026-07-01T00:00:00Z");
    const end = new Date("2026-07-31T00:00:00Z");
    await AppointmentService.getByDateRange(start, end);
    expect(firstCall().params).toEqual({
      start: start.toISOString(),
      end: end.toISOString(),
    });
  });

  it("maps ECONNABORTED to a 'Request timeout' error", async () => {
    axios.mockRejectedValue({ code: "ECONNABORTED" });
    await expect(AppointmentService.getById("9")).rejects.toThrow(
      "Request timeout",
    );
  });

  it("getProfessionalAppointments uses axios.get and returns the whole body", async () => {
    axios.get.mockResolvedValue({ data: { success: true, data: [] } });
    await expect(
      AppointmentService.getProfessionalAppointments("pro1"),
    ).resolves.toEqual({ success: true, data: [] });
    expect(axios.get.mock.calls[0][0]).toContain(
      "/appointments/professional/pro1",
    );
  });
});
