import { Carousel } from "primereact/carousel";
import "primereact/resources/themes/saga-green/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import ProductReviewCard from "../ProductReviewCard/ProductReviewCard";

const ReviewCarousel = ({ reviews, currentUserId, onEdit, onDelete }) => {
  const responsiveOptions = [
    {
      breakpoint: "1400px",
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: "1199px",
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: "767px",
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: "575px",
      numVisible: 1,
      numScroll: 1,
    },
  ];

  const reviewTemplate = (review) => (
    <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem" }}>
      <ProductReviewCard
        review={review}
        currentUserId={currentUserId}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );

  return (
    <div style={{ margin: "1rem 0" }}>
      <Carousel
        value={reviews}
        itemTemplate={reviewTemplate}
        numVisible={3}
        numScroll={1}
        circular
        style={{ maxWidth: "100vw", margin: "0 auto" }}
        responsiveOptions={responsiveOptions}
      />
    </div>
  );
};

export default ReviewCarousel;
