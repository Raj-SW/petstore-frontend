import { api } from "../../core/api/apiClient";

const ReviewService = {
  // Fetch reviews for a specific product
  async fetchProductReviews(productId) {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      throw error;
    }
  },

  // Add a new review
  async addReview(review) {
    try {
      const response = await api.post("/reviews", review);
      console.log("response:", response);
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  },

  // Like a review
  async likeReview(reviewId) {
    try {
      const response = await api.post(`/reviews/${reviewId}/like`);
      return response.data;
    } catch (error) {
      console.error("Error liking review:", error);
      throw error;
    }
  },
};

export default ReviewService;
