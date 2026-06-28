import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import paymentsApi from "./paymentsApi";

beforeEach(() => vi.clearAllMocks());

describe("paymentsApi", () => {
  it("initializePayment posts the method and unwraps data.data", async () => {
    api.post.mockResolvedValue({ data: { data: { clientSecret: "cs" } } });
    await expect(paymentsApi.initializePayment("o1")).resolves.toEqual({
      clientSecret: "cs",
    });
    expect(api.post).toHaveBeenCalledWith("/payments/orders/o1/initialize", {
      paymentMethod: "stripe",
    });
  });

  it("confirmPayment posts intent + method and unwraps data.data", async () => {
    api.post.mockResolvedValue({ data: { data: { status: "ok" } } });
    await expect(
      paymentsApi.confirmPayment("o1", "pi_123"),
    ).resolves.toEqual({ status: "ok" });
    expect(api.post).toHaveBeenCalledWith("/payments/orders/o1/confirm", {
      paymentIntentId: "pi_123",
      paymentMethod: "stripe",
    });
  });
});
