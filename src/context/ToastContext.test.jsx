import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ToastProvider, useToast } from "./ToastContext";

// A tiny consumer that exposes the toast API via buttons.
function Harness({ onReady }) {
  const toast = useToast();
  onReady?.(toast);
  return (
    <div>
      <button onClick={() => toast.addToast("Hello", "success")}>add</button>
      <button onClick={() => toast.showCartToast("add", "Bone")}>cart-add</button>
      <button onClick={() => toast.showCartToast("remove", "Bone")}>
        cart-remove
      </button>
      <button onClick={() => toast.showAuthToast("login", "success")}>
        auth
      </button>
    </div>
  );
}

const renderToasts = () => {
  let api;
  render(<Harness onReady={(t) => (api = t)} />, {
    wrapper: ToastProvider,
  });
  return () => api;
};

describe("useToast", () => {
  it("throws when used outside a ToastProvider", () => {
    expect(() => render(<Harness />)).toThrow(
      /must be used within a ToastProvider/,
    );
  });

  it("addToast renders a toast with the message", () => {
    renderToasts();
    act(() => screen.getByText("add").click());
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("showCartToast composes add/remove messages", () => {
    renderToasts();
    act(() => screen.getByText("cart-add").click());
    expect(screen.getByText("Bone added to cart")).toBeInTheDocument();

    act(() => screen.getByText("cart-remove").click());
    expect(screen.getByText("Bone removed from cart")).toBeInTheDocument();
  });

  it("showAuthToast maps action/status to a friendly message", () => {
    renderToasts();
    act(() => screen.getByText("auth").click());
    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
  });
});
