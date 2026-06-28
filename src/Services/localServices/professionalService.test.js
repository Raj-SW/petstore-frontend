import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("axios", () => {
  const fn = vi.fn();
  fn.get = vi.fn();
  fn.post = vi.fn();
  return { default: fn };
});

import axios from "axios";
import ProfessionalService from "./professionalService";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("ProfessionalService", () => {
  it("getAll requests /professionals with params", async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1 }] });
    await expect(ProfessionalService.getAll({ q: "x" })).resolves.toEqual([
      { id: 1 },
    ]);
    const [url, config] = axios.get.mock.calls[0];
    expect(url).toContain("/professionals");
    expect(config).toEqual({ params: { q: "x" } });
  });

  it("getByRole passes the role as a param", async () => {
    axios.get.mockResolvedValue({ data: [] });
    await ProfessionalService.getByRole("vet");
    expect(axios.get.mock.calls[0][1]).toEqual({ params: { role: "vet" } });
  });

  it("getById requests the per-id route", async () => {
    axios.get.mockResolvedValue({ data: { id: 1 } });
    await ProfessionalService.getById("1");
    expect(axios.get.mock.calls[0][0]).toContain("/professionals/1");
  });

  it("maps backend error messages into thrown Errors", async () => {
    axios.get.mockRejectedValue({ response: { data: { message: "nope" } } });
    await expect(ProfessionalService.getAll()).rejects.toThrow("nope");
  });

  it("falls back to a generic message when none is given", async () => {
    axios.get.mockRejectedValue({});
    await expect(ProfessionalService.getById("1")).rejects.toThrow(
      "Failed to fetch professional",
    );
  });
});
