import axios from "axios";

const API_URL = import.meta.env.VITE_NODE_API_URL;

const ReviewService = {
  // Fetch reviews for a specific product
  async fetchProductReviews(productId) {
    try {
      const response = await axios.get(
        `${API_URL}/reviews/product/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      throw error;
    }
  },

  // Add a new review
  async addReview(review) {
    try {
      const response = await axios.post(`${API_URL}/reviews`, review);
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  },

  // Like a review
  async likeReview(reviewId) {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/like`);
      return response.data;
    } catch (error) {
      console.error("Error liking review:", error);
      throw error;
    }
  },
};

export default ReviewService;
