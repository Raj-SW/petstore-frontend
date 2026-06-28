import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import inventoryApi from "./inventoryApi";

beforeEach(() => vi.clearAllMocks());

describe("inventoryApi", () => {
  it("getInventory cleans null/empty params", async () => {
    api.get.mockResolvedValue({ data: {} });
    await inventoryApi.getInventory({ page: 1, status: "", category: null, search: "dog" });
    expect(api.get).toHaveBeenCalledWith("/admin/inventory?page=1&search=dog");
  });

  it("getLowStock defaults the threshold to 10", async () => {
    api.get.mockResolvedValue({ data: {} });
    await inventoryApi.getLowStock();
    expect(api.get).toHaveBeenCalledWith("/admin/inventory/low-stock?threshold=10");
  });

  it("getMovements builds a per-product query", async () => {
    api.get.mockResolvedValue({ data: {} });
    await inventoryApi.getMovements("p1", { page: 2 });
    expect(api.get).toHaveBeenCalledWith("/admin/inventory/p1/movements?page=2");
  });

  it("restockProduct includes variantId only when provided", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await inventoryApi.restockProduct("p1", 5, "note");
    expect(api.patch).toHaveBeenCalledWith("/admin/inventory/p1/restock", {
      units: 5,
      note: "note",
    });

    await inventoryApi.restockProduct("p1", 5, "note", "v1");
    expect(api.patch).toHaveBeenLastCalledWith("/admin/inventory/p1/restock", {
      units: 5,
      note: "note",
      variantId: "v1",
    });
  });

  it("adjustStock includes variantId only when provided", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await inventoryApi.adjustStock("p1", 12, "recount");
    expect(api.patch).toHaveBeenCalledWith("/admin/inventory/p1/adjust", {
      newQuantity: 12,
      note: "recount",
    });
  });
});
