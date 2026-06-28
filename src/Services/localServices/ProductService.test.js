import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("axios", () => {
  const fn = vi.fn();
  fn.get = vi.fn();
  fn.post = vi.fn();
  return { default: fn };
});

import axios from "axios";
import ProductService from "./ProductService";

beforeEach(() => {
  vi.clearAllMocks();
  ProductService.requestQueue.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

const urlOf = (i = 0) => axios.mock.calls[i][0].url;

describe("ProductService.fetchAllProducts", () => {
  it("returns products + pagination on success", async () => {
    axios.mockResolvedValue({
      data: { success: true, data: [{ id: 1 }], pagination: { total: 1 } },
    });
    const res = await ProductService.fetchAllProducts({ page: 2, category: "food" });
    expect(res).toEqual({ products: [{ id: 1 }], pagination: { total: 1 } });
    expect(urlOf()).toContain("page=2");
    expect(urlOf()).toContain("categories=food");
  });

  it("returns an empty fallback on error", async () => {
    axios.mockRejectedValue(new Error("down"));
    const res = await ProductService.fetchAllProducts();
    expect(res).toEqual({
      products: [],
      pagination: { total: 0, page: 1, pages: 1 },
    });
  });
});

describe("ProductService.fetchProductById", () => {
  it("throws when no id is given", async () => {
    await expect(ProductService.fetchProductById()).rejects.toThrow(
      "Product ID is required",
    );
  });

  it("returns the product on success", async () => {
    axios.mockResolvedValue({ data: { success: true, data: { id: 1 } } });
    await expect(ProductService.fetchProductById("1")).resolves.toEqual({
      id: 1,
    });
  });
});

describe("ProductService.fetchProductsWithFilters", () => {
  it("serializes array filters as repeated keys and drops empties", async () => {
    axios.mockResolvedValue({
      data: { success: true, data: [], pagination: {} },
    });
    await ProductService.fetchProductsWithFilters({
      categories: ["food", "toys"],
      colors: ["red", "", null],
      minPrice: "10",
      search: "ball",
    });
    const url = urlOf();
    expect(url).toContain("categories=food");
    expect(url).toContain("categories=toys");
    expect(url).toContain("colors=red");
    expect(url).not.toContain("colors=&");
    expect(url).toContain("minPrice=10");
    expect(url).toContain("search=ball");
  });
});

describe("ProductService.fetchProductsByCategories", () => {
  it("dedupes by id and paginates", async () => {
    // Each category call resolves to overlapping products.
    axios
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: "a" }, { id: "b" }] } })
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: "b" }, { id: "c" }] } });

    const res = await ProductService.fetchProductsByCategories(["x", "y"], {
      page: 1,
      limit: 10,
    });
    // transformProductData isn't applied here; ids come straight through.
    const ids = res.products.map((p) => p.id).sort();
    expect(ids).toEqual(["a", "b", "c"]);
    expect(res.pagination.total).toBe(3);
  });
});

describe("ProductService.transformProductData", () => {
  it("maps backend fields to the frontend shape with defaults", () => {
    const out = ProductService.transformProductData({
      _id: "x1",
      name: "Bone",
      price: 99,
    });
    expect(out).toMatchObject({
      id: "x1",
      title: "Bone",
      price: 99,
      images: [],
      rating: 0,
      numReviews: 0,
      featured: false,
    });
  });
});

describe("ProductService.handleRequest retry", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("retries once after a 429 then succeeds", async () => {
    axios
      .mockRejectedValueOnce({ response: { status: 429 } })
      .mockResolvedValueOnce({ data: { ok: true } });

    const promise = ProductService.handleRequest("http://x/products");
    await vi.advanceTimersByTimeAsync(1000); // first backoff delay
    await expect(promise).resolves.toEqual({ data: { ok: true } });
    expect(axios).toHaveBeenCalledTimes(2);
  });
});
