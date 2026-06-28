import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import subscriptionsApi from "./subscriptionsApi";

beforeEach(() => vi.clearAllMocks());

describe("subscriptionsApi", () => {
  it("create / getMine / getMineOne", async () => {
    api.post.mockResolvedValue({ data: {} });
    api.get.mockResolvedValue({ data: [] });
    await subscriptionsApi.create({ productId: "p1" });
    expect(api.post).toHaveBeenCalledWith("/subscriptions", { productId: "p1" });
    await subscriptionsApi.getMine();
    expect(api.get).toHaveBeenCalledWith("/subscriptions/mine");
    await subscriptionsApi.getMineOne("s1");
    expect(api.get).toHaveBeenCalledWith("/subscriptions/mine/s1");
  });

  it("update / cancel", async () => {
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
    await subscriptionsApi.update("s1", { qty: 2 });
    expect(api.patch).toHaveBeenCalledWith("/subscriptions/s1", { qty: 2 });
    await subscriptionsApi.cancel("s1");
    expect(api.delete).toHaveBeenCalledWith("/subscriptions/s1");
  });

  it("admin list / one / update", async () => {
    api.get.mockResolvedValue({ data: [] });
    api.patch.mockResolvedValue({ data: {} });
    await subscriptionsApi.getAllAdmin();
    expect(api.get).toHaveBeenCalledWith("/subscriptions/admin");
    await subscriptionsApi.getAdminOne("s1");
    expect(api.get).toHaveBeenCalledWith("/subscriptions/admin/s1");
    await subscriptionsApi.updateAdmin("s1", { status: "active" });
    expect(api.patch).toHaveBeenCalledWith("/subscriptions/admin/s1", {
      status: "active",
    });
  });

  it("getAnalytics defaults horizon=30 and unwraps data.data", async () => {
    api.get.mockResolvedValue({ data: { data: { demand: 5 } } });
    await expect(subscriptionsApi.getAnalytics()).resolves.toEqual({
      demand: 5,
    });
    expect(api.get).toHaveBeenCalledWith(
      "/subscriptions/admin/analytics?horizon=30",
    );
  });

  it("getProductCoverage unwraps data.data", async () => {
    api.get.mockResolvedValue({ data: { data: { p1: { activeSubs: 2 } } } });
    await expect(subscriptionsApi.getProductCoverage()).resolves.toEqual({
      p1: { activeSubs: 2 },
    });
    expect(api.get).toHaveBeenCalledWith(
      "/subscriptions/admin/product-coverage",
    );
  });
});
