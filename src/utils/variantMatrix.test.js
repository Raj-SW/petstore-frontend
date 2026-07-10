import { describe, it, expect } from "vitest";
import { generateCombinations, mergeCombinations, comboKey } from "./variantMatrix";

const OPTS = [
  { name: "Weight", values: ["5kg", "10kg"] },
  { name: "Flavour", values: ["Chicken", "Beef"] },
];

describe("generateCombinations", () => {
  it("builds the cartesian product in axis order", () => {
    const combos = generateCombinations(OPTS);
    expect(combos).toHaveLength(4);
    expect(combos[0].optionValues).toEqual({ Weight: "5kg", Flavour: "Chicken" });
    expect(combos[3].optionValues).toEqual({ Weight: "10kg", Flavour: "Beef" });
  });

  it("returns [] for no axes or an axis without values", () => {
    expect(generateCombinations([])).toEqual([]);
    expect(generateCombinations([{ name: "W", values: [] }])).toEqual([]);
  });
});

describe("mergeCombinations", () => {
  it("preserves price/qty/images of surviving combos, blanks new ones", () => {
    const existing = [
      {
        optionValues: { Weight: "5kg", Flavour: "Chicken" },
        key: comboKey({ Weight: "5kg", Flavour: "Chicken" }, OPTS),
        price: 100,
        quantity: 3,
        images: [{ url: "u" }],
      },
    ];
    const merged = mergeCombinations(OPTS, existing, new Set());
    expect(merged).toHaveLength(4);
    const kept = merged.find((v) => v.optionValues.Weight === "5kg" && v.optionValues.Flavour === "Chicken");
    expect(kept.price).toBe(100);
    expect(kept.images).toHaveLength(1);
    const fresh = merged.find((v) => v.optionValues.Weight === "10kg" && v.optionValues.Flavour === "Beef");
    expect(fresh.price).toBe("");
  });

  it("matches existing variants without a key by their optionValues", () => {
    const existing = [
      { optionValues: { Weight: "10kg", Flavour: "Beef" }, price: 180, quantity: 2, images: [] },
    ];
    const merged = mergeCombinations(OPTS, existing, new Set());
    const kept = merged.find((v) => v.optionValues.Weight === "10kg" && v.optionValues.Flavour === "Beef");
    expect(kept.price).toBe(180);
  });

  it("skips removed keys", () => {
    const removed = new Set([comboKey({ Weight: "5kg", Flavour: "Beef" }, OPTS)]);
    expect(mergeCombinations(OPTS, [], removed)).toHaveLength(3);
  });
});
