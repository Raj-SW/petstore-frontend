class ProductService {
  static API_URL = "http://localhost:5000/api";

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
        ...(params.search && { search: params.search }),
      });

      const response = await fetch(`${this.API_URL}/products?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const responseData = await response.json();

      if (responseData.success) {
        return {
          products: responseData.data,
          pagination: responseData.pagination,
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
      const response = await fetch(`${this.API_URL}/products/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      const responseData = await response.json();

      if (responseData.success) {
        return responseData.data;
      }
      throw new Error("Product not found");
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  // Create a new product
  static async createProduct(productData) {
    try {
      const response = await fetch(`${this.API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  // Update a product
  static async updateProduct(id, productData) {
    try {
      const response = await fetch(`${this.API_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  // Delete a product
  static async deleteProduct(id) {
    try {
      const response = await fetch(`${this.API_URL}/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      const responseData = await response.json();
      return responseData.success;
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

      const response = await fetch(
        `${this.API_URL}/products/${productId}/images`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  }

  // Delete product image
  static async deleteProductImage(productId, imageId) {
    try {
      const response = await fetch(
        `${this.API_URL}/products/${productId}/images/${imageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      const responseData = await response.json();
      return responseData.success;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  // Helper method to transform product data for frontend
  static transformProductData(product) {
    return {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images || [],
      rating: product.averageRating || 0,
      numReviews: product.numReviews || 0,
      featured: product.featured || false,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  // Fetch products by category
  static async fetchProductsByCategory(category) {
    try {
      const response = await fetch(
        `${this.API_URL}/products?category=${category}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products by category");
      }
      const responseData = await response.json();
      return responseData.success ? responseData.data : [];
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
  }

  // Fetch products by apparel
  static async fetchProductsByApparel() {
    try {
      const response = await fetch(`${this.API_URL}/products?category=apparel`);
      if (!response.ok) {
        throw new Error("Failed to fetch apparel products");
      }
      const responseData = await response.json();
      return responseData.success ? responseData.data : [];
    } catch (error) {
      console.error("Error fetching apparel products:", error);
      return [];
    }
  }

  // Fetch products by name
  static async fetchProductsByName(name) {
    try {
      const response = await fetch(
        `${this.API_URL}/products?search=${encodeURIComponent(name)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products by name");
      }
      const responseData = await response.json();
      return responseData.success ? responseData.data : [];
    } catch (error) {
      console.error("Error fetching products by name:", error);
      return [];
    }
  }

  // Fetch related products by category, excluding the current product, limit to 4
  static async fetchRelatedProducts(category, excludeId, limit = 4) {
    try {
      const response = await fetch(
        `${this.API_URL}/products?category=${category}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch related products");
      }
      const responseData = await response.json();
      if (responseData.success) {
        // Filter out the current product and limit the results
        return responseData.data
          .filter((product) => product._id !== excludeId)
          .slice(0, limit);
      }
      return [];
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  }
}

export default ProductService;
