import axios from "axios";

class ProductService {
  static API_URL = import.meta.env.VITE_NODE_API_URL;
  static requestQueue = new Map();
  static retryDelays = [1000, 2000, 4000]; // Exponential backoff delays

  // Helper method to handle rate limiting with retries
  static async handleRequest(url, options = {}, retryCount = 0) {
    try {
      const response = await axios({
        url,
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      return response;
    } catch (error) {
      if (error.response?.status === 429) {
        if (retryCount < this.retryDelays.length) {
          console.log(
            `Rate limited. Retrying in ${this.retryDelays[retryCount]}ms...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelays[retryCount])
          );
          return this.handleRequest(url, options, retryCount + 1);
        }
        throw new Error("Too many requests. Please try again later.");
      }

      console.error("Request error:", error);
      throw error;
    }
  }

  // Helper method to debounce requests
  static debounceRequest(key, requestFn) {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = requestFn();
    this.requestQueue.set(key, promise);

    promise.finally(() => {
      this.requestQueue.delete(key);
    });

    return promise;
  }

  // Fetch all products with filtering, sorting, and pagination
  static async fetchAllProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || "-createdAt",
        ...(params.category && { category: params.category }),
        ...(params.minPrice && { minPrice: params.minPrice }),
        ...(params.maxPrice && { maxPrice: params.maxPrice }),
        ...(params.minRating && { minRating: params.minRating }),
        ...(params.maxRating && { maxRating: params.maxRating }),
        ...(params.search && { search: params.search }),
      });

      const response = await this.handleRequest(
        `${this.API_URL}/products?${queryParams}`
      );

      if (response.data.success) {
        return {
          products: response.data.data,
          pagination: response.data.pagination,
        };
      }
      return { products: [], pagination: { total: 0, page: 1, pages: 1 } };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { products: [], pagination: { total: 0, page: 1, pages: 1 } };
    }
  }

  // Fetch a single product by ID
  static async fetchProductById(id) {
    try {
      if (!id) {
        throw new Error("Product ID is required");
      }

      const response = await this.handleRequest(
        `${this.API_URL}/products/${id}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch product");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error in fetchProductById:", error);
      throw error;
    }
  }

  // Create a new product
  static async createProduct(productData) {
    try {
      const response = await this.handleRequest(`${this.API_URL}/products`, {
        method: "POST",
        data: productData,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  // Update a product
  static async updateProduct(id, productData) {
    try {
      const response = await this.handleRequest(
        `${this.API_URL}/products/${id}`,
        {
          method: "PUT",
          data: productData,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  // Delete a product
  static async deleteProduct(id) {
    try {
      const response = await this.handleRequest(
        `${this.API_URL}/products/${id}`,
        {
          method: "DELETE",
        }
      );
      return response.data.success;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  // Upload product images
  static async uploadProductImages(productId, images) {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await this.handleRequest(
        `${this.API_URL}/products/${productId}/images`,
        {
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  }

  // Delete product image
  static async deleteProductImage(productId, imageId) {
    try {
      const response = await this.handleRequest(
        `${this.API_URL}/products/${productId}/images/${imageId}`,
        {
          method: "DELETE",
        }
      );
      return response.data.success;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  // Helper method to transform product data for frontend
  static transformProductData(product) {
    return {
      id: product._id || product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images || [],
      rating: product.rating || 0,
      numReviews: product.numReviews || 0,
      featured: product.featured || false,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      specifications: product.specifications || {},
      supplierDetails: product.supplierDetails || "",
    };
  }

  // Fetch products by category
  static async fetchProductsByCategory(category) {
    const cacheKey = `category_${category}`;

    return this.debounceRequest(cacheKey, async () => {
      try {
        const response = await this.handleRequest(
          `${this.API_URL}/products?category=${category}`
        );
        return response.data.success ? response.data.data : [];
      } catch (error) {
        console.error("Error fetching products by category:", error);
        return [];
      }
    });
  }

  // Fetch products by apparel
  static async fetchProductsByApparel() {
    try {
      const response = await this.handleRequest(
        `${this.API_URL}/products?category=apparel`
      );
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching apparel products:", error);
      return [];
    }
  }

  // Fetch products by name
  static async fetchProductsByName(name) {
    try {
      const response = await this.handleRequest(
        `${this.API_URL}/products?search=${encodeURIComponent(name)}`
      );
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching products by name:", error);
      return [];
    }
  }

  // Fetch related products
  static async fetchRelatedProducts(category, currentProductId) {
    try {
      const response = await this.handleRequest(
        `${this.API_URL}/products?category=${category}&limit=4`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch related products"
        );
      }

      return response.data.data.filter(
        (product) => product._id !== currentProductId
      );
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  }

  // Fetch products by price range
  static async fetchProductsByPriceRange(minPrice, maxPrice, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || "-createdAt",
        minPrice: minPrice || 0,
        maxPrice: maxPrice || Infinity,
      });

      const response = await this.handleRequest(
        `${this.API_URL}/products?${queryParams}`
      );
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching products by price range:", error);
      return [];
    }
  }

  // Fetch products by rating
  static async fetchProductsByRating(minRating, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || "-createdAt",
        minRating: minRating || 0,
      });

      const response = await this.handleRequest(
        `${this.API_URL}/products?${queryParams}`
      );
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching products by rating:", error);
      return [];
    }
  }

  // Fetch products by multiple categories
  static async fetchProductsByCategories(categories, params = {}) {
    try {
      const categoryPromises = categories.map((category) =>
        this.fetchProductsByCategory(category)
      );

      const results = await Promise.all(categoryPromises);
      const allProducts = results.flat();

      // Remove duplicates based on product ID
      const uniqueProducts = Array.from(
        new Map(allProducts.map((product) => [product.id, product])).values()
      );

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = uniqueProducts.slice(startIndex, endIndex);

      return {
        products: paginatedProducts,
        pagination: {
          total: uniqueProducts.length,
          page: page,
          pages: Math.ceil(uniqueProducts.length / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching products by categories:", error);
      return { products: [], pagination: { total: 0, page: 1, pages: 1 } };
    }
  }

  // Fetch products with filters
  static async fetchProductsWithFilters(filters = {}, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || "-createdAt",
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.maxRating && { maxRating: filters.maxRating }),
        ...(filters.search && { search: filters.search }),
      });

      // Remove any undefined or null values
      for (const [key, value] of queryParams.entries()) {
        if (value === "undefined" || value === "null" || value === "Infinity") {
          queryParams.delete(key);
        }
      }

      console.log("Query Parameters:", Object.fromEntries(queryParams));
      const response = await this.handleRequest(
        `${this.API_URL}/products?${queryParams}`
      );

      if (response.data.success) {
        console.log("Response Data:", response.data);
        return {
          products: response.data.data,
          pagination: response.data.pagination,
        };
      }
      return { products: [], pagination: { total: 0, page: 1, pages: 1 } };
    } catch (error) {
      console.error("Error fetching products with filters:", error);
      return { products: [], pagination: { total: 0, page: 1, pages: 1 } };
    }
  }
}

export default ProductService;
