import { describe, it, expect } from "vitest";
import Review from "./Review";

// ── Constructor ───────────────────────────────────────────────────────────────

describe("Review constructor", () => {
  it("applies all defaults when called with no arguments", () => {
    const r = new Review();
    expect(r.id).toBeNull();
    expect(r.productId).toBeNull();
    expect(r.userId).toBeNull();
    expect(r.rating).toBe(0);
    expect(r.comment).toBe("");
    expect(r.likes).toBe(0);
    expect(r.createdAt).toBeInstanceOf(Date);
    expect(r.updatedAt).toBeInstanceOf(Date);
  });

  it("applies all defaults when called with an empty object", () => {
    const r = new Review({});
    expect(r.id).toBeNull();
    expect(r.rating).toBe(0);
  });

  it("maps id from data.id", () => {
    const r = new Review({ id: "rev1" });
    expect(r.id).toBe("rev1");
  });

  it("maps id from data._id when id is absent", () => {
    const r = new Review({ _id: "mongo-rev" });
    expect(r.id).toBe("mongo-rev");
  });

  it("prefers data.id over data._id", () => {
    const r = new Review({ id: "preferred", _id: "fallback" });
    expect(r.id).toBe("preferred");
  });

  it("stores all provided fields correctly", () => {
    const createdAt = "2024-01-01T00:00:00.000Z";
    const updatedAt = "2024-06-01T00:00:00.000Z";
    const r = new Review({
      id: "r1",
      productId: "prod1",
      userId: "user1",
      rating: 4,
      comment: "Great product!",
      likes: 10,
      createdAt,
      updatedAt,
    });
    expect(r.productId).toBe("prod1");
    expect(r.userId).toBe("user1");
    expect(r.rating).toBe(4);
    expect(r.comment).toBe("Great product!");
    expect(r.likes).toBe(10);
    expect(r.createdAt.toISOString()).toBe(createdAt);
    expect(r.updatedAt.toISOString()).toBe(updatedAt);
  });

  it("defaults createdAt/updatedAt to now when not provided", () => {
    const before = Date.now();
    const r = new Review({});
    expect(r.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(r.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ── toJSON ────────────────────────────────────────────────────────────────────

describe("Review.toJSON", () => {
  it("returns a plain object with all expected keys", () => {
    const r = new Review({ id: "r1", productId: "p1", userId: "u1", rating: 3 });
    const json = r.toJSON();
    expect(json).toHaveProperty("id", "r1");
    expect(json).toHaveProperty("productId", "p1");
    expect(json).toHaveProperty("userId", "u1");
    expect(json).toHaveProperty("rating", 3);
    expect(json).toHaveProperty("comment");
    expect(json).toHaveProperty("likes");
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });
});

// ── fromJSON ──────────────────────────────────────────────────────────────────

describe("Review.fromJSON", () => {
  it("returns a Review instance", () => {
    const r = Review.fromJSON({ _id: "x" });
    expect(r).toBeInstanceOf(Review);
  });

  it("correctly maps values from the JSON object", () => {
    const r = Review.fromJSON({ id: "r2", productId: "p2", rating: 5, comment: "Excellent!" });
    expect(r.id).toBe("r2");
    expect(r.productId).toBe("p2");
    expect(r.rating).toBe(5);
    expect(r.comment).toBe("Excellent!");
  });
});

// ── validate ──────────────────────────────────────────────────────────────────

describe("Review.validate", () => {
  it("returns isValid=true for a valid review", () => {
    const r = new Review({ productId: "p1", userId: "u1", rating: 4, comment: "Good" });
    const { isValid, errors } = r.validate();
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("fails when productId is missing", () => {
    const r = new Review({ userId: "u1", rating: 3 });
    expect(r.validate().errors).toContain("Product ID is required");
  });

  it("fails when userId is missing", () => {
    const r = new Review({ productId: "p1", rating: 3 });
    expect(r.validate().errors).toContain("User ID is required");
  });

  it("fails when rating is below 1 (including default 0)", () => {
    const r = new Review({ productId: "p1", userId: "u1", rating: 0 });
    expect(r.validate().errors).toContain("Rating must be between 1 and 5");
  });

  it("fails when rating is below 1 (negative)", () => {
    const r = new Review({ productId: "p1", userId: "u1", rating: -1 });
    expect(r.validate().errors).toContain("Rating must be between 1 and 5");
  });

  it("fails when rating is above 5", () => {
    const r = new Review({ productId: "p1", userId: "u1", rating: 6 });
    expect(r.validate().errors).toContain("Rating must be between 1 and 5");
  });

  it("passes at boundary ratings (1 and 5)", () => {
    const base = { productId: "p1", userId: "u1" };
    expect(new Review({ ...base, rating: 1 }).validate().isValid).toBe(true);
    expect(new Review({ ...base, rating: 5 }).validate().isValid).toBe(true);
  });

  it("fails when comment exceeds 1000 characters", () => {
    const longComment = "a".repeat(1001);
    const r = new Review({ productId: "p1", userId: "u1", rating: 3, comment: longComment });
    expect(r.validate().errors).toContain("Comment cannot exceed 1000 characters");
  });

  it("passes when comment is exactly 1000 characters", () => {
    const exactComment = "a".repeat(1000);
    const r = new Review({ productId: "p1", userId: "u1", rating: 3, comment: exactComment });
    expect(r.validate().errors).not.toContain("Comment cannot exceed 1000 characters");
  });

  it("passes when comment is empty (no comment length check when falsy)", () => {
    const r = new Review({ productId: "p1", userId: "u1", rating: 3, comment: "" });
    const { errors } = r.validate();
    expect(errors).not.toContain("Comment cannot exceed 1000 characters");
  });

  it("accumulates multiple errors", () => {
    const r = new Review({ rating: 6 });
    const { isValid, errors } = r.validate();
    expect(isValid).toBe(false);
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ── incrementLikes ────────────────────────────────────────────────────────────

describe("Review.incrementLikes", () => {
  it("increases likes by 1", () => {
    const r = new Review({ likes: 5 });
    r.incrementLikes();
    expect(r.likes).toBe(6);
  });

  it("increases likes from 0", () => {
    const r = new Review();
    r.incrementLikes();
    expect(r.likes).toBe(1);
  });

  it("updates updatedAt", () => {
    const r = new Review({ likes: 0 });
    const before = Date.now();
    r.incrementLikes();
    expect(r.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("can be called multiple times", () => {
    const r = new Review({ likes: 0 });
    r.incrementLikes();
    r.incrementLikes();
    r.incrementLikes();
    expect(r.likes).toBe(3);
  });
});

// ── decrementLikes ────────────────────────────────────────────────────────────

describe("Review.decrementLikes", () => {
  it("decreases likes by 1 when likes > 0", () => {
    const r = new Review({ likes: 5 });
    r.decrementLikes();
    expect(r.likes).toBe(4);
  });

  it("does not go below 0", () => {
    const r = new Review({ likes: 0 });
    r.decrementLikes();
    expect(r.likes).toBe(0);
  });

  it("updates updatedAt when likes > 0", () => {
    const r = new Review({ likes: 1 });
    const before = Date.now();
    r.decrementLikes();
    expect(r.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("does NOT update updatedAt when likes is already 0", () => {
    const r = new Review({ likes: 0, updatedAt: "2020-01-01T00:00:00.000Z" });
    const originalUpdatedAt = r.updatedAt.getTime();
    r.decrementLikes();
    expect(r.updatedAt.getTime()).toBe(originalUpdatedAt);
  });
});
