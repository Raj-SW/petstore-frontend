import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("axios");

// ContactSection uses import.meta.env.VITE_NODE_API_URL
// Vitest exposes import.meta.env automatically; we set it here for the test
vi.stubEnv("VITE_NODE_API_URL", "http://localhost:5000");

// ── Import (after mocks) ──────────────────────────────────────────────────────

import ContactSection from "./ContactSection";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ContactSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  it("renders without crashing", () => {
    render(<ContactSection />);
    expect(screen.getByText(/Connecting You with Care/i)).toBeInTheDocument();
  });

  it("renders name, email, and message form fields", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  it("renders the Send Message submit button", () => {
    render(<ContactSection />);
    expect(
      screen.getByRole("button", { name: /Send Message/i })
    ).toBeInTheDocument();
  });

  it("renders the promo carousel with at least one slide badge", () => {
    render(<ContactSection />);
    // The first slide badge is "Get 50% Discount"
    expect(screen.getByText(/Get 50% Discount/i)).toBeInTheDocument();
  });

  it("renders navigation dots for the promo carousel", () => {
    render(<ContactSection />);
    const dots = screen.getAllByRole("button", { name: /Slide \d/i });
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });

  it("updates form fields when user types", () => {
    render(<ContactSection />);
    const nameInput = screen.getByLabelText(/Your Name/i);
    const emailInput = screen.getByLabelText(/Your Email Address/i);
    const messageInput = screen.getByLabelText(/Message/i);

    fireEvent.change(nameInput, { target: { name: "name", value: "Alice" } });
    fireEvent.change(emailInput, { target: { name: "email", value: "alice@example.com" } });
    fireEvent.change(messageInput, { target: { name: "message", value: "Hello!" } });

    expect(nameInput.value).toBe("Alice");
    expect(emailInput.value).toBe("alice@example.com");
    expect(messageInput.value).toBe("Hello!");
  });

  it("calls axios.post and shows success feedback on valid submit", async () => {
    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { name: "name", value: "Bob" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email Address/i), {
      target: { name: "email", value: "bob@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { name: "message", value: "Great services!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText(/Message sent/i)
    ).toBeInTheDocument();
  });

  it("clears form fields after successful submit", async () => {
    render(<ContactSection />);

    const nameInput = screen.getByLabelText(/Your Name/i);
    const emailInput = screen.getByLabelText(/Your Email Address/i);
    const messageInput = screen.getByLabelText(/Message/i);

    fireEvent.change(nameInput, { target: { name: "name", value: "Carol" } });
    fireEvent.change(emailInput, { target: { name: "email", value: "carol@example.com" } });
    fireEvent.change(messageInput, { target: { name: "message", value: "Test" } });

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(emailInput.value).toBe("");
      expect(messageInput.value).toBe("");
    });
  });

  it("shows error feedback when axios.post fails", async () => {
    axios.post.mockRejectedValue(new Error("Network Error"));

    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { name: "name", value: "Dave" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email Address/i), {
      target: { name: "email", value: "dave@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { name: "message", value: "Problem here" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    expect(
      await screen.findByText(/Something went wrong/i)
    ).toBeInTheDocument();
  });

  it("disables submit button while sending", async () => {
    // Never resolves
    axios.post.mockReturnValue(new Promise(() => {}));

    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText(/Your Name/i), {
      target: { name: "name", value: "Eve" },
    });
    fireEvent.change(screen.getByLabelText(/Your Email Address/i), {
      target: { name: "email", value: "eve@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { name: "message", value: "Sending now..." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Sending/i })).toBeDisabled();
    });
  });
});
