import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("../Services/api/authApi", () => ({
  default: {
    login: vi.fn(),
    signup: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    resendVerification: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

import authApi from "../Services/api/authApi";
import { AuthProvider, useAuth } from "./AuthContext";

// Build a JWT-shaped token whose payload.exp is `offsetSec` from now.
const makeToken = (offsetSec) => {
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + offsetSec }),
  );
  return `header.${payload}.sig`;
};

const setup = async () => {
  const hook = renderHook(() => useAuth(), { wrapper: AuthProvider });
  // checkAuthStatus runs on mount and flips loading to false.
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("AuthContext — mount / checkAuthStatus", () => {
  it("is unauthenticated when no token is stored", async () => {
    const { result } = await setup();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("restores the cached user when the token is valid", async () => {
    localStorage.setItem("vp_token", makeToken(3600));
    localStorage.setItem("vp_user", JSON.stringify({ id: "u1", name: "Al" }));
    const { result } = await setup();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: "u1", name: "Al" });
  });

  it("clears storage when the token is expired", async () => {
    localStorage.setItem("vp_token", makeToken(-3600));
    localStorage.setItem("vp_user", JSON.stringify({ id: "u1" }));
    const { result } = await setup();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("vp_token")).toBeNull();
    expect(localStorage.getItem("vp_user")).toBeNull();
  });

  it("treats a malformed token as expired", async () => {
    localStorage.setItem("vp_token", "not-a-jwt");
    const { result } = await setup();
    expect(result.current.user).toBeNull();
  });
});

describe("AuthContext — login", () => {
  it("stores token + user and returns success", async () => {
    authApi.login.mockResolvedValue({
      success: true,
      data: { user: { id: "u1" }, accessToken: "tok" },
    });
    const { result } = await setup();

    let res;
    await act(async () => {
      res = await result.current.login("a@b.co", "pw");
    });

    expect(res).toEqual({ success: true, user: { id: "u1" } });
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("vp_token")).toBe("tok");
    expect(JSON.parse(localStorage.getItem("vp_user"))).toEqual({ id: "u1" });
  });

  it("returns an error result when the API rejects", async () => {
    authApi.login.mockRejectedValue(new Error("Bad creds"));
    const { result } = await setup();

    let res;
    await act(async () => {
      res = await result.current.login("a@b.co", "pw");
    });

    expect(res).toEqual({ success: false, error: "Bad creds" });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("Bad creds");
  });

  it("fails when the response lacks an access token", async () => {
    authApi.login.mockResolvedValue({ success: true, data: { user: {} } });
    const { result } = await setup();

    let res;
    await act(async () => {
      res = await result.current.login("a@b.co", "pw");
    });
    expect(res.success).toBe(false);
  });
});

describe("AuthContext — signup / logout / updateUser", () => {
  it("signup returns a success message", async () => {
    authApi.signup.mockResolvedValue({ success: true });
    const { result } = await setup();
    let res;
    await act(async () => {
      res = await result.current.signup({ email: "a@b.co" });
    });
    expect(res.success).toBe(true);
    expect(res.message).toMatch(/created/i);
  });

  it("logout clears user and storage", async () => {
    localStorage.setItem("vp_token", makeToken(3600));
    localStorage.setItem("vp_user", JSON.stringify({ id: "u1" }));
    const { result } = await setup();
    expect(result.current.isAuthenticated).toBe(true);

    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("vp_token")).toBeNull();
  });

  it("updateUser merges fields and persists", async () => {
    authApi.login.mockResolvedValue({
      success: true,
      data: { user: { id: "u1", name: "Al" }, accessToken: "tok" },
    });
    const { result } = await setup();
    await act(async () => {
      await result.current.login("a@b.co", "pw");
    });

    act(() => result.current.updateUser({ avatar: "pic.jpg" }));
    expect(result.current.user).toEqual({
      id: "u1",
      name: "Al",
      avatar: "pic.jpg",
    });
    expect(JSON.parse(localStorage.getItem("vp_user")).avatar).toBe("pic.jpg");
  });
});

describe("AuthContext — auth:logout event", () => {
  it("clears state when apiClient dispatches auth:logout", async () => {
    localStorage.setItem("vp_token", makeToken(3600));
    localStorage.setItem("vp_user", JSON.stringify({ id: "u1" }));
    const { result } = await setup();
    expect(result.current.isAuthenticated).toBe(true);

    act(() => window.dispatchEvent(new Event("auth:logout")));
    await waitFor(() => expect(result.current.user).toBeNull());
    expect(localStorage.getItem("vp_token")).toBeNull();
  });
});
