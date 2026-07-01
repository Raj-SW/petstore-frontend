import { describe, it, expect } from "vitest";
import Product from "./Product";

// ── Constructor ───────────────────────────────────────────────────────────────

describe("Product constructor", () => {
  it("applies all defaults when called with no arguments", () => {
    const p = new Product();
    expect(p.id).toBeNull();
    expect(p.title).toBe("");
    expect(p.description).toBe("");
    expect(p.price).toBe(0);
    expect(p.category).toBe("");
    expect(p.images).toEqual([]);
    expect(p.rating).toBe(0);
    expect(p.numReviews).toBe(0);
    expect(p.featured).toBe(false);
    expect(p.isActive).toBe(true);
    expect(p.specifications).toEqual({});
    expect(p.supplierDetails).toBe("");
    expect(p.stock).toBe(0);
    expect(p.createdAt).toBeInstanceOf(Date);
    expect(p.updatedAt).toBeInstanceOf(Date);
  });

  it("applies all defaults when called with an empty object", () => {
    const p = new Product({});
    expect(p.id).toBeNull();
    expect(p.isActive).toBe(true);
  });

  it("maps id from data.id", () => {
    const p = new Product({ id: "abc123" });
    expect(p.id).toBe("abc123");
  });

  it("maps id from data._id when id is absent", () => {
    const p = new Product({ _id: "mongo-id" });
    expect(p.id).toBe("mongo-id");
  });

  it("prefers data.id over data._id", () => {
    const p = new Product({ id: "preferred", _id: "fallback" });
    expect(p.id).toBe("preferred");
  });

  it("stores all provided fields correctly", () => {
    const createdAt = "2024-01-01T00:00:00.000Z";
    const updatedAt = "2024-06-01T00:00:00.000Z";
    const p = new Product({
      id: "prod1",
      title: "Dog Shampoo",
      description: "Great shampoo",
      price: 12.99,
      category: "grooming",
      images: ["img1.jpg", "img2.jpg"],
      rating: 4.5,
      numReviews: 10,
      featured: true,
      isActive: false,
      specifications: { volume: "500ml" },
      supplierDetails: "Supplier Co.",
      stock: 50,
      createdAt,
      updatedAt,
    });
    expect(p.title).toBe("Dog Shampoo");
    expect(p.description).toBe("Great shampoo");
    expect(p.price).toBe(12.99);
    expect(p.category).toBe("grooming");
    expect(p.images).toEqual(["img1.jpg", "img2.jpg"]);
    expect(p.rating).toBe(4.5);
    expect(p.numReviews).toBe(10);
    expect(p.featured).toBe(true);
    expect(p.isActive).toBe(false);
    expect(p.specifications).toEqual({ volume: "500ml" });
    expect(p.supplierDetails).toBe("Supplier Co.");
    expect(p.stock).toBe(50);
    expect(p.createdAt).toBeInstanceOf(Date);
    expect(p.createdAt.toISOString()).toBe(createdAt);
    expect(p.updatedAt.toISOString()).toBe(updatedAt);
  });

  it("respects isActive=false via nullish coalescing", () => {
    const p = new Product({ isActive: false });
    expect(p.isActive).toBe(false);
  });

  it("defaults createdAt/updatedAt to now when not provided", () => {
    const before = Date.now();
    const p = new Product({});
    expect(p.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(p.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ── toJSON ────────────────────────────────────────────────────────────────────

describe("Product.toJSON", () => {
  it("returns a plain object with all expected keys", () => {
    const p = new Product({ id: "x", title: "Toy", category: "toys", price: 5, stock: 3 });
    const json = p.toJSON();
    expect(json).toHaveProperty("id", "x");
    expect(json).toHaveProperty("title", "Toy");
    expect(json).toHaveProperty("description");
    expect(json).toHaveProperty("price", 5);
    expect(json).toHaveProperty("category", "toys");
    expect(json).toHaveProperty("images");
    expect(json).toHaveProperty("rating");
    expect(json).toHaveProperty("numReviews");
    expect(json).toHaveProperty("featured");
    expect(json).toHaveProperty("isActive");
    expect(json).toHaveProperty("specifications");
    expect(json).toHaveProperty("supplierDetails");
    expect(json).toHaveProperty("stock", 3);
    expect(json).toHaveProperty("createdAt");
    expect(json).toHaveProperty("updatedAt");
  });
});

// ── fromJSON ──────────────────────────────────────────────────────────────────

describe("Product.fromJSON", () => {
  it("returns a Product instance", () => {
    const p = Product.fromJSON({ id: "abc", title: "Treat" });
    expect(p).toBeInstanceOf(Product);
  });

  it("correctly maps values from the JSON object", () => {
    const p = Product.fromJSON({ _id: "m1", title: "Chew Toy", price: 3.99 });
    expect(p.id).toBe("m1");
    expect(p.title).toBe("Chew Toy");
    expect(p.price).toBe(3.99);
  });
});

// ── validate ──────────────────────────────────────────────────────────────────

describe("Product.validate", () => {
  it("returns isValid=true for a complete, valid product", () => {
    const p = new Product({
      title: "Cat Food",
      description: "Yummy",
      category: "food",
      price: 9.99,
      stock: 10,
      rating: 4,
    });
    const { isValid, errors } = p.validate();
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("fails when title is missing", () => {
    const p = new Product({ description: "desc", category: "food" });
    expect(p.validate().errors).toContain("Product title is required");
  });

  it("fails when description is missing", () => {
    const p = new Product({ title: "x", category: "food" });
    expect(p.validate().errors).toContain("Product description is required");
  });

  it("fails when category is missing", () => {
    const p = new Product({ title: "x", description: "y" });
    expect(p.validate().errors).toContain("Product category is required");
  });

  it("fails when price is negative", () => {
    const p = new Product({ title: "x", description: "y", category: "z", price: -1 });
    expect(p.validate().errors).toContain("Price cannot be negative");
  });

  it("passes when price is zero", () => {
    const p = new Product({ title: "x", description: "y", category: "z", price: 0 });
    const { errors } = p.validate();
    expect(errors).not.toContain("Price cannot be negative");
  });

  it("fails when stock is negative", () => {
    const p = new Product({ title: "x", description: "y", category: "z", stock: -5 });
    expect(p.validate().errors).toContain("Stock cannot be negative");
  });

  it("passes when stock is zero", () => {
    const p = new Product({ title: "x", description: "y", category: "z", stock: 0 });
    expect(p.validate().errors).not.toContain("Stock cannot be negative");
  });

  it("fails when rating is below 0", () => {
    const p = new Product({ title: "x", description: "y", category: "z", rating: -1 });
    expect(p.validate().errors).toContain("Rating must be between 0 and 5");
  });

  it("fails when rating is above 5", () => {
    const p = new Product({ title: "x", description: "y", category: "z", rating: 6 });
    expect(p.validate().errors).toContain("Rating must be between 0 and 5");
  });

  it("passes at rating boundaries (0 and 5)", () => {
    const base = { title: "x", description: "y", category: "z" };
    expect(new Product({ ...base, rating: 0 }).validate().errors).not.toContain("Rating must be between 0 and 5");
    expect(new Product({ ...base, rating: 5 }).validate().errors).not.toContain("Rating must be between 0 and 5");
  });

  it("accumulates multiple errors", () => {
    const p = new Product({ price: -1, stock: -1, rating: 10 });
    const { isValid, errors } = p.validate();
    expect(isValid).toBe(false);
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});

// ── addImage / removeImage ────────────────────────────────────────────────────

describe("Product.addImage", () => {
  it("appends a URL to the images array", () => {
    const p = new Product();
    p.addImage("photo1.jpg");
    expect(p.images).toContain("photo1.jpg");
  });

  it("can add multiple images", () => {
    const p = new Product();
    p.addImage("a.jpg");
    p.addImage("b.jpg");
    expect(p.images).toHaveLength(2);
  });
});

describe("Product.removeImage", () => {
  it("removes the specified image URL", () => {
    const p = new Product({ images: ["a.jpg", "b.jpg", "c.jpg"] });
    p.removeImage("b.jpg");
    expect(p.images).toEqual(["a.jpg", "c.jpg"]);
  });

  it("does nothing when the URL is not in the list", () => {
    const p = new Product({ images: ["a.jpg"] });
    p.removeImage("not-there.jpg");
    expect(p.images).toEqual(["a.jpg"]);
  });

  it("removes all occurrences if there are duplicates", () => {
    const p = new Product({ images: ["a.jpg", "a.jpg", "b.jpg"] });
    p.removeImage("a.jpg");
    expect(p.images).toEqual(["b.jpg"]);
  });
});

// ── updateRating ──────────────────────────────────────────────────────────────

describe("Product.updateRating", () => {
  it("recalculates the running average after the first review", () => {
    const p = new Product({ rating: 0, numReviews: 0 });
    p.updateRating(4);
    expect(p.numReviews).toBe(1);
    expect(p.rating).toBe(4);
  });

  it("correctly blends a second rating", () => {
    const p = new Product({ rating: 4, numReviews: 1 });
    p.updateRating(2);
    expect(p.numReviews).toBe(2);
    expect(p.rating).toBe(3); // (4 + 2) / 2
  });

  it("increments numReviews on each call", () => {
    const p = new Product({ rating: 3, numReviews: 2 });
    p.updateRating(5);
    expect(p.numReviews).toBe(3);
  });
});
