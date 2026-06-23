import { describe, it, expect } from "vitest";
import { computeSavings, isIntervalValid } from "./subscriptionPricing";

describe("computeSavings", () => {
  it("computes discounted price and savings", () => {
    expect(computeSavings(300, 10)).toEqual({ base: 300, discounted: 270, save: 30 });
  });
  it("rounds to whole rupees", () => {
    expect(computeSavings(299, 10)).toEqual({ base: 299, discounted: 269, save: 30 });
  });
  it("guards non-numeric input", () => {
    expect(computeSavings(undefined, 10)).toEqual({ base: 0, discounted: 0, save: 0 });
    expect(computeSavings(300, undefined)).toEqual({ base: 300, discounted: 300, save: 0 });
  });
});

describe("isIntervalValid", () => {
  it("requires at least 7 days", () => {
    expect(isIntervalValid("day", 7)).toBe(true);
    expect(isIntervalValid("day", 6)).toBe(false);
    expect(isIntervalValid("week", 1)).toBe(true);
  });
});
