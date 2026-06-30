import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../Services/api/contactApi", () => ({
  default: {
    submitContact: vi.fn(),
  },
}));

vi.mock("../../Services/api/advertsApi", () => ({
  default: {
    getAdverts: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

const mockAddToast = vi.fn();
vi.mock("../../context/ToastContext", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// GoogleMap renders an iframe — stub it out to avoid external deps
vi.mock("../../Components/Common/GoogleMap", () => ({
  default: ({ title }) => <div data-testid="google-map">{title}</div>,
  CLINIC_LOCATION: "VitalPaws Mauritius",
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import contactApi from "../../Services/api/contactApi";
import ContactPage from "./ContactPage";

// ── Helpers ───────────────────────────────────────────────────────────────────

const renderPage = () =>
  render(
    <MemoryRouter>
      <ContactPage />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ContactPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contactApi.submitContact.mockResolvedValue({});
  });

  it("renders all form fields", () => {
    renderPage();
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send Message/i })).toBeInTheDocument();
  });

  it("renders the page hero heading", () => {
    renderPage();
    expect(screen.getByText(/Compassionate Care/i)).toBeInTheDocument();
  });

  it("renders social links", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /WhatsApp/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Facebook/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Instagram/i })).toBeInTheDocument();
  });

  it("shows validation error toast when submitting empty form", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/fill in/i),
        "error"
      );
    });
    expect(contactApi.submitContact).not.toHaveBeenCalled();
  });

  it("shows validation error when only name is filled", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "Alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/fill in/i),
        "error"
      );
    });
  });

  it("calls contactApi.submitContact and shows success toast on valid submit", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email Address/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "Hello, I need help with my dog." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(contactApi.submitContact).toHaveBeenCalledTimes(1);
    });

    expect(contactApi.submitContact).toHaveBeenCalledWith({
      name: "Alice",
      email: "alice@example.com",
      message: "Hello, I need help with my dog.",
    });

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/sent/i),
        "success"
      );
    });
  });

  it("clears the form after successful submit", async () => {
    renderPage();

    const nameInput = screen.getByLabelText(/Your Name/i);
    const emailInput = screen.getByLabelText(/Your Email Address/i);
    const messageInput = screen.getByLabelText(/Message/i);

    fireEvent.change(nameInput, { target: { value: "Bob" } });
    fireEvent.change(emailInput, { target: { value: "bob@example.com" } });
    fireEvent.change(messageInput, { target: { value: "Test message" } });

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(contactApi.submitContact).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(emailInput.value).toBe("");
      expect(messageInput.value).toBe("");
    });
  });

  it("shows error toast when API call fails", async () => {
    contactApi.submitContact.mockRejectedValue({
      response: { data: { message: "Server error" } },
    });

    renderPage();

    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "Carol" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email Address/i), {
      target: { value: "carol@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "Some message" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Server error", "error");
    });
  });

  it("disables the submit button while sending", async () => {
    // Never resolves so we can observe the loading state
    contactApi.submitContact.mockReturnValue(new Promise(() => {}));

    renderPage();

    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { value: "Dave" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email Address/i), {
      target: { value: "dave@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "Quick question" },
    });

    const btn = screen.getByRole("button", { name: /Send Message/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Sending/i })).toBeDisabled();
    });
  });
});
