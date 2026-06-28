import { describe, it, expect, beforeEach, vi } from "vitest";

// invoiceApi uses the DEFAULT apiClient export directly (apiClient.get(...).then).
vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import apiClient from "@/core/api/apiClient";
import invoiceApi from "./invoiceApi";

beforeEach(() => vi.clearAllMocks());

describe("invoiceApi", () => {
  it("getInvoices passes params and unwraps data", async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1 }] });
    await expect(invoiceApi.getInvoices({ page: 2 })).resolves.toEqual([
      { id: 1 },
    ]);
    expect(apiClient.get).toHaveBeenCalledWith("/admin/invoices", {
      params: { page: 2 },
    });
  });

  it("getInvoice gets by id", async () => {
    apiClient.get.mockResolvedValue({ data: { id: 7 } });
    await invoiceApi.getInvoice("7");
    expect(apiClient.get).toHaveBeenCalledWith("/admin/invoices/7");
  });

  it("generateInvoice posts for an order", async () => {
    apiClient.post.mockResolvedValue({ data: {} });
    await invoiceApi.generateInvoice("o1");
    expect(apiClient.post).toHaveBeenCalledWith("/admin/invoices/generate/o1");
  });

  it("downloadPDF requests a blob and triggers a download", async () => {
    apiClient.get.mockResolvedValue({ data: new Blob(["pdf"]) });
    // jsdom lacks URL.createObjectURL / revokeObjectURL — stub them.
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    await invoiceApi.downloadPDF("7", "INV-001");

    expect(apiClient.get).toHaveBeenCalledWith("/admin/invoices/7/pdf", {
      responseType: "blob",
    });
    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:x");
    clickSpy.mockRestore();
  });
});
