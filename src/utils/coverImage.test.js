import { describe, it, expect } from "vitest";
import { coverUrl } from "./coverImage";

describe("coverUrl", () => {
  it("returns '' for falsy input", () => {
    expect(coverUrl(null)).toBe("");
    expect(coverUrl(undefined)).toBe("");
    expect(coverUrl("")).toBe("");
    expect(coverUrl(0)).toBe("");
  });

  it("returns a bare string URL unchanged (legacy shape)", () => {
    expect(coverUrl("https://cdn/x.jpg")).toBe("https://cdn/x.jpg");
  });

  it("extracts .url from the { url, publicId } object shape", () => {
    expect(coverUrl({ url: "https://cdn/y.jpg", publicId: "y" })).toBe(
      "https://cdn/y.jpg",
    );
  });

  it("returns '' when the object has no url", () => {
    expect(coverUrl({ publicId: "z" })).toBe("");
    expect(coverUrl({ url: "" })).toBe("");
  });
});
