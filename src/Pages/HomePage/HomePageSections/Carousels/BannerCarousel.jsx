import React from "react";
import { Carousel, Image } from "react-bootstrap";
import "./BannerCarousel.css";

// Desktop Images
import FelixDesktop from "../../../../assets/BannerSliderAssets/Desktop/Felix_homepage_banner_Desktop.webp";
import HillsDesktop from "../../../../assets/BannerSliderAssets/Desktop/Hills_homepage_banner_Desktop.webp";
import HuntlandDesktop from "../../../../assets/BannerSliderAssets/Desktop/Huntland_Homepage_Banners_Desktop.webp";
import NMDesktop from "../../../../assets/BannerSliderAssets/Desktop/NM_homepage_banner_Desktop.webp";
import RCDesktop from "../../../../assets/BannerSliderAssets/Desktop/RC_homepage_banner_Desktop.webp";
import VitalinDesktop from "../../../../assets/BannerSliderAssets/Desktop/Vitalin_homepage_banner_Desktop.webp";

// Tablet Images
import FelixTablet from "../../../../assets/BannerSliderAssets/Tablet/Felix_homepage_banner_Tablet.webp";
import HillsTablet from "../../../../assets/BannerSliderAssets/Tablet/Hills_homepage_banner_Tablet.webp";
import NMTablet from "../../../../assets/BannerSliderAssets/Tablet/NM_homepage_banner_Tablet.webp";
import RCTablet from "../../../../assets/BannerSliderAssets/Tablet/RC_homepage_banner_Tablet.webp";
import VitalinTablet from "../../../../assets/BannerSliderAssets/Tablet/Vitalin_homepage_banner_Tablet.webp";

// Mobile Images
import FelixMobile from "../../../../assets/BannerSliderAssets/Mobile/Felix_homepage_banner_Mobile.webp";
import HillsMobile from "../../../../assets/BannerSliderAssets/Mobile/Hills_homepage_banner_Mobile.webp";
import HuntlandMobile from "../../../../assets/BannerSliderAssets/Mobile/Huntland_Homepage_Banners_Mobile.webp";
import NMMobile from "../../../../assets/BannerSliderAssets/Mobile/NM_homepage_banner_Mobile.webp";
import RCMobile from "../../../../assets/BannerSliderAssets/Mobile/RC_homepage_banner_Mobile.webp";
import VitalinMobile from "../../../../assets/BannerSliderAssets/Mobile/Vitalin_homepage_banner_Mobile.webp";

const BannerCarousel = ({ deviceType }) => {
  // Desktop image paths
  const imagePathsDeskTop = [
    FelixDesktop,
    HillsDesktop,
    HuntlandDesktop,
    NMDesktop,
    RCDesktop,
    VitalinDesktop,
  ];

  // Tablet image paths
  const imagePathsTablet = [
    FelixTablet,
    HillsTablet,
    NMTablet,
    RCTablet,
    VitalinTablet,
  ];

  // Mobile image paths
  const imagePathsMobile = [
    FelixMobile,
    HillsMobile,
    HuntlandMobile,
    NMMobile,
    RCMobile,
    VitalinMobile,
  ];

  // Select the correct image paths based on the device type
  let imagePaths;
  switch (deviceType) {
    case "tablet":
      imagePaths = imagePathsTablet;
      break;
    case "mobile":
      imagePaths = imagePathsMobile;
      break;
    case "desktop":
    default:
      imagePaths = imagePathsDeskTop;
  }

  return (
    <Carousel
      controls={true} // Show navigation controls
      indicators={false} // Show slide position indicators
      interval={5000} // Set interval to 2 seconds
      pause="hover" // Pause when hovered
      keyboard={true} // Enable keyboard navigation
      wrap={true} // Allow continuous cycling
      variant="dark" // Use dark controls and indicators
      prevLabel="Previous"
      nextLabel="Next"
      className="h-1"
    >
      {imagePaths.map((image, index) => (
        <Carousel.Item key={index} className="">
          <Image
            src={image}
            className="d-block w-100 "
            alt={`Slide ${index + 1}`}
            fluid
            style={{ height: "10rem" }}
          />
          <Carousel.Caption></Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default BannerCarousel;
