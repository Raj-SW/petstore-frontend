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

import { useAuth } from "../../../context/AuthContext";
import SignUpModal from "./SignUpModal";

const defaultProps = {
  show: true,
  onHide: vi.fn(),
  showPassword: false,
  togglePasswordVisibility: vi.fn(),
  onLoginClick: vi.fn(),
};

const renderModal = (props = {}) =>
  render(<SignUpModal {...defaultProps} {...props} />);

/** Fill the minimal fields needed for a valid submission. */
const fillValidForm = async () => {
  await userEvent.type(screen.getByPlaceholderText(/full name/i), "Alice Smith");
  await userEvent.type(screen.getByPlaceholderText(/email address/i), "alice@example.com");
  await userEvent.type(screen.getByPlaceholderText(/phone number/i), "+23057001234");
  await userEvent.type(screen.getByPlaceholderText(/^address$/i), "123 Main St");
  // Both password fields — get them by placeholder
  const [pwdField, confirmField] = screen.getAllByPlaceholderText(/password/i);
  await userEvent.type(pwdField, "StrongPass1!");
  await userEvent.type(confirmField, "StrongPass1!");
  await userEvent.click(screen.getByRole("checkbox"));
};

describe("SignUpModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ signup: vi.fn() });
  });

  it("renders all required form fields", () => {
    renderModal();
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^address$/i)).toBeInTheDocument();
    // password + confirm password
    const pwdFields = screen.getAllByPlaceholderText(/password/i);
    expect(pwdFields.length).toBeGreaterThanOrEqual(2);
  });

  it("shows validation errors when submitting empty form", async () => {
    renderModal();
    fireEvent.submit(document.querySelector("form.auth-form"));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    renderModal();
    await userEvent.type(screen.getByPlaceholderText(/full name/i), "Bob");
    await userEvent.type(screen.getByPlaceholderText(/email address/i), "bob@example.com");
    await userEvent.type(screen.getByPlaceholderText(/phone number/i), "+23057001234");
    await userEvent.type(screen.getByPlaceholderText(/^address$/i), "456 Oak Ave");

    const [pwdField, confirmField] = screen.getAllByPlaceholderText(/password/i);
    await userEvent.type(pwdField, "StrongPass1!");
    await userEvent.type(confirmField, "DifferentPass1!");
    await userEvent.click(screen.getByRole("checkbox"));

    fireEvent.submit(document.querySelector("form.auth-form"));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error for a weak password (too short)", async () => {
    renderModal();
    await userEvent.type(screen.getByPlaceholderText(/full name/i), "Carol");
    await userEvent.type(screen.getByPlaceholderText(/email address/i), "carol@example.com");
    await userEvent.type(screen.getByPlaceholderText(/phone number/i), "+23057001234");
    await userEvent.type(screen.getByPlaceholderText(/^address$/i), "789 Pine Rd");

    const [pwdField] = screen.getAllByPlaceholderText(/password/i);
    await userEvent.type(pwdField, "weak");

    fireEvent.submit(document.querySelector("form.auth-form"));
    expect(
      await screen.findByText(/at least 8 characters/i)
    ).toBeInTheDocument();
  });

  it("shows error for password missing complexity requirements", async () => {
    renderModal();
    await userEvent.type(screen.getByPlaceholderText(/full name/i), "Dan");
    await userEvent.type(screen.getByPlaceholderText(/email address/i), "dan@example.com");
    await userEvent.type(screen.getByPlaceholderText(/phone number/i), "+23057001234");
    await userEvent.type(screen.getByPlaceholderText(/^address$/i), "1 Simple Lane");

    const [pwdField] = screen.getAllByPlaceholderText(/password/i);
    await userEvent.type(pwdField, "alllowercase1"); // no uppercase, no special char

    fireEvent.submit(document.querySelector("form.auth-form"));
    expect(
      await screen.findByText(/uppercase, lowercase, number, and special character/i)
    ).toBeInTheDocument();
  });

  it("calls signup API with valid data and hides the modal on success", async () => {
    const mockSignup = vi.fn().mockResolvedValue({ success: true });
    useAuth.mockReturnValue({ signup: mockSignup });
    const onHide = vi.fn();

    renderModal({ onHide });
    await fillValidForm();
    fireEvent.submit(document.querySelector("form.auth-form"));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "StrongPass1!",
        })
      );
    });
    await waitFor(() => expect(onHide).toHaveBeenCalled());
  });

  it("shows server error when signup API returns failure", async () => {
    const mockSignup = vi.fn().mockResolvedValue({ success: false, error: "Email already in use" });
    useAuth.mockReturnValue({ signup: mockSignup });

    renderModal();
    await fillValidForm();
    fireEvent.submit(document.querySelector("form.auth-form"));

    expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
  });
});
