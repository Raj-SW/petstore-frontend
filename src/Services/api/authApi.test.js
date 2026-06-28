import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import authApi from "./authApi";

beforeEach(() => vi.clearAllMocks());

describe("authApi", () => {
  it("login posts credentials and returns response.data", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    await expect(authApi.login("a@b.co", "pw")).resolves.toEqual({
      success: true,
    });
    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "a@b.co",
      password: "pw",
    });
  });

  it("signup posts the user payload", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    await authApi.signup({ email: "a@b.co" });
    expect(api.post).toHaveBeenCalledWith("/auth/signup", { email: "a@b.co" });
  });

  it("logout resolves locally without a server call", async () => {
    await expect(authApi.logout()).resolves.toEqual({ success: true });
    expect(api.post).not.toHaveBeenCalled();
  });

  it("getCurrentUser / getProfile both read /users/me", async () => {
    api.get.mockResolvedValue({ data: { id: 1 } });
    await authApi.getCurrentUser();
    expect(api.get).toHaveBeenCalledWith("/users/me");
    await authApi.getProfile();
    expect(api.get).toHaveBeenLastCalledWith("/users/me");
  });

  it("forgotPassword posts the email", async () => {
    api.post.mockResolvedValue({ data: {} });
    await authApi.forgotPassword("a@b.co");
    expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", {
      email: "a@b.co",
    });
  });

  it("resetPassword patches token + password", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await authApi.resetPassword("tok", "newpw");
    expect(api.patch).toHaveBeenCalledWith("/auth/reset-password", {
      token: "tok",
      password: "newpw",
    });
  });

  it("resendVerification posts the email", async () => {
    api.post.mockResolvedValue({ data: {} });
    await authApi.resendVerification("a@b.co");
    expect(api.post).toHaveBeenCalledWith("/auth/resend-verification", {
      email: "a@b.co",
    });
  });

  it("updateProfile patches the profile route", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await authApi.updateProfile({ name: "Al" });
    expect(api.patch).toHaveBeenCalledWith("/users/update-profile", {
      name: "Al",
    });
  });

  it("changePassword patches current + new password", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await authApi.changePassword("old", "new");
    expect(api.patch).toHaveBeenCalledWith("/users/change-password", {
      currentPassword: "old",
      newPassword: "new",
    });
  });

  it("deleteAccount deletes the account route", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await authApi.deleteAccount();
    expect(api.delete).toHaveBeenCalledWith("/users/delete-account");
  });
});
