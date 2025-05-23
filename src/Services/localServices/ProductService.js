import Products from "./Products";

class ProductService {
  // Fetch all products
  static fetchAllProducts() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Products);
      }, 50); // Simulates a delay for fetching data
    });
  }

  // Fetch a product by ID
  static fetchProductById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = Products.find((item) => item.id === parseInt(id, 10));
        if (product) {
          resolve(product);
        } else {
          reject(new Error(`Product with id ${id} not found`));
        }
      }, 50); // Simulates a delay for fetching data
    });
  }

  // Fetch products by category
  static fetchProductsByCategory(category) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredProducts = Products.filter(
          (item) => item.category === category
        );
        resolve(filteredProducts);
      }, 50); // Simulates a delay for fetching data
    });
  }

  // Fetch products by apparel
  static fetchProductsByApparel() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredProducts = Products.filter(
          (item) => item.isApparel === true
        );
        resolve(filteredProducts);
      }, 50); // Simulates a delay for fetching data
    });
  }
  // Fetch products by name
  static fetchProductsByName(name) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredProducts = Products.filter((item) =>
          item.title.toLowerCase().includes(name.toLowerCase())
        );
        resolve(filteredProducts);
      }, 50); // Simulates a delay for fetching data
    });
  }

  // Fetch related products by category, excluding the current product, limit to 4
  static fetchRelatedProducts(category, excludeId, limit = 4) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const related = Products.filter(
          (item) => item.category === category && item.id !== excludeId
        ).slice(0, limit);
        resolve(related);
      }, 50);
    });
  }
}

export default ProductService;
