import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HeroSearch from "./HeroSearch";

describe("HeroSearch", () => {
  it("renders with placeholder and calls onChange with the raw string", () => {
    const onChange = vi.fn();
    render(<HeroSearch value="" onChange={onChange} placeholder="Search moments…" ariaLabel="Search gallery" />);
    const input = screen.getByLabelText("Search gallery");
    fireEvent.change(input, { target: { value: "expo" } });
    expect(onChange).toHaveBeenCalledWith("expo");
  });

  it("calls onSubmit with the current value on Enter", () => {
    const onSubmit = vi.fn();
    render(<HeroSearch value="dog food" onChange={() => {}} onSubmit={onSubmit} ariaLabel="Search products" />);
    fireEvent.keyDown(screen.getByLabelText("Search products"), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("dog food");
  });
});
