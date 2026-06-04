import { api } from "../../core/api/apiClient";

const inventoryApi = {
  // GET /admin/inventory
  // params: { page, limit, status, category, search, threshold }
  getInventory: async (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== "")
      )
    ).toString();
    const response = await api.get(`/admin/inventory${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  // GET /admin/inventory/low-stock
  getLowStock: async (threshold = 10) => {
    const response = await api.get(
      `/admin/inventory/low-stock?threshold=${threshold}`
    );
    return response.data;
  },

  // GET /admin/inventory/:id/movements
  getMovements: async (productId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const response = await api.get(
      `/admin/inventory/${productId}/movements${qs ? `?${qs}` : ""}`
    );
    return response.data;
  },

  // PATCH /admin/inventory/:id/restock
  restockProduct: async (productId, units, note = "") => {
    const response = await api.patch(`/admin/inventory/${productId}/restock`, {
      units,
      note,
    });
    return response.data;
  },

  // PATCH /admin/inventory/:id/adjust
  adjustStock: async (productId, newQuantity, note) => {
    const response = await api.patch(`/admin/inventory/${productId}/adjust`, {
      newQuantity,
      note,
    });
    return response.data;
  },
};

export default inventoryApi;
