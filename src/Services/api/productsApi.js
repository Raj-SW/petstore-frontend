import { api } from "../../core/api/apiClient";

const productsApi = {
  // Get all products with pagination and filters
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/products${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (Admin only)
  createProduct: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // Update product (Admin only)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin only)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Upload product image
  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/products/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Get product categories
  getCategories: async () => {
    const response = await api.get("/products/categories");
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get(`/products?featured=true&limit=${limit}`);
    return response.data;
  },

  // Search products
  searchProducts: async (searchTerm, params = {}) => {
    const queryParams = {
      search: searchTerm,
      ...params,
    };
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await api.get(`/products?${queryString}`);
    return response.data;
  },
};

export default productsApi;
