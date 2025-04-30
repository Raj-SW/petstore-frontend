import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import "./CommunitySection.css";
import mobileThumbnailImg from "../../../assets/CommunityAssets/mobileThumbnail4.png";
import pawImg from "../../../assets/Decoratives/fontisto_paw.png";
import googlePlayImg from "../../../assets/Decoratives/googleplay1.png";
import appStoreImg from "../../../assets/Decoratives/app-store.png";

const CommunitySection = () => {
  return (
    <Container className="communitySectionWrapper d-flex flex-column flex-md-row justify-content-center flex-wrap mb-5 p-0">
      <Col md={6} className="CommunityTextWrapper p-5">
        <div>
          <p className="caveat-Heading fs-1 secondary-color-font">
            Join the Comunity <img src={pawImg} alt="paw" />
          </p>
        </div>
        <div className="p-2 poppins-regular">
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quasi ab
            eligendi vero assumenda dolorum nemo atque aliquid facilis tenetur
            rerum! Deserunt, eveniet! Beatae assumenda, deleniti culpa dicta
          </p>
        </div>
        <div className="poppins-medium p-4 fs-5">
          <p>Perks :</p>
          <ul>
            <li>Perk 1</li>
            <li>perk 2</li>
            <li>Perk 3</li>
            <li>Perk 4</li>
          </ul>
        </div>
        <div className="CommunitySectionStoreLinksWrapper">
          <img src={googlePlayImg} alt="Google Play" />
          <img src={appStoreImg} alt="App Store" />
        </div>
      </Col>
      <Col md={6} className="CommunityImageWrapper">
        <img src={mobileThumbnailImg} alt="Mobile Thumbnail" />
      </Col>
    </Container>
  );
};

export default CommunitySection;
