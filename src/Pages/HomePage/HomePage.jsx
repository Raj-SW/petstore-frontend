import "bootstrap/dist/css/bootstrap.min.css";
import FeaturedProductSection from "./HomePageSections/FeaturedProductSection";
import HeroSection from "./HomePageSections/HeroSection";
import ServicesSection from "./HomePageSections/ServicesSection";
import StatsSection from "./HomePageSections/StatsSection";
import EngagementSection from "./HomePageSections/EngagementSection/EngagementSection";
import PromoBannerCarousel from "./HomePageSections/PromoBannerCarousel/PromoBannerCarousel";
import FaqSection from "./HomePageSections/FaqSection/FaqSection";
import useSEO from "../../hooks/useSEO";
import "./HomePage.css";

const HomePage = () => {
  useSEO();
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PromoBannerCarousel />
      <FeaturedProductSection />
      <StatsSection />
      <FaqSection />
      <EngagementSection />
    </>
  );
};

export default HomePage;
