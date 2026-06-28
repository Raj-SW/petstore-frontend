import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import ReviewService from "./ReviewService";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("ReviewService", () => {
  it("fetchProductReviews returns the data", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1 }] });
    await expect(ReviewService.fetchProductReviews("p1")).resolves.toEqual([
      { id: 1 },
    ]);
    expect(api.get).toHaveBeenCalledWith("/reviews/product/p1");
  });

  it("fetchProductReviews returns [] on error (non-fatal)", async () => {
    api.get.mockRejectedValue(new Error("down"));
    await expect(ReviewService.fetchProductReviews("p1")).resolves.toEqual([]);
  });

  it("addReview posts the review", async () => {
    api.post.mockResolvedValue({ data: { id: "r1" } });
    await expect(ReviewService.addReview({ rating: 5 })).resolves.toEqual({
      id: "r1",
    });
    expect(api.post).toHaveBeenCalledWith("/reviews", { rating: 5 });
  });

  it("addReview re-throws on error", async () => {
    api.post.mockRejectedValue(new Error("boom"));
    await expect(ReviewService.addReview({})).rejects.toThrow("boom");
  });

  it("likeReview posts to the like route", async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    await ReviewService.likeReview("r1");
    expect(api.post).toHaveBeenCalledWith("/reviews/r1/like");
  });
});
