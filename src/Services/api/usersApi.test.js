import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import usersApi from "./usersApi";

beforeEach(() => vi.clearAllMocks());

describe("usersApi", () => {
  it("getUsers builds query / omits when empty", async () => {
    api.get.mockResolvedValue({ data: [] });
    await usersApi.getUsers({ role: "admin", page: 1 });
    expect(api.get).toHaveBeenCalledWith("/admin/users?role=admin&page=1");
    await usersApi.getUsers();
    expect(api.get).toHaveBeenLastCalledWith("/admin/users");
  });

  it("updateUserRole / toggleUserStatus wrap their bodies", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await usersApi.updateUserRole("9", "admin");
    expect(api.patch).toHaveBeenCalledWith("/admin/users/9/role", {
      role: "admin",
    });
    await usersApi.toggleUserStatus("9", false);
    expect(api.patch).toHaveBeenCalledWith("/admin/users/9/status", {
      isActive: false,
    });
  });

  it("deleteUser deletes by id", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await usersApi.deleteUser("9");
    expect(api.delete).toHaveBeenCalledWith("/admin/users/9");
  });

  it("getUserPets unwraps response.data.data", async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1 }] } });
    await expect(usersApi.getUserPets()).resolves.toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith("/pets");
  });

  it("uploadAvatar patches FormData with the avatar field", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await usersApi.uploadAvatar(new Blob(["img"]));
    const [path, body] = api.patch.mock.calls[0];
    expect(path).toBe("/users/upload-avatar");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("avatar")).toBeInstanceOf(Blob);
  });
});
