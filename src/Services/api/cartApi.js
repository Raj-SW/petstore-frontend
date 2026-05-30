// frontend/src/Services/api/cartApi.js
import { api } from "../../core/api/apiClient";

const cartApi = {
  // Get the logged-in user's cart from backend
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data.data; // { items, totalItems, totalAmount, ... }
  },

  // Add a product to the backend cart
  // productId = MongoDB _id string, quantity = positive integer
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post("/cart", { productId, quantity });
    return response.data.data;
  },

  // Update quantity of an existing cart item
  updateItem: async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    return response.data.data;
  },

  // Remove a single item from the cart
  removeItem: async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data.data;
  },

  // Clear all items from the cart
  clearCart: async () => {
    const response = await api.delete("/cart/clear");
    return response.data.data;
  },
};

export default cartApi;
