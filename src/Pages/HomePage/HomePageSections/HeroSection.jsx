import React from "react";
import "./HeroSection.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <>
      <div className="background-image-container hero-wrapper">
        <div className="animal-banner-carousel">
          <img
            src={animalBannerHolder}
            alt=""
            className="animal-on-banner-image"
          />
          <CarouselComponent />
        </div>
        <h3 className="caveat-Heading hero-section-message text-center mt-5">
          Welcome to Vital Paws
        </h3>
        <Row className="d-flex w-100">
          <Col className="cat-banner-container">
            <img src={catDogWoman} alt="" className="" />
          </Col>

          <Col className="info-wrapper align-content-center p-0">
            <motion.div
              className="quick-links-wrapper w-100 d-flex text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="quick-link-item text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <a href="" className="quicklink">
                  <motion.img
                    src={petClinicIcon}
                    alt="Pet Clinic"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <p className="poppins-regular fs-6">Pet Clinic</p>
                </a>
              </motion.div>
              <motion.div
                className="quick-link-item text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <a href="" className="quicklink">
                  <motion.img
                    src={petGroomingIconImg}
                    alt="Pet Grooming"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <p className="poppins-regular fs-6">Pet Grooming</p>
                </a>
              </motion.div>
              <motion.div
                className="quick-link-item text-center justify-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <a href="" className="quicklink">
                  <motion.img
                    src={petHotelIconImg}
                    alt="Pet Hotel"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <p className="poppins-regular fs-6">Pet Hotel</p>
                </a>
              </motion.div>
              <motion.div
                className="quick-link-item text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <a href="" className="quicklink">
                  <motion.img
                    src={petTrainingIconImg}
                    alt="Pet Training"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <p className="poppins-regular fs-6">Pet Training</p>
                </a>
              </motion.div>
            </motion.div>
            <div className="p-3 text-left">
              <p className="poppins-regular fs-6">
                Welcome to Vital Paws, your trusted partner in pet care. We
                offer comprehensive services including veterinary care,
                grooming, boarding, and training. Our team of experienced
                professionals is dedicated to ensuring your pets receive the
                best care possible. Join our community of happy pets and their
                owners today!
              </p>
            </div>
            <motion.div
              className="app-links-wrapper d-flex flex-wrap align-items-center justify-between p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <p className="m-0 p-0 caveat-Heading download-app-text">
                  Download the App
                </p>
              </div>
              <div className="app-links-icon-container gap-5">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img
                    className="on-hover-pointer"
                    src={googleapplogo}
                    alt="Google Play"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img
                    src={appstorelogo}
                    alt="App Store"
                    className="on-hover-pointer"
                  />
                </motion.div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default HeroSection;
