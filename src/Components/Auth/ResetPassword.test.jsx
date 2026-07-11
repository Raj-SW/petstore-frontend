import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ResetPassword from "./ResetPassword";

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderWithToken = (token = "abc123") =>
  render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<div data-testid="home" />} />
      </Routes>
    </MemoryRouter>
  );

const renderWithoutToken = () =>
  render(
    <MemoryRouter initialEntries={["/reset-password"]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>
  );

const fillAndSubmit = async (user, pw = "Password1*", confirm = "Password1*") => {
  await user.type(screen.getByPlaceholderText(/at least 8 characters/i), pw);
  await user.type(screen.getByPlaceholderText(/repeat your password/i), confirm);
  await user.click(screen.getByRole("button", { name: /set password/i }));
};

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe("ResetPassword — rendering", () => {
  it("renders the set-password heading", () => {
    renderWithToken();
    expect(screen.getByRole("heading", { name: /set your password/i })).toBeInTheDocument();
  });

  it("renders new-password and confirm-password inputs", () => {
    renderWithToken();
    expect(screen.getByPlaceholderText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/repeat your password/i)).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderWithToken();
    expect(screen.getByRole("button", { name: /set password/i })).toBeInTheDocument();
  });

  it("renders a back-to-home link", () => {
    renderWithToken();
    expect(screen.getByRole("link", { name: /back to home/i })).toBeInTheDocument();
  });

  it("new-password input has a show/hide toggle", () => {
    renderWithToken();
    expect(screen.getByRole("button", { name: /show password/i })).toBeInTheDocument();
  });

  it("confirm-password input has no show/hide toggle — only one toggle exists", () => {
    renderWithToken();
    expect(screen.getAllByRole("button", { name: /show password|hide password/i })).toHaveLength(1);
  });
});

// ── No-token state ────────────────────────────────────────────────────────────

describe("ResetPassword — missing token", () => {
  it("shows an error alert when no token is in the URL", () => {
    renderWithoutToken();
    expect(screen.getByRole("alert")).toHaveTextContent(/invalid or missing/i);
  });

  it("disables the submit button when no token is in the URL", () => {
    renderWithoutToken();
    expect(screen.getByRole("button", { name: /set password/i })).toBeDisabled();
  });
});

// ── Password visibility toggle ────────────────────────────────────────────────

describe("ResetPassword — visibility toggle", () => {
  it("toggles new-password input between password and text", async () => {
    const user = userEvent.setup();
    renderWithToken();
    const input = screen.getByPlaceholderText(/at least 8 characters/i);
    expect(input).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(input).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("confirm-password input is always type=password", () => {
    renderWithToken();
    expect(screen.getByPlaceholderText(/repeat your password/i)).toHaveAttribute("type", "password");
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("ResetPassword — client-side validation", () => {
  it("shows error when password is shorter than 8 characters", async () => {
    const user = userEvent.setup();
    renderWithToken();
    await fillAndSubmit(user, "short", "short");
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it("shows mismatch error when passwords differ", async () => {
    const user = userEvent.setup();
    renderWithToken();
    await fillAndSubmit(user, "Password1*", "Different1*");
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("does not call fetch when validation fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    renderWithToken();
    await fillAndSubmit(user, "short", "short");
    await screen.findByText(/at least 8 characters/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ── Successful submission ─────────────────────────────────────────────────────

describe("ResetPassword — successful reset", () => {
  it("sends PATCH to /api/auth/reset-password with token and password", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const user = userEvent.setup();
    renderWithToken("mytoken");
    await fillAndSubmit(user);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/reset-password",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ token: "mytoken", password: "Password1*" }),
        })
      )
    );
  });

  it("shows success message after a valid reset", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const user = userEvent.setup();
    renderWithToken();
    await fillAndSubmit(user);

    expect(await screen.findByText(/password set successfully/i)).toBeInTheDocument();
  });

  it("redirects to home after 3 seconds on success", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    renderWithToken();
    await fillAndSubmit(user);
    await screen.findByText(/password set successfully/i);

    vi.advanceTimersByTime(3000);
    await waitFor(() =>
      expect(screen.getByTestId("home")).toBeInTheDocument()
    );

    vi.useRealTimers();
  });
});

// ── API / network errors ──────────────────────────────────────────────────────

describe("ResetPassword — error handling", () => {
  it("shows the API error message from the response body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid or expired reset token" }),
    });

    const user = userEvent.setup();
    renderWithToken();
    await fillAndSubmit(user);

    expect(await screen.findByText(/invalid or expired reset token/i)).toBeInTheDocument();
  });

  it("shows fallback message when response body has no message field", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const user = userEvent.setup();
    renderWithToken();
    await fillAndSubmit(user);

    expect(await screen.findByText(/failed to reset password/i)).toBeInTheDocument();
  });

  it("shows a generic error when fetch itself throws", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network down"));

    const user = userEvent.setup();
    renderWithToken();
    await fillAndSubmit(user);

    expect(await screen.findByText(/an error occurred/i)).toBeInTheDocument();
  });
});
