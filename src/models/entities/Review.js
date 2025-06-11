class Review {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.productId = data.productId || null;
    this.userId = data.userId || null;
    this.rating = data.rating || 0;
    this.comment = data.comment || "";
    this.likes = data.likes || 0;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      userId: this.userId,
      rating: this.rating,
      comment: this.comment,
      likes: this.likes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json) {
    return new Review(json);
  }

  validate() {
    const errors = [];

    if (!this.productId) errors.push("Product ID is required");
    if (!this.userId) errors.push("User ID is required");

    if (this.rating < 1 || this.rating > 5) {
      errors.push("Rating must be between 1 and 5");
    }

    if (this.comment && this.comment.length > 1000) {
      errors.push("Comment cannot exceed 1000 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  incrementLikes() {
    this.likes += 1;
    this.updatedAt = new Date();
  }

  decrementLikes() {
    if (this.likes > 0) {
      this.likes -= 1;
      this.updatedAt = new Date();
    }
  }
}

export default Review;
