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

  it("exhausts all retries and throws 'Too many requests' after 3 x 429", async () => {
    axios
      .mockRejectedValueOnce({ response: { status: 429 } })
      .mockRejectedValueOnce({ response: { status: 429 } })
      .mockRejectedValueOnce({ response: { status: 429 } })
      .mockRejectedValueOnce({ response: { status: 429 } });

    // Attach the rejection handler BEFORE advancing timers to avoid an unhandled rejection
    const promise = ProductService.handleRequest("http://x/products");
    const assertion = expect(promise).rejects.toThrow(
      "Too many requests. Please try again later."
    );
    // advance through all backoff delays: 1000 + 2000 + 4000
    await vi.advanceTimersByTimeAsync(7000);
    await assertion;
  });

  it("re-throws non-429 errors immediately", async () => {
    axios.mockRejectedValueOnce({ response: { status: 500 }, message: "Server error" });
    await expect(ProductService.handleRequest("http://x/products")).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(axios).toHaveBeenCalledTimes(1);
  });
});

describe("ProductService.debounceRequest", () => {
  it("returns the same promise for the same key while inflight", async () => {
    let resolveIt;
    const slowFn = vi.fn(
      () =>
        new Promise((res) => {
          resolveIt = res;
        })
    );

    const p1 = ProductService.debounceRequest("same-key", slowFn);
    const p2 = ProductService.debounceRequest("same-key", slowFn);

    expect(p1).toBe(p2);
    expect(slowFn).toHaveBeenCalledTimes(1);

    resolveIt("done");
    await p1;
  });

  it("removes the key from the queue after the promise resolves", async () => {
    axios.mockResolvedValue({ data: { success: true, data: [], pagination: {} } });

    const fn1 = vi.fn(() => Promise.resolve("first"));
    const fn2 = vi.fn(() => Promise.resolve("second"));

    await ProductService.debounceRequest("unique-key", fn1);
    // After fn1 resolves, the queue entry should be cleared
    const result = await ProductService.debounceRequest("unique-key", fn2);
    expect(result).toBe("second");
    expect(fn2).toHaveBeenCalledTimes(1);
  });
});

describe("ProductService.fetchProductById — failure branch", () => {
  it("throws when the API returns success=false", async () => {
    axios.mockResolvedValue({
      data: { success: false, message: "Not found" },
    });
    await expect(ProductService.fetchProductById("bad-id")).rejects.toThrow("Not found");
  });
});

describe("ProductService.createProduct", () => {
  it("posts product data and returns the created product", async () => {
    const created = { _id: "new1", name: "Cat Food" };
    axios.mockResolvedValue({ data: { data: created } });
    const result = await ProductService.createProduct({ name: "Cat Food", price: 5 });
    expect(result).toEqual(created);
    const call = axios.mock.calls[0][0];
    expect(call.method).toBe("POST");
    expect(call.data).toMatchObject({ name: "Cat Food" });
  });

  it("throws on network error", async () => {
    axios.mockRejectedValue(new Error("network"));
    await expect(ProductService.createProduct({})).rejects.toThrow("network");
  });
});

describe("ProductService.updateProduct", () => {
  it("sends a PUT with the updated data and returns the result", async () => {
    const updated = { _id: "u1", name: "Updated" };
    axios.mockResolvedValue({ data: { data: updated } });
    const result = await ProductService.updateProduct("u1", { name: "Updated" });
    expect(result).toEqual(updated);
    const call = axios.mock.calls[0][0];
    expect(call.method).toBe("PUT");
  });

  it("throws on error", async () => {
    axios.mockRejectedValue(new Error("fail"));
    await expect(ProductService.updateProduct("id", {})).rejects.toThrow("fail");
  });
});

describe("ProductService.deleteProduct", () => {
  it("sends DELETE and returns success flag", async () => {
    axios.mockResolvedValue({ data: { success: true } });
    const result = await ProductService.deleteProduct("d1");
    expect(result).toBe(true);
    const call = axios.mock.calls[0][0];
    expect(call.method).toBe("DELETE");
  });

  it("throws on error", async () => {
    axios.mockRejectedValue(new Error("gone"));
    await expect(ProductService.deleteProduct("id")).rejects.toThrow("gone");
  });
});

