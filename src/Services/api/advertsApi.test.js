import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import advertsApi from "./advertsApi";

beforeEach(() => vi.clearAllMocks());

describe("advertsApi", () => {
  it("getAdverts appends a placement query when given", async () => {
    api.get.mockResolvedValue({ data: ["a"] });
    await expect(advertsApi.getAdverts("banner")).resolves.toEqual(["a"]);
    expect(api.get).toHaveBeenCalledWith("/adverts?placement=banner");
  });

  it("getAdverts omits the query when no placement", async () => {
    api.get.mockResolvedValue({ data: [] });
    await advertsApi.getAdverts();
    expect(api.get).toHaveBeenCalledWith("/adverts");
  });

  it("getAdvertsAdmin hits the admin route", async () => {
    api.get.mockResolvedValue({ data: [] });
    await advertsApi.getAdvertsAdmin();
    expect(api.get).toHaveBeenCalledWith("/adverts/admin/all");
  });

  it("createAdvert posts the payload", async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });
    await advertsApi.createAdvert({ title: "x" });
    expect(api.post).toHaveBeenCalledWith("/adverts", { title: "x" });
  });

  it("updateAdvert patches by id", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await advertsApi.updateAdvert("7", { title: "y" });
    expect(api.patch).toHaveBeenCalledWith("/adverts/7", { title: "y" });
  });

  it("deleteAdvert deletes by id", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await advertsApi.deleteAdvert("7");
    expect(api.delete).toHaveBeenCalledWith("/adverts/7");
  });

  it("uploadImage posts FormData and returns the nested url", async () => {
    api.post.mockResolvedValue({ data: { data: { url: "http://cdn/x.jpg" } } });
    const url = await advertsApi.uploadImage(new Blob(["x"]));
    expect(url).toBe("http://cdn/x.jpg");
    const [path, body, config] = api.post.mock.calls[0];
    expect(path).toBe("/adverts/upload-image");
    expect(body).toBeInstanceOf(FormData);
    expect(config.headers["Content-Type"]).toBe("multipart/form-data");
  });
});
