import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import feedbackApi from "./feedbackApi";

beforeEach(() => vi.clearAllMocks());

describe("feedbackApi", () => {
  it("submitFeedback posts the FormData as-is", async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    const fd = new FormData();
    await feedbackApi.submitFeedback(fd);
    expect(api.post).toHaveBeenCalledWith("/feedback", fd);
  });

  it("getFeedback cleans params and builds the query", async () => {
    api.get.mockResolvedValue({ data: [] });
    await feedbackApi.getFeedback({ limit: 3, search: "", missing: null });
    expect(api.get).toHaveBeenCalledWith("/feedback?limit=3");
  });

  it("getFeedback omits the query when params are all empty", async () => {
    api.get.mockResolvedValue({ data: [] });
    await feedbackApi.getFeedback();
    expect(api.get).toHaveBeenCalledWith("/feedback");
  });

  it("getFeedbackAdmin gets the admin list", async () => {
    api.get.mockResolvedValue({ data: [] });
    await feedbackApi.getFeedbackAdmin();
    expect(api.get).toHaveBeenCalledWith("/feedback/admin/all");
  });

  it("updateFeedback patches by id", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await feedbackApi.updateFeedback("2", { approved: true });
    expect(api.patch).toHaveBeenCalledWith("/feedback/2", { approved: true });
  });

  it("deleteFeedback deletes by id", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await feedbackApi.deleteFeedback("2");
    expect(api.delete).toHaveBeenCalledWith("/feedback/2");
  });
});
