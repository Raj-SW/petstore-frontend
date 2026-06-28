import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/core/api/apiClient", () => {
  const m = { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() };
  return { api: m, default: m };
});

import { api } from "@/core/api/apiClient";
import ordersApi from "./ordersApi";

beforeEach(() => vi.clearAllMocks());

describe("ordersApi", () => {
  it("createOrder posts the order", async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });
    await ordersApi.createOrder({ items: [] });
    expect(api.post).toHaveBeenCalledWith("/orders", { items: [] });
  });

  it("getMyOrders builds query when params given, omits when empty", async () => {
    api.get.mockResolvedValue({ data: [] });
    await ordersApi.getMyOrders({ status: "paid" });
    expect(api.get).toHaveBeenCalledWith("/orders/my-orders?status=paid");
    await ordersApi.getMyOrders();
    expect(api.get).toHaveBeenLastCalledWith("/orders/my-orders");
  });

  it("getAllOrders hits the admin list", async () => {
    api.get.mockResolvedValue({ data: [] });
    await ordersApi.getAllOrders({ page: 1 });
    expect(api.get).toHaveBeenCalledWith("/orders?page=1");
  });

  it("getOrderById gets by id", async () => {
    api.get.mockResolvedValue({ data: {} });
    await ordersApi.getOrderById("9");
    expect(api.get).toHaveBeenCalledWith("/orders/9");
  });

  it("updateOrderStatus PATCHes status", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await ordersApi.updateOrderStatus("9", "shipped");
    expect(api.patch).toHaveBeenCalledWith("/orders/9/status", {
      status: "shipped",
    });
  });

  it("cancelOrder PATCHes the cancel route (not DELETE)", async () => {
    api.patch.mockResolvedValue({ data: {} });
    await ordersApi.cancelOrder("9");
    expect(api.patch).toHaveBeenCalledWith("/orders/9/cancel");
    expect(api.delete).not.toHaveBeenCalled();
  });
});
