import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import announcementsApi from "./announcementsApi";

beforeEach(() => vi.clearAllMocks());

describe("announcementsApi", () => {
  it("createAnnouncement posts the payload", async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    await expect(
      announcementsApi.createAnnouncement({ subject: "Hi", productIds: [] }),
    ).resolves.toEqual({ ok: true });
    expect(api.post).toHaveBeenCalledWith("/announcements", {
      subject: "Hi",
      productIds: [],
    });
  });

  it("getAnnouncements gets the campaign history", async () => {
    api.get.mockResolvedValue({ data: [] });
    await announcementsApi.getAnnouncements();
    expect(api.get).toHaveBeenCalledWith("/announcements");
  });
});
