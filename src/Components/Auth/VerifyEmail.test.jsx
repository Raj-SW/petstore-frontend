import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../../Services/api/authApi", () => ({
  default: { verifyEmail: vi.fn() },
}));

import authApi from "../../Services/api/authApi";
import VerifyEmail from "./VerifyEmail";

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => vi.clearAllMocks());

describe("VerifyEmail page", () => {
  it("calls the API with the token from the URL and shows success", async () => {
    authApi.verifyEmail.mockResolvedValue({ success: true });
    renderAt("/verify-email/tok-abc123");

    expect(await screen.findByText(/email verified/i)).toBeTruthy();
    expect(authApi.verifyEmail).toHaveBeenCalledWith("tok-abc123");
    expect(screen.getByRole("link", { name: /go to homepage/i })).toBeTruthy();
  });

  it("shows the verifying state while the request is in flight", () => {
    authApi.verifyEmail.mockReturnValue(new Promise(() => {})); // never resolves
    renderAt("/verify-email/tok-abc123");
    expect(screen.getByText(/verifying your email/i)).toBeTruthy();
  });

  it("shows a failure state with the server message on error", async () => {
    authApi.verifyEmail.mockRejectedValue(new Error("Invalid or expired verification token"));
    renderAt("/verify-email/bad-token");

    expect(await screen.findByText(/verification failed/i)).toBeTruthy();
    expect(screen.getByText(/invalid or expired verification token/i)).toBeTruthy();
  });

  it("fails immediately without calling the API when the token is missing", async () => {
    renderAt("/verify-email");

    expect(await screen.findByText(/verification failed/i)).toBeTruthy();
    expect(authApi.verifyEmail).not.toHaveBeenCalled();
  });
});