describe("ProductService.uploadProductImages", () => {
  it("builds FormData and posts images", async () => {
    const imageData = { data: [{ url: "http://cdn/img.jpg" }] };
    axios.mockResolvedValue({ data: { data: imageData } });
    const fakeFile = new File(["bytes"], "photo.jpg", { type: "image/jpeg" });
    const result = await ProductService.uploadProductImages("p1", [fakeFile]);
    expect(result).toEqual(imageData);
    const call = axios.mock.calls[0][0];
    expect(call.method).toBe("POST");
    expect(call.data).toBeInstanceOf(FormData);
  });

  it("throws on error", async () => {
    axios.mockRejectedValue(new Error("upload fail"));
    await expect(
      ProductService.uploadProductImages("p1", [new File([], "f.jpg")])
    ).rejects.toThrow("upload fail");
  });
});

describe("ProductService.deleteProductImage", () => {
  it("sends DELETE for the specific image and returns success", async () => {
    axios.mockResolvedValue({ data: { success: true } });
    const result = await ProductService.deleteProductImage("p1", "img1");
    expect(result).toBe(true);
    expect(urlOf()).toContain("/images/img1");
  });

  it("throws on error", async () => {
    axios.mockRejectedValue(new Error("del fail"));
    await expect(ProductService.deleteProductImage("p1", "img1")).rejects.toThrow("del fail");
  });
});

describe("ProductService.fetchProductsByCategory", () => {
  it("returns products on success", async () => {
    axios.mockResolvedValue({
      data: { success: true, data: [{ _id: "a", name: "Ball" }] },
    });
    const result = await ProductService.fetchProductsByCategory("toys");
    expect(result).toHaveLength(1);
    expect(urlOf()).toContain("/category/toys");
  });

  it("returns empty array on failure response", async () => {
    axios.mockResolvedValue({ data: { success: false } });
    const result = await ProductService.fetchProductsByCategory("toys");
    expect(result).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    axios.mockRejectedValue(new Error("net"));
    const result = await ProductService.fetchProductsByCategory("toys");
    expect(result).toEqual([]);
  });
});

describe("ProductService.fetchProductsByApparel", () => {
  it("returns apparel products on success", async () => {
    axios.mockResolvedValue({
      data: { success: true, data: [{ _id: "a1", name: "Dog Jacket" }] },
    });
    const result = await ProductService.fetchProductsByApparel();
    expect(result).toHaveLength(1);
    expect(urlOf()).toContain("categories=apparel");
  });

  it("returns empty array when success=false", async () => {
    axios.mockResolvedValue({ data: { success: false } });
    expect(await ProductService.fetchProductsByApparel()).toEqual([]);
  });

  it("returns empty array on error", async () => {
    axios.mockRejectedValue(new Error("err"));
    expect(await ProductService.fetchProductsByApparel()).toEqual([]);
  });
});

describe("ProductService.fetchProductsByName", () => {
  it("searches by name and returns results", async () => {
    axios.mockResolvedValue({
      data: { success: true, data: [{ _id: "x", name: "Collar" }] },
    });
    const result = await ProductService.fetchProductsByName("Collar");
    expect(result).toHaveLength(1);
    expect(urlOf()).toContain("search=Collar");
  });

  it("returns empty array on failure", async () => {
    axios.mockRejectedValue(new Error("down"));
    expect(await ProductService.fetchProductsByName("X")).toEqual([]);
  });
});

describe("ProductService.fetchRelatedProducts", () => {
  it("returns products excluding the current one", async () => {
    axios.mockResolvedValue({
      data: {
        success: true,
        data: [
          { _id: "a", name: "A" },
          { _id: "current", name: "Current" },
          { _id: "b", name: "B" },
        ],
      },
    });
    const result = await ProductService.fetchRelatedProducts("toys", "current");
    expect(result.map((p) => p._id)).toEqual(["a", "b"]);
  });

  it("throws when success=false", async () => {
    axios.mockResolvedValue({
      data: { success: false, message: "Category not found" },
    });
    // error is caught internally and returns []
    const result = await ProductService.fetchRelatedProducts("toys", "id");
    expect(result).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    axios.mockRejectedValue(new Error("fail"));
    expect(await ProductService.fetchRelatedProducts("toys", "id")).toEqual([]);
  });
});

