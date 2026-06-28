import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import settingsApi from "./settingsApi";

beforeEach(() => vi.clearAllMocks());

describe("settingsApi", () => {
  it("getSettings prefers data.data", async () => {
    api.get.mockResolvedValue({ data: { data: { taxRate: 15 } } });
    await expect(settingsApi.getSettings()).resolves.toEqual({ taxRate: 15 });
    expect(api.get).toHaveBeenCalledWith("/settings");
  });

  it("getSettings falls back to data when data.data is absent", async () => {
    api.get.mockResolvedValue({ data: { taxRate: 10 } });
    await expect(settingsApi.getSettings()).resolves.toEqual({ taxRate: 10 });
  });

  it("updateSettings patches and unwraps", async () => {
    api.patch.mockResolvedValue({ data: { data: { shippingFee: 5 } } });
    await expect(
      settingsApi.updateSettings({ shippingFee: 5 }),
    ).resolves.toEqual({ shippingFee: 5 });
    expect(api.patch).toHaveBeenCalledWith("/settings", { shippingFee: 5 });
  });
});
