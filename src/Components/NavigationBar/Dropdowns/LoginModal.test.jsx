import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ showAuthToast: vi.fn() }),
}));

// ForgotPasswordModal has its own network dependencies; stub it out.
vi.mock("../../Auth/ForgotPasswordModal", () => ({
  default: ({ show }) =>
    show ? <div data-testid="forgot-modal" /> : null,
}));

import { useAuth } from "../../../context/AuthContext";
import LoginModal from "./LoginModal";

const defaultProps = {
  show: true,
  onHide: vi.fn(),
  showPassword: false,
  togglePasswordVisibility: vi.fn(),
  onSignUpClick: vi.fn(),
};

const renderModal = (props = {}) =>
  render(<LoginModal {...defaultProps} {...props} />);

describe("LoginModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: vi.fn() });
  });

  it("renders email and password inputs", () => {
    renderModal();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty fields", async () => {
    renderModal();
    fireEvent.submit(document.querySelector("form.auth-form"));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it("shows email format validation error for invalid email", async () => {
    renderModal();
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), "notanemail");
    fireEvent.submit(document.querySelector("form.auth-form"));
    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });

  it("calls the login function with valid credentials", async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    useAuth.mockReturnValue({ login: mockLogin });
    const onHide = vi.fn();

    renderModal({ onHide });

    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), "user@example.com");
    await userEvent.type(screen.getByPlaceholderText(/••••••••/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@example.com", "password123");
    });
  });

  it("displays an alert message when login fails", async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: false, error: "Invalid credentials" });
    useAuth.mockReturnValue({ login: mockLogin });

    renderModal();

    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), "user@example.com");
    await userEvent.type(screen.getByPlaceholderText(/••••••••/i), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it("renders the Forgot password button", () => {
    renderModal();
    expect(screen.getByRole("button", { name: /forgot password/i })).toBeInTheDocument();
  });

  it("opens the ForgotPasswordModal when Forgot password is clicked", async () => {
    renderModal();
    expect(screen.queryByTestId("forgot-modal")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /forgot password/i }));
    expect(await screen.findByTestId("forgot-modal")).toBeInTheDocument();
  });
});
