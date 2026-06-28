import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import cartApi from "./cartApi";

beforeEach(() => vi.clearAllMocks());

describe("cartApi", () => {
  it("getCart unwraps response.data.data", async () => {
    api.get.mockResolvedValue({ data: { data: { items: [] } } });
    await expect(cartApi.getCart()).resolves.toEqual({ items: [] });
    expect(api.get).toHaveBeenCalledWith("/cart");
  });

  it("addToCart posts product/quantity/variant and unwraps", async () => {
    api.post.mockResolvedValue({ data: { data: { ok: 1 } } });
    await expect(cartApi.addToCart("p1", 2, "v1")).resolves.toEqual({ ok: 1 });
    expect(api.post).toHaveBeenCalledWith("/cart", {
      productId: "p1",
      quantity: 2,
      variantId: "v1",
    });
  });

  it("addToCart defaults quantity=1 and variant=null", async () => {
    api.post.mockResolvedValue({ data: { data: {} } });
    await cartApi.addToCart("p1");
    expect(api.post).toHaveBeenCalledWith("/cart", {
      productId: "p1",
      quantity: 1,
      variantId: null,
    });
  });

  it("updateItem patches quantity by id", async () => {
    api.patch.mockResolvedValue({ data: { data: {} } });
    await cartApi.updateItem("p1", 5);
    expect(api.patch).toHaveBeenCalledWith("/cart/p1", { quantity: 5 });
  });

  it("removeItem deletes by id", async () => {
    api.delete.mockResolvedValue({ data: { data: {} } });
    await cartApi.removeItem("p1");
    expect(api.delete).toHaveBeenCalledWith("/cart/p1");
  });

  it("clearCart deletes the whole cart", async () => {
    api.delete.mockResolvedValue({ data: { data: {} } });
    await cartApi.clearCart();
    expect(api.delete).toHaveBeenCalledWith("/cart/clear");
  });
});
