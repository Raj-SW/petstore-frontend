import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import petApi from "./petApi";

beforeEach(() => vi.clearAllMocks());

describe("petApi", () => {
  it("createPet posts the data", async () => {
    api.post.mockResolvedValue({ data: {} });
    await petApi.createPet({ name: "Rex" });
    expect(api.post).toHaveBeenCalledWith("/pets", { name: "Rex" });
  });

  it("getUserPets / getPetById", async () => {
    api.get.mockResolvedValue({ data: {} });
    await petApi.getUserPets();
    expect(api.get).toHaveBeenCalledWith("/pets");
    await petApi.getPetById("9");
    expect(api.get).toHaveBeenCalledWith("/pets/9");
  });

  it("updatePet / deletePet", async () => {
    api.patch.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: {} });
    await petApi.updatePet("9", { name: "Max" });
    expect(api.patch).toHaveBeenCalledWith("/pets/9", { name: "Max" });
    await petApi.deletePet("9");
    expect(api.delete).toHaveBeenCalledWith("/pets/9");
  });

  it("addPetImages posts FormData with all files appended", async () => {
    api.post.mockResolvedValue({ data: {} });
    await petApi.addPetImages("9", [new Blob(["a"]), new Blob(["b"])]);
    const [path, body] = api.post.mock.calls[0];
    expect(path).toBe("/pets/9/images");
    expect(body).toBeInstanceOf(FormData);
    expect(body.getAll("petImages")).toHaveLength(2);
  });

  it("deletePetImage encodes the publicId in the path", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await petApi.deletePetImage("9", "folder/pic 1");
    expect(api.delete).toHaveBeenCalledWith(
      "/pets/9/images/folder%2Fpic%201",
    );
  });

  it("setPrimaryPetImage patches the encoded primary route", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await petApi.setPrimaryPetImage("9", "folder/pic");
    expect(api.patch).toHaveBeenCalledWith(
      "/pets/9/images/folder%2Fpic/primary",
    );
  });
});
