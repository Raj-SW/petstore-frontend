import { describe, it, expect } from "vitest";
import {
  ProductCreateDTO,
  ProductUpdateDTO,
  ProductFilterDTO,
} from "./ProductDTO";

// ── ProductCreateDTO ──────────────────────────────────────────────────────────

describe("ProductCreateDTO constructor", () => {
  it("uses provided values", () => {
    const dto = new ProductCreateDTO({
      title: "Dog Food",
      description: "Good food",
      price: 29.99,
      category: "food",
      stock: 100,
      specifications: { weight: "5kg" },
      supplierDetails: "Supplier X",
    });
    expect(dto.title).toBe("Dog Food");
    expect(dto.description).toBe("Good food");
    expect(dto.price).toBe(29.99);
    expect(dto.category).toBe("food");
    expect(dto.stock).toBe(100);
    expect(dto.specifications).toEqual({ weight: "5kg" });
    expect(dto.supplierDetails).toBe("Supplier X");
  });

  it("applies defaults for missing fields", () => {
    const dto = new ProductCreateDTO();
    expect(dto.title).toBe("");
    expect(dto.description).toBe("");
    expect(dto.price).toBe(0);
    expect(dto.category).toBe("");
    expect(dto.stock).toBe(0);
    expect(dto.specifications).toEqual({});
    expect(dto.supplierDetails).toBe("");
  });

  it("applies defaults for null/undefined values", () => {
    const dto = new ProductCreateDTO({
      title: null,
      price: undefined,
      stock: 0,
    });
    expect(dto.title).toBe("");
    expect(dto.price).toBe(0);
    expect(dto.stock).toBe(0);
  });
});

