import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { GlobalToastProvider, useGlobalToast } from "./GlobalToastContext";

function Harness() {
  const { showToast } = useGlobalToast();
  return <button onClick={() => showToast("Saved!", "success")}>go</button>;
}

describe("GlobalToastContext", () => {
  it("useGlobalToast returns undefined outside a provider", () => {
    let received = "sentinel";
    function Probe() {
      received = useGlobalToast();
      return null;
    }
    render(<Probe />);
    expect(received).toBeUndefined();
  });

  it("showToast displays the message", () => {
    render(<Harness />, { wrapper: GlobalToastProvider });
    act(() => screen.getByText("go").click());
    expect(screen.getByText("Saved!")).toBeInTheDocument();
    expect(screen.getByText("Notice")).toBeInTheDocument();
  });
});
