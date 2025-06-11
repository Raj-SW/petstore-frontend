class ProductCreateDTO {
  constructor(data = {}) {
    this.title = data.title || "";
    this.description = data.description || "";
    this.price = data.price || 0;
    this.category = data.category || "";
    this.stock = data.stock || 0;
    this.specifications = data.specifications || {};
    this.supplierDetails = data.supplierDetails || "";
  }

  validate() {
    const errors = [];

    if (!this.title) errors.push("Product title is required");
    if (!this.description) errors.push("Product description is required");
    if (!this.category) errors.push("Product category is required");

    if (this.price < 0) {
      errors.push("Price cannot be negative");
    }

    if (this.stock < 0) {
      errors.push("Stock cannot be negative");
    }

    return { isValid: errors.length === 0, errors };
  }
}

class ProductUpdateDTO {
  constructor(data = {}) {
    this.title = data.title;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.stock = data.stock;
    this.specifications = data.specifications;
    this.supplierDetails = data.supplierDetails;
    this.isActive = data.isActive;
  }

  validate() {
    const errors = [];

    if (this.price !== undefined && this.price < 0) {
      errors.push("Price cannot be negative");
    }

    if (this.stock !== undefined && this.stock < 0) {
      errors.push("Stock cannot be negative");
    }

    return { isValid: errors.length === 0, errors };
  }

  toJSON() {
    const json = {};
    if (this.title !== undefined) json.title = this.title;
    if (this.description !== undefined) json.description = this.description;
    if (this.price !== undefined) json.price = this.price;
    if (this.category !== undefined) json.category = this.category;
    if (this.stock !== undefined) json.stock = this.stock;
    if (this.specifications !== undefined)
      json.specifications = this.specifications;
    if (this.supplierDetails !== undefined)
      json.supplierDetails = this.supplierDetails;
    if (this.isActive !== undefined) json.isActive = this.isActive;
    return json;
  }
}

class ProductFilterDTO {
  constructor(data = {}) {
    this.category = data.category;
    this.minPrice = data.minPrice;
    this.maxPrice = data.maxPrice;
    this.minRating = data.minRating;
    this.maxRating = data.maxRating;
    this.search = data.search;
    this.page = data.page || 1;
    this.limit = data.limit || 10;
    this.sort = data.sort || "-createdAt";
  }

  validate() {
    const errors = [];

    if (this.minPrice !== undefined && this.minPrice < 0) {
      errors.push("Minimum price cannot be negative");
    }

    if (this.maxPrice !== undefined && this.maxPrice < 0) {
      errors.push("Maximum price cannot be negative");
    }

    if (
      this.minPrice !== undefined &&
      this.maxPrice !== undefined &&
      this.minPrice > this.maxPrice
    ) {
      errors.push("Minimum price cannot be greater than maximum price");
    }

    if (
      this.minRating !== undefined &&
      (this.minRating < 0 || this.minRating > 5)
    ) {
      errors.push("Minimum rating must be between 0 and 5");
    }

    if (
      this.maxRating !== undefined &&
      (this.maxRating < 0 || this.maxRating > 5)
    ) {
      errors.push("Maximum rating must be between 0 and 5");
    }

    return { isValid: errors.length === 0, errors };
  }

  toQueryParams() {
    const params = new URLSearchParams();

    if (this.category) params.append("category", this.category);
    if (this.minPrice) params.append("minPrice", this.minPrice);
    if (this.maxPrice) params.append("maxPrice", this.maxPrice);
    if (this.minRating) params.append("minRating", this.minRating);
    if (this.maxRating) params.append("maxRating", this.maxRating);
    if (this.search) params.append("search", this.search);
    if (this.page) params.append("page", this.page);
    if (this.limit) params.append("limit", this.limit);
    if (this.sort) params.append("sort", this.sort);

    return params.toString();
  }
}

export { ProductCreateDTO, ProductUpdateDTO, ProductFilterDTO };
