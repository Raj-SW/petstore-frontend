import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import appointmentsApi from "./appointmentsApi";

beforeEach(() => vi.clearAllMocks());

describe("appointmentsApi", () => {
  it("createAppointment posts the data", async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });
    await appointmentsApi.createAppointment({ type: "vet" });
    expect(api.post).toHaveBeenCalledWith("/appointments", { type: "vet" });
  });

  it("getMyAppointments unwraps response.data.data", async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1 }] } });
    await expect(appointmentsApi.getMyAppointments()).resolves.toEqual([
      { id: 1 },
    ]);
    expect(api.get).toHaveBeenCalledWith("/appointments/my-appointments");
  });

  it("getProfessionalAppointments builds a query string", async () => {
    api.get.mockResolvedValue({ data: [] });
    await appointmentsApi.getProfessionalAppointments({ status: "pending" });
    expect(api.get).toHaveBeenCalledWith(
      "/appointments/professional-appointments?status=pending",
    );
  });

  it("getProfessionalAppointments omits query when empty", async () => {
    api.get.mockResolvedValue({ data: [] });
    await appointmentsApi.getProfessionalAppointments();
    expect(api.get).toHaveBeenCalledWith(
      "/appointments/professional-appointments",
    );
  });

  it("getAppointmentById gets by id", async () => {
    api.get.mockResolvedValue({ data: {} });
    await appointmentsApi.getAppointmentById("9");
    expect(api.get).toHaveBeenCalledWith("/appointments/9");
  });

  it("updateAppointmentStatus patches status", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await appointmentsApi.updateAppointmentStatus("9", "confirmed");
    expect(api.patch).toHaveBeenCalledWith("/appointments/9/status", {
      status: "confirmed",
    });
  });

  it("cancelAppointment deletes by id", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await appointmentsApi.cancelAppointment("9");
    expect(api.delete).toHaveBeenCalledWith("/appointments/9");
  });

  it("getAvailableSlots passes date as params", async () => {
    api.get.mockResolvedValue({ data: [] });
    await appointmentsApi.getAvailableSlots("pro1", "2026-07-01");
    expect(api.get).toHaveBeenCalledWith(
      "/appointments/available-slots/pro1",
      { params: { date: "2026-07-01" } },
    );
  });

  it("rescheduleAppointment patches dateTime", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await appointmentsApi.rescheduleAppointment("9", "2026-07-01T10:00");
    expect(api.patch).toHaveBeenCalledWith("/appointments/9/reschedule", {
      dateTime: "2026-07-01T10:00",
    });
  });

  it("getAllAppointments hits the admin route with query", async () => {
    api.get.mockResolvedValue({ data: [] });
    await appointmentsApi.getAllAppointments({ page: 2 });
    expect(api.get).toHaveBeenCalledWith("/admin/appointments?page=2");
  });
});
