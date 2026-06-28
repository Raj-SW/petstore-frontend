import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import tipsApi from "./tipsApi";

beforeEach(() => vi.clearAllMocks());

describe("tipsApi", () => {
  it("getTips cleans params into a query string", async () => {
    api.get.mockResolvedValue({ data: [] });
    await tipsApi.getTips({ category: "health", search: "", page: 1, x: null });
    expect(api.get).toHaveBeenCalledWith("/tips?category=health&page=1");
  });

  it("getTips omits the query when params are all empty", async () => {
    api.get.mockResolvedValue({ data: [] });
    await tipsApi.getTips();
    expect(api.get).toHaveBeenCalledWith("/tips");
  });

  it("getTip / getTipsAdmin / getTipAdmin", async () => {
    api.get.mockResolvedValue({ data: {} });
    await tipsApi.getTip("slug");
    expect(api.get).toHaveBeenCalledWith("/tips/slug");
    await tipsApi.getTipsAdmin();
    expect(api.get).toHaveBeenCalledWith("/tips/admin/all");
    await tipsApi.getTipAdmin("5");
    expect(api.get).toHaveBeenCalledWith("/tips/admin/5");
  });

  it("createTip / updateTip / deleteTip", async () => {
    api.post.mockResolvedValue({ data: {} });
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
    await tipsApi.createTip({ t: 1 });
    expect(api.post).toHaveBeenCalledWith("/tips", { t: 1 });
    await tipsApi.updateTip("5", { t: 2 });
    expect(api.patch).toHaveBeenCalledWith("/tips/5", { t: 2 });
    await tipsApi.deleteTip("5");
    expect(api.delete).toHaveBeenCalledWith("/tips/5");
  });
});
