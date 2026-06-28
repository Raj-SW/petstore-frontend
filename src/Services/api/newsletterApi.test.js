import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import newsletterApi from "./newsletterApi";

beforeEach(() => vi.clearAllMocks());

describe("newsletterApi", () => {
  it("subscribe posts the email", async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    await newsletterApi.subscribe("a@b.co");
    expect(api.post).toHaveBeenCalledWith("/newsletter", { email: "a@b.co" });
  });

  it("getSubscribersAdmin gets the admin list", async () => {
    api.get.mockResolvedValue({ data: [] });
    await newsletterApi.getSubscribersAdmin();
    expect(api.get).toHaveBeenCalledWith("/newsletter/admin/all");
  });
});
