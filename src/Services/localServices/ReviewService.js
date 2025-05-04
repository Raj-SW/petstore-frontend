// Mock data for product reviews
const mockReviews = [
  {
    id: 1,
    productId: 1,
    userId: 101,
    userName: "John Doe",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    date: "2024-03-15",
    title: "Excellent Product!",
    comment:
      "This product exceeded my expectations. My pet loves it and the quality is outstanding.",
    likes: 24,
    verifiedPurchase: true,
  },
  {
    id: 2,
    productId: 1,
    userId: 102,
    userName: "Jane Smith",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    rating: 4,
    date: "2024-03-10",
    title: "Great Value",
    comment:
      "Good quality for the price. My pet seems to enjoy it, though it took a few days to get used to it.",
    likes: 12,
    verifiedPurchase: true,
  },
  {
    id: 3,
    productId: 1,
    userId: 103,
    userName: "Mike Johnson",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    rating: 5,
    date: "2024-03-05",
    title: "Perfect for my pet",
    comment:
      "Exactly what I was looking for. The size is perfect and the material is durable.",
    likes: 18,
    verifiedPurchase: false,
  },
  {
    id: 4,
    productId: 1,
    userId: 104,
    userName: "Sarah Williams",
    userAvatar: "https://i.pravatar.cc/150?img=4",
    rating: 3,
    date: "2024-03-01",
    title: "Decent product",
    comment:
      "It's okay, but I expected better quality for the price. Still, my pet seems to like it.",
    likes: 5,
    verifiedPurchase: true,
  },
  {
    id: 5,
    productId: 25,
    userId: 105,
    userName: "Alex Thompson",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    date: "2024-03-20",
    title: "Perfect for my pet's needs",
    comment:
      "I purchased this for my pet and it's been absolutely wonderful. The quality is top-notch and my pet seems to love it. The size is perfect and it's very durable. Would definitely recommend to other pet owners!",
    likes: 8,
    verifiedPurchase: true,
  },
  {
    id: 6,
    productId: 25,
    userId: 106,
    userName: "Emily Rodriguez",
    userAvatar: "https://i.pravatar.cc/150?img=6",
    rating: 4,
    date: "2024-03-18",
    title: "Great product with minor improvements needed",
    comment:
      "Overall a good product. My pet enjoys using it, but I think the design could be slightly improved for better comfort. The material is high quality though, and it's holding up well with daily use.",
    likes: 3,
    verifiedPurchase: true,
  },
  {
    id: 7,
    productId: 25,
    userId: 107,
    userName: "David Chen",
    userAvatar: "https://i.pravatar.cc/150?img=7",
    rating: 5,
    date: "2024-03-15",
    title: "Excellent value for money",
    comment:
      "This product exceeded my expectations. The build quality is impressive, and it's clear that a lot of thought went into the design. My pet took to it immediately, and it's been a great addition to our home.",
    likes: 15,
    verifiedPurchase: true,
  },
  {
    id: 8,
    productId: 25,
    userId: 108,
    userName: "Sophia Martinez",
    userAvatar: "https://i.pravatar.cc/150?img=8",
    rating: 3,
    date: "2024-03-17",
    title: "Good but could be better",
    comment:
      "The product is decent but I expected more for the price. My pet uses it but doesn't seem particularly excited about it. The quality is okay, but I think there are better options out there.",
    likes: 2,
    verifiedPurchase: true,
  },
  {
    id: 9,
    productId: 25,
    userId: 109,
    userName: "James Wilson",
    userAvatar: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    date: "2024-03-16",
    title: "Best purchase for my pet!",
    comment:
      "I've tried many similar products, but this one stands out. The attention to detail is impressive, and my pet absolutely loves it. The durability is excellent, and it's easy to clean. Worth every penny!",
    likes: 12,
    verifiedPurchase: true,
  },
  {
    id: 10,
    productId: 25,
    userId: 110,
    userName: "Olivia Brown",
    userAvatar: "https://i.pravatar.cc/150?img=10",
    rating: 4,
    date: "2024-03-14",
    title: "Very satisfied with this purchase",
    comment:
      "This product has been a great addition to our home. My pet took to it immediately, and it's holding up well with daily use. The only reason I'm not giving it 5 stars is that the color faded slightly after a few washes.",
    likes: 6,
    verifiedPurchase: true,
  },
  {
    id: 11,
    productId: 25,
    userId: 111,
    userName: "Michael Taylor",
    userAvatar: "https://i.pravatar.cc/150?img=11",
    rating: 2,
    date: "2024-03-12",
    title: "Disappointed with the quality",
    comment:
      "Unfortunately, this product didn't meet my expectations. The material feels cheap, and it started showing signs of wear after just a week. My pet doesn't seem to like it much either. Would not recommend.",
    likes: 1,
    verifiedPurchase: true,
  },
  {
    id: 12,
    productId: 25,
    userId: 112,
    userName: "Emma Anderson",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    date: "2024-03-10",
    title: "Perfect for my pet's needs",
    comment:
      "I'm so glad I found this product! It's exactly what I was looking for. The size is perfect, the material is high quality, and my pet absolutely adores it. The design is thoughtful and practical. Highly recommend!",
    likes: 9,
    verifiedPurchase: true,
  },
];

const ReviewService = {
  // Fetch reviews for a specific product
  fetchProductReviews: (productId) => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const productReviews = mockReviews.filter(
          (review) => review.productId === productId
        );
        resolve(productReviews);
      }, 50);
    });
  },

  // Add a new review
  addReview: (review) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newReview = {
          ...review,
          id: mockReviews.length + 1,
          date: new Date().toISOString().split("T")[0],
          likes: 0,
        };
        mockReviews.push(newReview);
        resolve(newReview);
      }, 50);
    });
  },

  // Like a review
  likeReview: (reviewId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const review = mockReviews.find((r) => r.id === reviewId);
        if (review) {
          review.likes += 1;
        }
        resolve(review);
      }, 50);
    });
  },
};

export default ReviewService;
