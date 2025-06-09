import BannerCarousel from "./BannerCarousel";

const CarouselComponent = () => {
  return (
    <div>
      <div
        className="BannerCarouselWrapper"
        // style={{ backgroundColor: "#A7D7C5" }}
      >
        <div className="d-none d-lg-block  ">
          <BannerCarousel deviceType="desktop" />
        </div>
        <div className="d-none d-md-block d-lg-none">
          <BannerCarousel deviceType="tablet" />
        </div>
        <div className="d-block d-md-none">
          <BannerCarousel deviceType="mobile" />
        </div>
      </div>
    </div>
  );
};

export default CarouselComponent;
