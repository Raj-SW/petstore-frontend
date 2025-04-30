import React from "react";
import "./ServicesSection.css";
import { Container } from "react-bootstrap";
import imgGrooming from "../../../assets/ServicesCardAssets/serviceImg1.png";
import imgVeterinary from "../../../assets/ServicesCardAssets/serviceImg2.png";
import imgBoarding from "../../../assets/ServicesCardAssets/serviceImg3.png";
import imgTraining from "../../../assets/ServicesCardAssets/serviceImg4.png";
import imgAdoption from "../../../assets/ServicesCardAssets/serviceImg5.png";
import starImg from "../../../assets/Decoratives/star1.png";

const ServicesSection = () => {
  return (
    <>
      <div className="services-header">
        <h1 className="caveat-Heading">Our Curated Services</h1>
        <img src={starImg} alt="" />
      </div>

      <Container className="ServicesContainer ">
        <div className="groomingCard image-overlay-container">
          <img
            src={imgGrooming}
            alt=""
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
          />
          <div className="overlay ">
            <h3 className="caveat-Heading fs-1 text-white">Adoption</h3>
            <p className="text-wrap text-white poppins-medium fs-6">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
              commodi totam facilis cumque quam saepe temporibus,
            </p>
            <button className="poppins-medium text-white">View More</button>{" "}
          </div>
        </div>
        <div className="boardingCard image-overlay-container">
          <img
            src={imgBoarding}
            alt=""
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
          />
          <div className="overlay ">
            <h3 className="caveat-Heading fs-1 text-white">Adoption</h3>
            <p className="text-wrap text-white poppins-medium">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
              commodi totam facilis cumque quam saepe temporibus,
            </p>
            <button className="poppins-medium text-white">View More</button>{" "}
          </div>
        </div>

        <div className="veterinaryCard image-overlay-container">
          <img
            src={imgVeterinary}
            alt=""
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
          />
          <div className="overlay ">
            <h3 className="caveat-Heading fs-1 text-white">Adoption</h3>
            <p className="text-wrap text-white poppins-medium">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
              commodi totam facilis cumque quam saepe temporibus,
            </p>
            <button className="poppins-medium text-white">View More</button>{" "}
          </div>
        </div>
        <div className="trainingCard image-overlay-container">
          <img
            src={imgTraining}
            alt=""
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
          />
          <div className="overlay ">
            <h3 className="caveat-Heading fs-1 text-white">Adoption</h3>
            <p className="text-wrap text-white poppins-medium">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
              commodi totam facilis cumque quam saepe temporibus,
            </p>
            <button className="poppins-medium text-white">View More</button>{" "}
          </div>
        </div>
        <div className="adoptionCard image-overlay-container">
          <img
            src={imgAdoption}
            alt=""
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
          />
          <div className="overlay">
            <h3 className="caveat-Heading fs-1 text-white">Adoption</h3>
            <p className="text-wrap text-white poppins-medium">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error
              commodi totam facilis cumque quam saepe temporibus,
            </p>
            <button className="poppins-medium text-white">View More</button>
          </div>
        </div>
      </Container>
    </>
  );
};

export default ServicesSection;
