import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../../../Services/api/settingsApi", () => ({
  default: {
    getSettings: vi.fn().mockResolvedValue({
      shippingFlatFee: 50,
      freeShippingThreshold: 500,
      taxRatePercent: 15,
      taxInclusive: true,
    }),
    updateSettings: vi.fn().mockResolvedValue({
      shippingFlatFee: 50,
      freeShippingThreshold: 500,
      taxRatePercent: 15,
      taxInclusive: true,
    }),
  },
}));

vi.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("@/Components/ui/select", () => ({
  Select: ({ children, value }) => <div data-testid="select" data-value={value}>{children}</div>,
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <option value={value}>{children}</option>,
  SelectValue: () => null,
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => ({ children, ...props }) =>
      <div data-motion={tag} {...props}>{children}</div>,
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
}));

import AdminSettings from "./AdminSettings";
import settingsApi from "../../../Services/api/settingsApi";

describe("AdminSettings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the Settings heading", () => {
    render(<AdminSettings />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders all five tab buttons", () => {
    render(<AdminSettings />);
    ["General", "Store", "Appearance", "Notifications", "Security"].forEach((tab) => {
      expect(screen.getByRole("tab", { name: tab })).toBeInTheDocument();
    });
  });

  it("shows General Settings section by default", () => {
    render(<AdminSettings />);
    expect(screen.getByText("General Settings")).toBeInTheDocument();
  });

  it("shows Site Name input with default value", () => {
    render(<AdminSettings />);
    expect(screen.getByDisplayValue("VitalPaws")).toBeInTheDocument();
  });

  it("shows Save Changes button on General tab", () => {
    render(<AdminSettings />);
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("switches to Store tab and shows Shipping & Tax section", async () => {
    render(<AdminSettings />);
    fireEvent.click(screen.getByRole("tab", { name: "Store" }));
    await waitFor(() => expect(screen.getByText("Shipping & Tax")).toBeInTheDocument());
  });

  it("calls getSettings on mount", async () => {
    render(<AdminSettings />);
    await waitFor(() => expect(settingsApi.getSettings).toHaveBeenCalledTimes(1));
  });

  it("Store tab shows shipping fee input after loading", async () => {
    render(<AdminSettings />);
    fireEvent.click(screen.getByRole("tab", { name: "Store" }));
    await waitFor(() => expect(screen.getByLabelText(/flat shipping fee/i)).toBeInTheDocument());
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
  });

  it("switches to Appearance tab and shows theme swatches", () => {
    render(<AdminSettings />);
    fireEvent.click(screen.getByRole("tab", { name: "Appearance" }));
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("Forest Green")).toBeInTheDocument();
  });

  it("switches to Notifications tab and shows notification toggles", () => {
    render(<AdminSettings />);
    fireEvent.click(screen.getByRole("tab", { name: "Notifications" }));
    expect(screen.getByText("New order notifications")).toBeInTheDocument();
  });

  it("switches to Security tab and shows Change Admin Password button", () => {
    render(<AdminSettings />);
    fireEvent.click(screen.getByRole("tab", { name: "Security" }));
    expect(screen.getByRole("button", { name: /change admin password/i })).toBeInTheDocument();
  });

  it("opens password modal when Change Admin Password is clicked", async () => {
    render(<AdminSettings />);
    fireEvent.click(screen.getByRole("tab", { name: "Security" }));
    fireEvent.click(screen.getByRole("button", { name: /change admin password/i }));
    await waitFor(() => expect(screen.getByText("Change Admin Password")).toBeInTheDocument());
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
  });
});
