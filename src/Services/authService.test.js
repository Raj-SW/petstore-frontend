import { describe, it, expect } from "vitest";
import authService from "./authService";
import authApi from "./api/authApi";

describe("authService", () => {
  it("re-exports authApi unchanged (backward-compat alias)", () => {
    expect(authService).toBe(authApi);
    expect(typeof authService.login).toBe("function");
  });
});
