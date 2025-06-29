import "bootstrap/dist/css/bootstrap.min.css";
import FeaturedProductSection from "./HomePageSections/FeaturedProductSection";
import HeroSection from "./HomePageSections/HeroSection";
import ServicesSection from "./HomePageSections/ServicesSection";
import CommunitySection from "./HomePageSections/CommunitySection";
import "./HomePage.css";
const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturedProductSection />
      <CommunitySection />
    </>
  );
};

export default HomePage;