describe("ProductCreateDTO.validate", () => {
  it("returns isValid=true when all required fields are present", () => {
    const dto = new ProductCreateDTO({
      title: "Cat Toy",
      description: "Fluffy toy",
      price: 10,
      category: "toys",
      stock: 5,
    });
    const result = dto.validate();
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("reports error when title is missing", () => {
    const dto = new ProductCreateDTO({ description: "desc", category: "toys" });
    const { isValid, errors } = dto.validate();
    expect(isValid).toBe(false);
    expect(errors).toContain("Product title is required");
  });

  it("reports error when description is missing", () => {
    const dto = new ProductCreateDTO({ title: "X", category: "toys" });
    const { errors } = dto.validate();
    expect(errors).toContain("Product description is required");
  });

  it("reports error when category is missing", () => {
    const dto = new ProductCreateDTO({ title: "X", description: "desc" });
    const { errors } = dto.validate();
    expect(errors).toContain("Product category is required");
  });

  it("reports error when price is negative", () => {
    const dto = new ProductCreateDTO({
      title: "X",
      description: "desc",
      category: "toys",
      price: -5,
    });
    const { errors } = dto.validate();
    expect(errors).toContain("Price cannot be negative");
  });

  it("reports error when stock is negative", () => {
    const dto = new ProductCreateDTO({
      title: "X",
      description: "desc",
      category: "toys",
      stock: -1,
    });
    const { errors } = dto.validate();
    expect(errors).toContain("Stock cannot be negative");
  });

  it("accumulates multiple errors", () => {
    const dto = new ProductCreateDTO({ price: -1, stock: -1 });
    const { isValid, errors } = dto.validate();
    expect(isValid).toBe(false);
    expect(errors.length).toBeGreaterThanOrEqual(4); // title, desc, cat, price, stock
  });

  it("allows price=0 without error", () => {
    const dto = new ProductCreateDTO({
      title: "X",
      description: "desc",
      category: "toys",
      price: 0,
    });
    const { errors } = dto.validate();
    expect(errors).not.toContain("Price cannot be negative");
  });
});

// ── ProductUpdateDTO ──────────────────────────────────────────────────────────

describe("ProductUpdateDTO constructor", () => {
  it("stores undefined for omitted fields (partial update)", () => {
    const dto = new ProductUpdateDTO({ title: "New Title" });
    expect(dto.title).toBe("New Title");
    expect(dto.description).toBeUndefined();
    expect(dto.price).toBeUndefined();
    expect(dto.isActive).toBeUndefined();
  });

  it("stores all provided fields", () => {
    const dto = new ProductUpdateDTO({
      title: "T",
      description: "D",
      price: 50,
      category: "food",
      stock: 10,
      specifications: { color: "red" },
      supplierDetails: "S",
      isActive: false,
    });
    expect(dto.title).toBe("T");
    expect(dto.description).toBe("D");
    expect(dto.price).toBe(50);
    expect(dto.category).toBe("food");
    expect(dto.stock).toBe(10);
    expect(dto.specifications).toEqual({ color: "red" });
    expect(dto.supplierDetails).toBe("S");
    expect(dto.isActive).toBe(false);
  });

  it("handles empty object input", () => {
    const dto = new ProductUpdateDTO({});
    expect(dto.title).toBeUndefined();
  });
});

describe("ProductUpdateDTO.validate", () => {
  it("returns isValid=true when no price/stock provided", () => {
    const dto = new ProductUpdateDTO({ title: "Only title" });
    const { isValid, errors } = dto.validate();
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("passes when price and stock are valid", () => {
    const dto = new ProductUpdateDTO({ price: 0, stock: 0 });
    expect(dto.validate().isValid).toBe(true);
  });

  it("fails when price is negative", () => {
    const dto = new ProductUpdateDTO({ price: -10 });
    const { isValid, errors } = dto.validate();
    expect(isValid).toBe(false);
    expect(errors).toContain("Price cannot be negative");
  });

  it("fails when stock is negative", () => {
    const dto = new ProductUpdateDTO({ stock: -3 });
    const { errors } = dto.validate();
    expect(errors).toContain("Stock cannot be negative");
  });

  it("reports both errors simultaneously", () => {
    const dto = new ProductUpdateDTO({ price: -1, stock: -1 });
    const { isValid, errors } = dto.validate();
    expect(isValid).toBe(false);
    expect(errors).toHaveLength(2);
  });
});

describe("ProductUpdateDTO.toJSON", () => {
  it("omits undefined fields", () => {
    const dto = new ProductUpdateDTO({ title: "T", price: 20 });
    const json = dto.toJSON();
    expect(json).toEqual({ title: "T", price: 20 });
    expect(json).not.toHaveProperty("description");
    expect(json).not.toHaveProperty("category");
  });

  it("includes all set fields including isActive=false", () => {
    const dto = new ProductUpdateDTO({
      title: "T",
      description: "D",
      price: 10,
      category: "c",
      stock: 5,
      specifications: {},
      supplierDetails: "S",
      isActive: false,
    });
    const json = dto.toJSON();
    expect(json.isActive).toBe(false);
    expect(Object.keys(json)).toHaveLength(8);
  });

  it("returns empty object when no fields set", () => {
    const dto = new ProductUpdateDTO();
    expect(dto.toJSON()).toEqual({});
  });
});

// ── ProductFilterDTO ──────────────────────────────────────────────────────────

describe("ProductFilterDTO constructor", () => {
  it("uses provided filter values", () => {
    const dto = new ProductFilterDTO({
      category: "food",
      minPrice: 5,
      maxPrice: 50,
      minRating: 3,
      maxRating: 5,
      search: "bone",
      page: 2,
      limit: 20,
      sort: "price",
    });
    expect(dto.category).toBe("food");
    expect(dto.minPrice).toBe(5);
    expect(dto.maxPrice).toBe(50);
    expect(dto.minRating).toBe(3);
    expect(dto.maxRating).toBe(5);
    expect(dto.search).toBe("bone");
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
    expect(dto.sort).toBe("price");
  });

  it("applies defaults for pagination and sort", () => {
    const dto = new ProductFilterDTO();
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.sort).toBe("-createdAt");
  });

  it("leaves optional filters undefined when not provided", () => {
    const dto = new ProductFilterDTO();
    expect(dto.category).toBeUndefined();
    expect(dto.minPrice).toBeUndefined();
    expect(dto.maxPrice).toBeUndefined();
    expect(dto.search).toBeUndefined();
  });
});

describe("ProductFilterDTO.validate", () => {
  it("returns isValid=true with no filters", () => {
    const dto = new ProductFilterDTO();
    expect(dto.validate().isValid).toBe(true);
  });

  it("fails when minPrice is negative", () => {
    const dto = new ProductFilterDTO({ minPrice: -1 });
    const { errors } = dto.validate();
    expect(errors).toContain("Minimum price cannot be negative");
  });

  it("fails when maxPrice is negative", () => {
    const dto = new ProductFilterDTO({ maxPrice: -1 });
    const { errors } = dto.validate();
    expect(errors).toContain("Maximum price cannot be negative");
  });

  it("fails when minPrice > maxPrice", () => {
    const dto = new ProductFilterDTO({ minPrice: 100, maxPrice: 10 });
    const { errors } = dto.validate();
    expect(errors).toContain(
      "Minimum price cannot be greater than maximum price"
    );
  });

  it("passes when minPrice === maxPrice", () => {
    const dto = new ProductFilterDTO({ minPrice: 10, maxPrice: 10 });
    expect(dto.validate().isValid).toBe(true);
  });

  it("fails when minRating is below 0", () => {
    const dto = new ProductFilterDTO({ minRating: -1 });
    const { errors } = dto.validate();
    expect(errors).toContain("Minimum rating must be between 0 and 5");
  });

  it("fails when minRating is above 5", () => {
    const dto = new ProductFilterDTO({ minRating: 6 });
    const { errors } = dto.validate();
    expect(errors).toContain("Minimum rating must be between 0 and 5");
  });

  it("fails when maxRating is out of range", () => {
    const dto = new ProductFilterDTO({ maxRating: 10 });
    const { errors } = dto.validate();
    expect(errors).toContain("Maximum rating must be between 0 and 5");
  });

  it("passes with valid rating range", () => {
    const dto = new ProductFilterDTO({ minRating: 0, maxRating: 5 });
    expect(dto.validate().isValid).toBe(true);
  });
});

describe("ProductFilterDTO.toQueryParams", () => {
  it("returns defaults (page, limit, sort) always", () => {
    const dto = new ProductFilterDTO();
    const qs = dto.toQueryParams();
    expect(qs).toContain("page=1");
    expect(qs).toContain("limit=10");
    expect(qs).toContain("sort=-createdAt");
  });

  it("includes optional filters when set", () => {
    const dto = new ProductFilterDTO({
      category: "toys",
      minPrice: 5,
      maxPrice: 100,
      minRating: 2,
      maxRating: 5,
      search: "rope",
    });
    const qs = dto.toQueryParams();
    expect(qs).toContain("category=toys");
    expect(qs).toContain("minPrice=5");
    expect(qs).toContain("maxPrice=100");
    expect(qs).toContain("minRating=2");
    expect(qs).toContain("maxRating=5");
    expect(qs).toContain("search=rope");
  });

  it("omits undefined optional fields", () => {
    const dto = new ProductFilterDTO({ page: 3 });
    const qs = dto.toQueryParams();
    expect(qs).not.toContain("category=");
    expect(qs).not.toContain("search=");
    expect(qs).toContain("page=3");
  });

  it("returns a non-empty string", () => {
    const dto = new ProductFilterDTO();
    expect(typeof dto.toQueryParams()).toBe("string");
    expect(dto.toQueryParams().length).toBeGreaterThan(0);
  });
});
