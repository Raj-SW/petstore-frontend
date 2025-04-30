import React from "react";
import "./HeroSection.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col } from "react-bootstrap";

//assets import
import animalBannerHolder from "../../../assets/BannerSliderAssets/animalBannerHolder.png";
import CarouselComponent from "./Carousels/CarouselComponent";
import petClinicIcon from "../../../assets/HeroSectionAssets/veterinaryImgIcon.png";
import petGroomingIconImg from "../../../assets/HeroSectionAssets/groomingImgIcon.png";
import petHotelIconImg from "../../../assets/HeroSectionAssets/petHotelImgIcon.png";
import petTrainingIconImg from "../../../assets/HeroSectionAssets/petTrainingImgIcon.png";
import catDogWoman from "../../../assets/HeroSectionAssets/cat-dog-woman.png";
import googleapplogo from "../../../assets/Decoratives/google-play-logo.png";
import appstorelogo from "../../../assets/Decoratives/app-store-logo.png";

// react icons
import { BiLogoPlayStore } from "react-icons/bi";
import { IoLogoAppleAppstore } from "react-icons/io5";
import { IconContext } from "react-icons";
import { MdQrCode2 } from "react-icons/md";

const HeroSection = () => {
  return (
    <>
      <div className="background-image-container hero-wrapper ">
        <div className="animal-banner-carousel">
          <img
            src={animalBannerHolder}
            alt=""
            className="animal-on-banner-image"
          />
          <CarouselComponent />
        </div>
        <h3 className="caveat-Heading hero-section-message text-center mt-5">
          Welcome to PetShop
        </h3>
        <Row
          className="d-flex w-100
        "
        >
          <Col className="cat-banner-container">
            <img src={catDogWoman} alt="" className="" />
          </Col>

          <Col className="info-wrapper align-content-center p-0">
            <div className="quick-links-wrapper w-100 d-flex text-center">
              <div className="quick-link-item text-center">
                <a href="" className="quicklink">
                  <img src={petClinicIcon} alt="Pet Clinic" />
                  <p className="poppins-regular fs-6">Pet Clinic</p>
                </a>
              </div>
              <div className="quick-link-item text-center">
                <a href="" className="quicklink">
                  <img src={petGroomingIconImg} alt="Pet Grooming" />
                  <p className="poppins-regular fs-6">Pet Grooming</p>
                </a>
              </div>
              <div className="quick-link-item text-center justify-center">
                <a href="" className="quicklink ">
                  <img src={petHotelIconImg} alt="Pet Hotel" />
                  <p className="poppins-regular fs-6">Pet Hotel</p>
                </a>
              </div>
              <div className="quick-link-item text-center">
                <a href="" className="quicklink">
                  <img src={petTrainingIconImg} alt="Pet Training" />
                  <p className="poppins-regular fs-9">Pet Training</p>
                </a>
              </div>
            </div>
            <div className=" p-3 text-left">
              <p className="poppins-regular fs-6">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam
                dicta facilis, iusto assumenda quaerat dolor in eius quis
                recusandae minus explicabo atque suscipit rem commodi?
                Consequatur amet fugiat neque modi? Reiciendis iste nam
                accusamus rerum ipsum, delectus veritatis quibusdam dignissimos
                aliquam nesciunt amet reprehenderit eum commodi exercitationem
                ipsa id. Dolore, ex error eligendi maxime nesciunt laborum.
              </p>
            </div>
            <div className="app-links-wrapper d-flex flex-wrap align-items-center justify-between p-4">
              <div>
                <p className="m-0 p-0 caveat-Heading fs-1 ">Download the App</p>
              </div>
              <div className="app-links-icon-container gap-5 ">
                <div>
                  <img
                    className="on-hover-pointer"
                    src={googleapplogo}
                    alt=""
                  />
                </div>
                <div>
                  <img src={appstorelogo} alt="" className="on-hover-pointer" />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default HeroSection;
