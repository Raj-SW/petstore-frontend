import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import faqsApi from "./faqsApi";

beforeEach(() => vi.clearAllMocks());

describe("faqsApi", () => {
  it("getFaqs gets the public list", async () => {
    api.get.mockResolvedValue({ data: [] });
    await faqsApi.getFaqs();
    expect(api.get).toHaveBeenCalledWith("/faqs");
  });

  it("getFaqsAdmin gets the admin list", async () => {
    api.get.mockResolvedValue({ data: [] });
    await faqsApi.getFaqsAdmin();
    expect(api.get).toHaveBeenCalledWith("/faqs/admin/all");
  });

  it("createFaq posts data", async () => {
    api.post.mockResolvedValue({ data: {} });
    await faqsApi.createFaq({ q: "?" });
    expect(api.post).toHaveBeenCalledWith("/faqs", { q: "?" });
  });

  it("updateFaq patches by id", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await faqsApi.updateFaq("1", { q: "?" });
    expect(api.patch).toHaveBeenCalledWith("/faqs/1", { q: "?" });
  });

  it("deleteFaq deletes by id", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await faqsApi.deleteFaq("1");
    expect(api.delete).toHaveBeenCalledWith("/faqs/1");
  });
});
