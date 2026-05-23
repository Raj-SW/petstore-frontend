import "bootstrap/dist/css/bootstrap.min.css";
import FeaturedProductSection from "./HomePageSections/FeaturedProductSection";
import HeroSection from "./HomePageSections/HeroSection";
import ServicesSection from "./HomePageSections/ServicesSection";
import CommunitySection from "./HomePageSections/CommunitySection";
import PromoBannerCarousel from "./HomePageSections/PromoBannerCarousel/PromoBannerCarousel";
import "./HomePage.css";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PromoBannerCarousel />
      <FeaturedProductSection />
      <CommunitySection />
    </>
  );
};

export default HomePage;
