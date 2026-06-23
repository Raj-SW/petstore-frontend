import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SubscriptionChooser from "./SubscriptionChooser";

const baseProps = {
  basePrice: 300,
  discountPercent: 10,
  intervalCount: 2,
  intervalUnit: "week",
  onIntervalCountChange: vi.fn(),
  onIntervalUnitChange: vi.fn(),
};

describe("SubscriptionChooser", () => {
  it("hides the frequency dropdown until subscribe is selected", () => {
    render(<SubscriptionChooser {...baseProps} mode="onetime" onModeChange={vi.fn()} />);
    expect(screen.queryByLabelText(/delivery frequency/i)).not.toBeInTheDocument();
  });

  it("shows the frequency dropdown when subscribe is selected", () => {
    render(<SubscriptionChooser {...baseProps} mode="subscribe" onModeChange={vi.fn()} />);
    expect(screen.getByLabelText(/delivery frequency/i)).toBeInTheDocument();
  });

  it("renders the savings math and pill", () => {
    render(<SubscriptionChooser {...baseProps} mode="subscribe" onModeChange={vi.fn()} />);
    expect(screen.getByText("Save 10%")).toBeInTheDocument();
    expect(screen.getByText("Rs 270")).toBeInTheDocument();
    expect(screen.getAllByText("Rs 300").length).toBeGreaterThan(0);
    expect(screen.getByText(/you save rs 30/i)).toBeInTheDocument();
  });

  it("calls onModeChange when a card is clicked", () => {
    const onModeChange = vi.fn();
    render(<SubscriptionChooser {...baseProps} mode="onetime" onModeChange={onModeChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /subscribe & save/i }));
    expect(onModeChange).toHaveBeenCalledWith("subscribe");
  });

  it("warns when the chosen interval is under 7 days", () => {
    render(
      <SubscriptionChooser {...baseProps} mode="subscribe" intervalUnit="day" intervalCount={3} onModeChange={vi.fn()} />
    );
    expect(screen.getByText(/minimum interval is 7 days/i)).toBeInTheDocument();
  });
});
