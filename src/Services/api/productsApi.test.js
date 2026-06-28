import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import productsApi from "./productsApi";

beforeEach(() => vi.clearAllMocks());

describe("productsApi", () => {
  it("getProducts builds the query string", async () => {
    api.get.mockResolvedValue({ data: [] });
    await productsApi.getProducts({ page: 2, category: "food" });
    expect(api.get).toHaveBeenCalledWith("/products?page=2&category=food");
  });

  it("getProductById / create / update / delete", async () => {
    api.get.mockResolvedValue({ data: {} });
    api.post.mockResolvedValue({ data: {} });
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
    await productsApi.getProductById("9");
    expect(api.get).toHaveBeenCalledWith("/products/9");
    await productsApi.createProduct({ name: "x" });
    expect(api.post).toHaveBeenCalledWith("/products", { name: "x" });
    await productsApi.updateProduct("9", { name: "y" });
    expect(api.patch).toHaveBeenCalledWith("/products/9", { name: "y" });
    await productsApi.deleteProduct("9");
    expect(api.delete).toHaveBeenCalledWith("/products/9");
  });

  it("bulkAction includes options only for sale", async () => {
    api.post.mockResolvedValue({ data: {} });
    await productsApi.bulkAction("activate", ["1", "2"]);
    expect(api.post).toHaveBeenCalledWith("/products/bulk", {
      action: "activate",
      ids: ["1", "2"],
    });
    await productsApi.bulkAction("sale", ["1"], { percent: 10 });
    expect(api.post).toHaveBeenLastCalledWith("/products/bulk", {
      action: "sale",
      ids: ["1"],
      options: { percent: 10 },
    });
  });

  it("getFeaturedProducts uses default limit 8", async () => {
    api.get.mockResolvedValue({ data: [] });
    await productsApi.getFeaturedProducts();
    expect(api.get).toHaveBeenCalledWith("/products?isFeatured=true&limit=8");
  });

  it("getFeaturedByCategory returns featured when present", async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const res = await productsApi.getFeaturedByCategory("toys", 3);
    expect(res).toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith(
      "/products?categories=toys&limit=3&isActive=true&isFeatured=true",
    );
  });

  it("getFeaturedByCategory falls back to latest when none featured", async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: [] } }) // featured query: empty
      .mockResolvedValueOnce({ data: { data: [{ id: 2 }] } }); // fallback
    const res = await productsApi.getFeaturedByCategory("toys");
    expect(res).toEqual([{ id: 2 }]);
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("searchProducts merges the search term into params", async () => {
    api.get.mockResolvedValue({ data: [] });
    await productsApi.searchProducts("ball", { page: 1 });
    expect(api.get).toHaveBeenCalledWith("/products?search=ball&page=1");
  });

  it("getProductsByCategory filters out the excluded id", async () => {
    api.get.mockResolvedValue({
      data: { data: [{ _id: "a" }, { _id: "b" }] },
    });
    const res = await productsApi.getProductsByCategory("food", "a");
    expect(res).toEqual([{ _id: "b" }]);
    expect(api.get).toHaveBeenCalledWith("/products/category/food");
  });

  it("getProductReviews returns the nested array or []", async () => {
    api.get.mockResolvedValue({ data: {} });
    await expect(productsApi.getProductReviews("p1")).resolves.toEqual([]);
    expect(api.get).toHaveBeenCalledWith("/reviews/product/p1");
  });

  it("submitReview posts and unwraps data.data with fallback", async () => {
    api.post.mockResolvedValue({ data: { data: { id: "r1" } } });
    await expect(
      productsApi.submitReview("p1", { rating: 5 }),
    ).resolves.toEqual({ id: "r1" });
    expect(api.post).toHaveBeenCalledWith("/reviews/p1", { rating: 5 });
  });

  it("updateReview / deleteReview", async () => {
    api.patch.mockResolvedValue({ data: { data: { id: "r1" } } });
    api.delete.mockResolvedValue({ data: { ok: true } });
    await productsApi.updateReview("r1", { rating: 4 });
    expect(api.patch).toHaveBeenCalledWith("/reviews/r1", { rating: 4 });
    await productsApi.deleteReview("r1");
    expect(api.delete).toHaveBeenCalledWith("/reviews/r1");
  });
});
