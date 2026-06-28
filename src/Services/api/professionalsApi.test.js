import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import professionalsApi from "./professionalsApi";

beforeEach(() => vi.clearAllMocks());

describe("professionalsApi", () => {
  it("getProfessionals builds query / omits when empty", async () => {
    api.get.mockResolvedValue({ data: [] });
    await professionalsApi.getProfessionals({ role: "petTaxi" });
    expect(api.get).toHaveBeenCalledWith("/professionals?role=petTaxi");
    await professionalsApi.getProfessionals();
    expect(api.get).toHaveBeenLastCalledWith("/professionals");
  });

  it("getProfessionalsByRole unwraps data.data", async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1 }] } });
    await expect(
      professionalsApi.getProfessionalsByRole("vet"),
    ).resolves.toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith("/professionals/role/vet");
  });

  it("getAvailableProfessionals builds the available query", async () => {
    api.get.mockResolvedValue({ data: [] });
    await professionalsApi.getAvailableProfessionals({ date: "x" });
    expect(api.get).toHaveBeenCalledWith("/professionals/available?date=x");
  });

  it("getProfessionalById unwraps data.data", async () => {
    api.get.mockResolvedValue({ data: { data: { id: 1 } } });
    await expect(professionalsApi.getProfessionalById("1")).resolves.toEqual({
      id: 1,
    });
    expect(api.get).toHaveBeenCalledWith("/professionals/1");
  });

  it("updateProfessional patches the profile route", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await professionalsApi.updateProfessional("1", { bio: "hi" });
    expect(api.patch).toHaveBeenCalledWith("/professionals/1/profile", {
      bio: "hi",
    });
  });

  it("updateAvailability / toggleStatus / updateRating wrap their bodies", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await professionalsApi.updateAvailability("1", [{ day: "mon" }]);
    expect(api.patch).toHaveBeenCalledWith("/professionals/1/availability", {
      availability: [{ day: "mon" }],
    });
    await professionalsApi.toggleProfessionalStatus("1", false);
    expect(api.patch).toHaveBeenCalledWith("/professionals/1/status", {
      isActive: false,
    });
    await professionalsApi.updateProfessionalRating("1", 4.5);
    expect(api.patch).toHaveBeenCalledWith("/professionals/1/rating", {
      rating: 4.5,
    });
  });

  it("getProfessionalAppointments builds the per-pro query", async () => {
    api.get.mockResolvedValue({ data: [] });
    await professionalsApi.getProfessionalAppointments("1", { status: "done" });
    expect(api.get).toHaveBeenCalledWith(
      "/appointments/professional/1?status=done",
    );
  });
});
