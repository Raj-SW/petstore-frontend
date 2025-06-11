class Product {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.title = data.title || "";
    this.description = data.description || "";
    this.price = data.price || 0;
    this.category = data.category || "";
    this.images = data.images || [];
    this.rating = data.rating || 0;
    this.numReviews = data.numReviews || 0;
    this.featured = data.featured || false;
    this.isActive = data.isActive ?? true;
    this.specifications = data.specifications || {};
    this.supplierDetails = data.supplierDetails || "";
    this.stock = data.stock || 0;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      price: this.price,
      category: this.category,
      images: this.images,
      rating: this.rating,
      numReviews: this.numReviews,
      featured: this.featured,
      isActive: this.isActive,
      specifications: this.specifications,
      supplierDetails: this.supplierDetails,
      stock: this.stock,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json) {
    return new Product(json);
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

    if (this.rating < 0 || this.rating > 5) {
      errors.push("Rating must be between 0 and 5");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  addImage(imageUrl) {
    this.images.push(imageUrl);
  }

  removeImage(imageUrl) {
    this.images = this.images.filter((img) => img !== imageUrl);
  }

  updateRating(newRating) {
    const totalRating = this.rating * this.numReviews + newRating;
    this.numReviews += 1;
    this.rating = totalRating / this.numReviews;
  }
}

export default Product;
