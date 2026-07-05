import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/Components/ui/carousel";
import ProductReviewCard from "../ProductReviewCard/ProductReviewCard";
import "./ReviewCarousel.css";

// Same responsive breakpoints PrimeReact's Carousel used to provide via
// `responsiveOptions` (1 visible on mobile, 2 on tablet, 3 on desktop),
// expressed as Tailwind basis utilities on each slide.
const ReviewCarousel = ({ reviews, currentUserId, onEdit, onDelete }) => (
  <div className="review-carousel-wrap">
    <Carousel className="review-carousel" opts={{ align: "start", loop: true }}>
      <CarouselContent>
        {reviews.map((review) => (
          <CarouselItem
            key={review._id || review.id}
            className="basis-full sm:basis-1/2 lg:basis-1/3"
          >
            <div className="review-carousel-slide">
              <ProductReviewCard
                review={review}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="review-carousel-arrow review-carousel-arrow--prev" />
      <CarouselNext className="review-carousel-arrow review-carousel-arrow--next" />
    </Carousel>
  </div>
);

export default ReviewCarousel;