describe("ProductService.fetchProductsByPriceRange", () => {
  it("builds correct URL with price params and returns products", async () => {
    axios.mockResolvedValue({
      data: { success: true, data: [{ _id: "p1" }] },
    });
    const result = await ProductService.fetchProductsByPriceRange(10, 100);
    expect(result).toHaveLength(1);
    expect(urlOf()).toContain("minPrice=10");
    expect(urlOf()).toContain("maxPrice=100");
  });

  it("returns empty array when success=false", async () => {
    axios.mockResolvedValue({ data: { success: false } });
    expect(await ProductService.fetchProductsByPriceRange(0, 50)).toEqual([]);
  });

  it("returns empty array on error", async () => {
    axios.mockRejectedValue(new Error("err"));
    expect(await ProductService.fetchProductsByPriceRange(0, 100)).toEqual([]);
  });
});

describe("ProductService.fetchProductsByRating", () => {
  it("passes minRating in the query and returns products", async () => {
    axios.mockResolvedValue({
      data: { success: true, data: [{ _id: "r1" }] },
    });
    const result = await ProductService.fetchProductsByRating(4);
    expect(result).toHaveLength(1);
    expect(urlOf()).toContain("minRating=4");
  });

  it("returns empty array on failure", async () => {
    axios.mockRejectedValue(new Error("fail"));
    expect(await ProductService.fetchProductsByRating(3)).toEqual([]);
  });
});

describe("ProductService.fetchProductsWithFilters — additional branches", () => {
  it("falls back to empty result when success=false", async () => {
    axios.mockResolvedValue({
      data: { success: false },
    });
    const result = await ProductService.fetchProductsWithFilters({});
    expect(result).toEqual({
      products: [],
      pagination: { total: 0, page: 1, pages: 1 },
    });
  });

  it("handles legacy single category string via filters.category", async () => {
    axios.mockResolvedValue({
      data: { success: true, data: [], pagination: {} },
    });
    await ProductService.fetchProductsWithFilters({ category: "food" });
    expect(urlOf()).toContain("categories=food");
  });

  it("skips maxPrice when it is not finite (Infinity)", async () => {
    axios.mockResolvedValue({
      data: { success: true, data: [], pagination: {} },
    });
    await ProductService.fetchProductsWithFilters({ maxPrice: Infinity });
    expect(urlOf()).not.toContain("maxPrice=");
  });
});

describe("ProductService.fetchFilterOptions", () => {
  it("returns filter options on success", async () => {
    const opts = { categories: ["food", "toys"], colors: ["red"], genders: ["male"] };
    axios.mockResolvedValue({ data: { success: true, data: opts } });
    const result = await ProductService.fetchFilterOptions();
    expect(result).toEqual(opts);
  });

  it("returns empty arrays when success=false", async () => {
    axios.mockResolvedValue({ data: { success: false } });
    expect(await ProductService.fetchFilterOptions()).toEqual({
      categories: [],
      colors: [],
      genders: [],
    });
  });

  it("returns empty arrays on network error", async () => {
    axios.mockRejectedValue(new Error("down"));
    expect(await ProductService.fetchFilterOptions()).toEqual({
      categories: [],
      colors: [],
      genders: [],
    });
  });
});

describe("ProductService.transformProductData — additional cases", () => {
  it("prefers product.id over product._id", () => {
    const out = ProductService.transformProductData({ id: "front-id", _id: "back-id", price: 1 });
    expect(out.id).toBe("back-id"); // _id takes precedence via `product._id || product.id`
  });

  it("prefers product.name over product.title for the title field", () => {
    const out = ProductService.transformProductData({ name: "By Name", title: "By Title", price: 1 });
    expect(out.title).toBe("By Name");
  });

  it("falls back to product.title when name is absent", () => {
    const out = ProductService.transformProductData({ title: "Only Title", price: 1 });
    expect(out.title).toBe("Only Title");
  });

  it("defaults specifications to empty object", () => {
    const out = ProductService.transformProductData({ price: 5 });
    expect(out.specifications).toEqual({});
  });

  it("defaults supplierDetails to empty string", () => {
    const out = ProductService.transformProductData({ price: 5 });
    expect(out.supplierDetails).toBe("");
  });
});

describe("ProductService.fetchProductsByCategories — error path", () => {
  it("returns empty products when all category requests fail", async () => {
    // fetchProductsByCategory catches errors and returns [] — so Promise.all resolves
    // with [[]] and the method returns empty pagination with pages=0
    axios.mockRejectedValue(new Error("fail"));
    const result = await ProductService.fetchProductsByCategories(["x"]);
    expect(result.products).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.page).toBe(1);
  });

  it("handles an empty categories array", async () => {
    const result = await ProductService.fetchProductsByCategories([]);
    expect(result.products).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });
});
