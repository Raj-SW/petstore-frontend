import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import userProfileService from "./userProfileService";

beforeEach(() => vi.clearAllMocks());

describe("userProfileService", () => {
  it("updateUserProfile patches the profile route", async () => {
    api.patch.mockResolvedValue({ data: { ok: true } });
    await expect(
      userProfileService.updateUserProfile({ name: "Al" }),
    ).resolves.toEqual({ ok: true });
    expect(api.patch).toHaveBeenCalledWith("/users/update-profile", {
      name: "Al",
    });
  });

  it("changePassword patches the password route", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await userProfileService.changePassword({ current: "a", next: "b" });
    expect(api.patch).toHaveBeenCalledWith("/users/change-password", {
      current: "a",
      next: "b",
    });
  });

  it("addPet / updatePet / deletePet / getPet hit the pet routes", async () => {
    api.post.mockResolvedValue({ data: {} });
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
    api.get.mockResolvedValue({ data: {} });

    await userProfileService.addPet({ name: "Rex" });
    expect(api.post).toHaveBeenCalledWith("/pets", { name: "Rex" });

    await userProfileService.updatePet("9", { name: "Max" });
    expect(api.patch).toHaveBeenCalledWith("/pets/9", { name: "Max" });

    await userProfileService.deletePet("9");
    expect(api.delete).toHaveBeenCalledWith("/pets/9");

    await userProfileService.getPet("9");
    expect(api.get).toHaveBeenCalledWith("/pets/9");
  });
});
