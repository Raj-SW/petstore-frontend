import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return {
    ...real,
    useLocation: () => ({ pathname: "/petshop" }),
    useNavigate: () => mockNavigate,
  };
});

// framer-motion: render children directly without animations
vi.mock("framer-motion", async () => {
  const React = await import("react");

  const MotionDiv = React.forwardRef(
    ({ children, className, style, onClick, onMouseMove, ...rest }, ref) =>
      React.createElement(
        "div",
        { ref, className, style, onClick, onMouseMove },
        children
      )
  );
  MotionDiv.displayName = "MotionDiv";

  const MotionForm = React.forwardRef(
    ({ children, className, style, onSubmit, onMouseMove, ...rest }, ref) =>
      React.createElement(
        "form",
        { ref, className, style, onSubmit, onMouseMove },
        children
      )
  );
  MotionForm.displayName = "MotionForm";

  const MotionButton = React.forwardRef(
    ({ children, className, style, onClick, type, ...rest }, ref) =>
      React.createElement(
        "button",
        { ref, className, style, onClick, type },
        children
      )
  );
  MotionButton.displayName = "MotionButton";

  return {
    motion: {
      div: MotionDiv,
      form: MotionForm,
      button: MotionButton,
    },
    AnimatePresence: ({ children }) => children,
  };
});

import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use real timers — userEvent v12 doesn't support fake timer integration
    vi.useRealTimers();
  });

  it("renders the search input on /petshop", () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText(/search for products/i)).toBeInTheDocument();
  });

  it("returns null when pathname is not in showInPages", () => {
    const { container } = render(<SearchBar showInPages={["/other"]} />);
    expect(container.firstChild).toBeNull();
  });

  it("updates the input value as the user types", async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for products/i);
    await userEvent.type(input, "cat food");
    expect(input).toHaveValue("cat food");
  });

  it("shows a Search button when the input has text", async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for products/i);
    // No button before typing
    expect(screen.queryByRole("button", { name: /search/i })).not.toBeInTheDocument();
    await userEvent.type(input, "dogs");
    expect(await screen.findByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("navigates to /petshop?search=... on form submit", async () => {
    // Spy on setTimeout so we can fast-forward the 400ms delay
    vi.useFakeTimers();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for products/i);

    // Use fireEvent.change to avoid userEvent+fakeTimers incompatibility
    fireEvent.change(input, { target: { value: "dog toys" } });

    // Submit the form directly
    fireEvent.submit(document.querySelector("form"));

    // Fast-forward the 400 ms deferred navigate inside handleSearch
    vi.runAllTimers();
    vi.useRealTimers();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("dog")
      );
    });
  });

  it("navigates when Enter key is pressed in the input", async () => {
    vi.useFakeTimers();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for products/i);

    fireEvent.change(input, { target: { value: "hamster" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    vi.runAllTimers();
    vi.useRealTimers();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("hamster")
      );
    });
  });

  it("does not navigate when search query is empty", async () => {
    vi.useFakeTimers();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for products/i);

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    vi.runAllTimers();
    vi.useRealTimers();

    // Allow any microtasks to settle
    await Promise.resolve();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
  });

  it("strips angle brackets from the query before navigating", async () => {
    vi.useFakeTimers();
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search for products/i);

    // Type a value containing < > — sanitizeInput strips them
    fireEvent.change(input, { target: { value: "<b>bold</b>" } });
    fireEvent.submit(document.querySelector("form"));

    vi.runAllTimers();
    vi.useRealTimers();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
      const url = mockNavigate.mock.calls[0][0];
      expect(url).not.toContain("%3C"); // URL-encoded <
      expect(url).not.toContain("%3E"); // URL-encoded >
    });
  });
});
