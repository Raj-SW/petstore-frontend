/**
 * Unit tests for the apiClient response interceptor (audit P1 #7).
 *
 * A 401 from a credential-verification endpoint (login, change-password)
 * means "wrong credentials in this request" and must NOT dispatch the
 * global auth:logout event — previously a typo'd current password in the
 * profile's change-password form logged the user out of the entire app.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import apiClient from "./apiClient";

// Grab the registered response interceptor's rejection handler so we can
// invoke it directly with synthetic axios errors — no network needed.
const rejectedHandler =
  apiClient.interceptors.response.handlers[0].rejected;

const make401 = (url) => ({
  config: { url },
  response: { status: 401, data: { message: "Unauthorized" } },
});

describe("apiClient — 401 auto-logout scoping", () => {
  let logoutSpy;

  beforeEach(() => {
    logoutSpy = vi.fn();
    window.addEventListener("auth:logout", logoutSpy);
  });

  afterEach(() => {
    window.removeEventListener("auth:logout", logoutSpy);
  });

  it("dispatches auth:logout for a 401 on a normal endpoint (expired session)", async () => {
    await expect(rejectedHandler(make401("/orders/my-orders"))).rejects.toBeTruthy();
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("does NOT log out on a 401 from /auth/login (wrong credentials)", async () => {
    await expect(rejectedHandler(make401("/auth/login"))).rejects.toBeTruthy();
    expect(logoutSpy).not.toHaveBeenCalled();
  });

  it("does NOT log out on a 401 from change-password (typo'd current password)", async () => {
    await expect(rejectedHandler(make401("/users/change-password"))).rejects.toBeTruthy();
    expect(logoutSpy).not.toHaveBeenCalled();
  });

  it("still surfaces the server message as the rejected error", async () => {
    const err = await rejectedHandler(make401("/users/change-password")).catch((e) => e);
    expect(err.message).toBe("Unauthorized");
    expect(err.status).toBe(401);
  });

  it("still logs out on 403 account-deactivated", async () => {
    const error = {
      config: { url: "/orders" },
      response: { status: 403, data: { message: "Your account has been deactivated" } },
    };
    await expect(rejectedHandler(error)).rejects.toBeTruthy();
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });
});
