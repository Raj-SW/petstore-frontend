import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import galleryApi from "./galleryApi";

beforeEach(() => vi.clearAllMocks());

describe("galleryApi", () => {
  it("getPosts cleans params into a query string", async () => {
    api.get.mockResolvedValue({ data: [] });
    await galleryApi.getPosts({ category: "cats", page: 1, search: "" });
    expect(api.get).toHaveBeenCalledWith("/gallery?category=cats&page=1");
  });

  it("getPost gets by id or slug", async () => {
    api.get.mockResolvedValue({ data: {} });
    await galleryApi.getPost("my-slug");
    expect(api.get).toHaveBeenCalledWith("/gallery/my-slug");
  });

  it("getPostsAdmin / getPostAdmin hit admin routes", async () => {
    api.get.mockResolvedValue({ data: [] });
    await galleryApi.getPostsAdmin();
    expect(api.get).toHaveBeenCalledWith("/gallery/admin/all");
    await galleryApi.getPostAdmin("5");
    expect(api.get).toHaveBeenCalledWith("/gallery/admin/5");
  });

  it("createPost / updatePost / deletePost use the right verbs", async () => {
    api.post.mockResolvedValue({ data: {} });
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
    await galleryApi.createPost({ t: 1 });
    expect(api.post).toHaveBeenCalledWith("/gallery", { t: 1 });
    await galleryApi.updatePost("5", { t: 2 });
    expect(api.patch).toHaveBeenCalledWith("/gallery/5", { t: 2 });
    await galleryApi.deletePost("5");
    expect(api.delete).toHaveBeenCalledWith("/gallery/5");
  });

  it("uploadImage returns the nested cloudinary url", async () => {
    api.post.mockResolvedValue({ data: { data: { url: "http://cdn/g.jpg" } } });
    const url = await galleryApi.uploadImage(new Blob(["x"]));
    expect(url).toBe("http://cdn/g.jpg");
    expect(api.post.mock.calls[0][1]).toBeInstanceOf(FormData);
  });
});
