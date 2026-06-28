import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock the service the hook depends on — factory defines fixtures inline
// (vi.mock is hoisted above imports).
vi.mock("../Services/localServices/appointmentService", () => ({
  default: {
    getAll: vi.fn(),
    getByType: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import AppointmentService from "../Services/localServices/appointmentService";
import { useAppointments } from "./useAppointments";

beforeEach(() => {
  vi.clearAllMocks();
  AppointmentService.getAll.mockResolvedValue([{ id: 1, type: "vet" }]);
  AppointmentService.getByType.mockResolvedValue([{ id: 2, type: "grooming" }]);
});

describe("useAppointments", () => {
  it("fetches all appointments on mount with default filters", async () => {
    const { result } = renderHook(() => useAppointments());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(AppointmentService.getAll).toHaveBeenCalled();
    expect(result.current.appointments).toEqual([{ id: 1, type: "vet" }]);
    expect(result.current.filters.type).toBe("all");
  });

  it("fetches by type when an initial type filter is given", async () => {
    const { result } = renderHook(() =>
      useAppointments({ type: "grooming" }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(AppointmentService.getByType).toHaveBeenCalledWith("grooming");
    expect(result.current.appointments).toEqual([{ id: 2, type: "grooming" }]);
  });

  it("captures errors from the service", async () => {
    AppointmentService.getAll.mockRejectedValueOnce(new Error("down"));
    const { result } = renderHook(() => useAppointments());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("down");
  });

  it("updateFilters merges into existing filters", async () => {
    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.updateFilters({ searchQuery: "rex" }));
    expect(result.current.filters.searchQuery).toBe("rex");
    expect(result.current.filters.type).toBe("all");
  });

  it("handleAppointmentSubmit appends the created appointment", async () => {
    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    AppointmentService.create.mockResolvedValueOnce({ id: 9, type: "vet" });
    await act(async () => {
      await result.current.handleAppointmentSubmit({ type: "vet" });
    });

    expect(AppointmentService.create).toHaveBeenCalledWith({ type: "vet" });
    expect(result.current.appointments).toContainEqual({ id: 9, type: "vet" });
  });

  it("handleAppointmentUpdate replaces the matching appointment", async () => {
    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    AppointmentService.update.mockResolvedValueOnce({ id: 1, type: "updated" });
    await act(async () => {
      await result.current.handleAppointmentUpdate(1, { type: "updated" });
    });

    expect(AppointmentService.update).toHaveBeenCalledWith(1, {
      type: "updated",
    });
    expect(result.current.appointments).toEqual([{ id: 1, type: "updated" }]);
  });

  it("handleAppointmentDelete removes the appointment", async () => {
    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    AppointmentService.delete.mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.handleAppointmentDelete(1);
    });

    expect(AppointmentService.delete).toHaveBeenCalledWith(1);
    expect(result.current.appointments).toEqual([]);
  });

  it("re-throws and records error when create fails", async () => {
    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    AppointmentService.create.mockRejectedValueOnce(new Error("nope"));
    await act(async () => {
      await expect(
        result.current.handleAppointmentSubmit({}),
      ).rejects.toThrow("nope");
    });
    expect(result.current.error).toBe("nope");
  });
});
