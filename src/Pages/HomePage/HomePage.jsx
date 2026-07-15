import "bootstrap/dist/css/bootstrap.min.css";
import HeroSection from "./HomePageSections/HeroSection";
import ServicesSection from "./HomePageSections/ServicesSection";
import PetTravelBand from "./HomePageSections/PetTravelBand/PetTravelBand";
import VetRecommendedSection from "./HomePageSections/VetRecommendedSection/VetRecommendedSection";
import FeaturedProductSection from "./HomePageSections/FeaturedProductSection";
import VetNetworkSection from "./HomePageSections/VetNetworkSection/VetNetworkSection";
import PetCareTipsSection from "./HomePageSections/PetCareTipsSection/PetCareTipsSection";
import StatsSection from "./HomePageSections/StatsSection";
import EngagementSection from "./HomePageSections/EngagementSection/EngagementSection";
import PromoBannerCarousel from "./HomePageSections/PromoBannerCarousel/PromoBannerCarousel";
import FaqSection from "./HomePageSections/FaqSection/FaqSection";
import FinalCtaStrip from "./HomePageSections/FinalCtaStrip/FinalCtaStrip";
import useSEO from "../../hooks/useSEO";
import "./HomePage.css";

const HomePage = () => {
  useSEO();
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PromoBannerCarousel />
      <VetRecommendedSection />
      <PetTravelBand />
      <VetNetworkSection />
      <PetCareTipsSection />
      <StatsSection />
      <FeaturedProductSection />
      <FaqSection />
      <FinalCtaStrip />
      <EngagementSection />
    </>
  );
};

export default HomePage;
