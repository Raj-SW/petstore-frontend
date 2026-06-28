import { describe, it, expect, beforeEach, vi } from "vitest";

// transactionApi uses the DEFAULT apiClient export directly.
vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import apiClient from "@/core/api/apiClient";
import transactionApi from "./transactionApi";

beforeEach(() => vi.clearAllMocks());

describe("transactionApi", () => {
  it("getTransactions passes params and unwraps data", async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    await expect(transactionApi.getTransactions({ page: 1 })).resolves.toEqual([
      { id: 1 },
    ]);
    expect(apiClient.get).toHaveBeenCalledWith("/admin/transactions", {
      params: { page: 1 },
    });
  });

  it("getTransaction gets by id", async () => {
    apiClient.get.mockResolvedValue({ data: { id: 7 } });
    await transactionApi.getTransaction("7");
    expect(apiClient.get).toHaveBeenCalledWith("/admin/transactions/7");
  });
});
