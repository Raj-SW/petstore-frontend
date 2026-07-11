import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import adminProfessionalsApi from "./adminProfessionalsApi";

beforeEach(() => vi.clearAllMocks());

describe("adminProfessionalsApi", () => {
  it("list builds a query string", async () => {
    api.get.mockResolvedValue({ data: { data: [], pagination: {} } });
    await adminProfessionalsApi.list({ role: "groomer", status: "active" });
    expect(api.get).toHaveBeenCalledWith("/admin/professionals?role=groomer&status=active");
  });

  it("create posts to the collection", async () => {
    api.post.mockResolvedValue({ data: { data: {} } });
    await adminProfessionalsApi.create({ name: "A" });
    expect(api.post).toHaveBeenCalledWith("/admin/professionals", { name: "A" });
  });

  it("promote posts to /promote", async () => {
    api.post.mockResolvedValue({ data: { data: {} } });
    await adminProfessionalsApi.promote({ userId: "1", role: "groomer", professionalInfo: {} });
    expect(api.post).toHaveBeenCalledWith("/admin/professionals/promote", { userId: "1", role: "groomer", professionalInfo: {} });
  });

  it("update patches professionalInfo", async () => {
    api.patch.mockResolvedValue({ data: { data: {} } });
    await adminProfessionalsApi.update("42", { bio: "x" });
    expect(api.patch).toHaveBeenCalledWith("/admin/professionals/42", { professionalInfo: { bio: "x" } });
  });

  it("toggleStatus patches /status", async () => {
    api.patch.mockResolvedValue({ data: { data: {} } });
    await adminProfessionalsApi.toggleStatus("42", false);
    expect(api.patch).toHaveBeenCalledWith("/admin/professionals/42/status", { isActive: false });
  });

  it("offboard deletes", async () => {
    api.delete.mockResolvedValue({ data: { data: {} } });
    await adminProfessionalsApi.offboard("42");
    expect(api.delete).toHaveBeenCalledWith("/admin/professionals/42");
  });

  it("searchUsers hits the admin users endpoint", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });
    await adminProfessionalsApi.searchUsers("jane");
    expect(api.get).toHaveBeenCalledWith("/admin/users?search=jane&role=customer");
  });
});
