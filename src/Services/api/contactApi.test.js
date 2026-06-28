import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import contactApi from "./contactApi";

beforeEach(() => vi.clearAllMocks());

describe("contactApi", () => {
  it("submitContact posts the form data", async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    await contactApi.submitContact({ name: "Al" });
    expect(api.post).toHaveBeenCalledWith("/contact", { name: "Al" });
  });

  it("getContactsAdmin drops empty/undefined/null params from the query", async () => {
    api.get.mockResolvedValue({ data: [] });
    await contactApi.getContactsAdmin({
      status: "new",
      page: 2,
      search: "",
      tag: undefined,
      x: null,
    });
    expect(api.get).toHaveBeenCalledWith(
      "/contact/admin/all?status=new&page=2",
    );
  });

  it("getContactsAdmin omits the query entirely when no usable params", async () => {
    api.get.mockResolvedValue({ data: [] });
    await contactApi.getContactsAdmin({ search: "" });
    expect(api.get).toHaveBeenCalledWith("/contact/admin/all");
  });

  it("updateContact patches by id", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await contactApi.updateContact("3", { status: "read" });
    expect(api.patch).toHaveBeenCalledWith("/contact/3", { status: "read" });
  });

  it("replyContact posts the message", async () => {
    api.post.mockResolvedValue({ data: {} });
    await contactApi.replyContact("3", "Thanks!");
    expect(api.post).toHaveBeenCalledWith("/contact/3/reply", {
      message: "Thanks!",
    });
  });

  it("deleteContact deletes by id", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await contactApi.deleteContact("3");
    expect(api.delete).toHaveBeenCalledWith("/contact/3");
  });
});
