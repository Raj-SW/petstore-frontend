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
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin only)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get(`/products?isFeatured=true&limit=${limit}`);
    return response.data;
  },

  // Get featured products filtered by category, falls back to latest products if none are featured
  getFeaturedByCategory: async (category, limit = 3) => {
    const base = `/products?categories=${encodeURIComponent(category)}&limit=${limit}&isActive=true`;

    const featuredRes = await api.get(`${base}&isFeatured=true`);
    const featured = featuredRes.data?.data ?? [];
    if (featured.length > 0) return featured;

    // Fallback: show latest active products from that category
    const fallbackRes = await api.get(base);
    return fallbackRes.data?.data ?? [];
  },

  // Search products
  searchProducts: async (searchTerm, params = {}) => {
    const queryParams = { search: searchTerm, ...params };
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await api.get(`/products?${queryString}`);
    return response.data;
  },

  // Get products by category (used for related products)
  getProductsByCategory: async (category, excludeId = null) => {
    const response = await api.get(
      `/products/category/${encodeURIComponent(category)}`
    );
    const products = response.data?.data || [];
    return excludeId
      ? products.filter(p => p._id !== excludeId && p.id !== excludeId)
      : products;
  },

  // Get reviews for a product (public)
  getProductReviews: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data?.data || [];
  },

  // Submit a review (authenticated)
  submitReview: async (productId, reviewData) => {
    const response = await api.post(`/reviews/${productId}`, reviewData);
    return response.data?.data ?? response.data;
  },

  // Update an existing review (authenticated, owner only)
  updateReview: async (reviewId, reviewData) => {
    const response = await api.patch(`/reviews/${reviewId}`, reviewData);
    return response.data?.data ?? response.data;
  },

  // Delete a review (authenticated, owner only)
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export default productsApi;
