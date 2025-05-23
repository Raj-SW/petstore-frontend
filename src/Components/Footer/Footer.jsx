import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { IconContext } from "react-icons";

import "./Footer.css";
import "./Footer2.css";
import qrCode from "../../assets/Decoratives/QRCode.png";
import googlePlayStoreImg from "../../assets/Decoratives/googleplay1.png";
import appStoreImg from "../../assets/Decoratives/app-store.png";

const Footer = () => {
  return (
    <>
      <div className="footerWrapper">
        <Container className="footerContainer d-flex flex-column">
          <Row className="registerSection d-flex flex-row justify-content-around align-items-center p-4 mt-5 rounded-4 ml-1 mr-1">
            <h3 className="text-wrap text-white caveat-Heading subscribe-heading">
              Register Now So You Don't Miss Our Programs
            </h3>
            <Row className="d-flex subscribeInputContainer flex-rowp-2 rounded-3 gap-2 justify-content-around p-2">
              <input
                type="email"
                name="emailInput"
                id=""
                className="emailInput rounded-2"
              />
              <Button className="subscribeButton" variant="primary">
                Subscribe Now
              </Button>
            </Row>
          </Row>
          <Row className="footerContentSection mt-5 d-flex flex-wrap justify-content-center justify-content-lg-between primary-color-font">
            <div className="footerContents d-flex gap-5 fs-6 flex-wrap justify-content-center">
              <Col className="fs-6">
                <h5 className="fs-6">Shopping Categories</h5>
                <ul>
                  <li>Dog</li>
                  <li>Cats</li>
                  <li>Small Pets</li>
                  <li>Birds</li>
                </ul>
              </Col>
              <Col className="fs-6">
                <h5 className="fs-6">Shopping Categories</h5>
                <ul>
                  <li>Dog</li>
                  <li>Cats</li>
                  <li>Small Pets</li>
                  <li>Birds</li>
                </ul>
              </Col>
              <Col className="fs-6">
                <h5 className="fs-6">Shopping Categories</h5>
                <ul>
                  <li>Dog</li>
                  <li>Cats</li>
                  <li>Small Pets</li>
                  <li>Birds</li>
                </ul>
              </Col>
              <Col className="fs-6">
                <h5 className="fs-6">Shopping Categories</h5>
                <ul>
                  <li>Dog</li>
                  <li>Cats</li>
                  <li>Small Pets</li>
                  <li>Birds</li>
                </ul>
              </Col>
            </div>
            <Col className="linksWrapper d-flex flex-column gap-4 mt-4 mt-lg-0 justify-content-center align-items-center align-items-lg-end">
              <div className="d-flex gap-4">
                <IconContext.Provider value={{ size: "1.5rem" }}>
                  <FaFacebook />
                  <IoLogoWhatsapp />
                  <FaInstagram />
                  <FaYoutube />
                </IconContext.Provider>
              </div>
              <Row className="downloadLinksWrapper d-flex justify-content-center justify-content-lg-end">
                <Col className="qrWrapper d-flex justify-content-center justify-content-lg-end">
                  <img src={qrCode} alt="QR Code" />
                </Col>
                <Col className="storeContainer d-flex flex-column gap-2 align-items-center align-items-lg-end">
                  <img src={appStoreImg} alt="App Store" />
                  <img src={googlePlayStoreImg} alt="Google Play Store" />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="footerBrandSection mt-4 d-flex justify-content-between align-items-center p-3 border-top flex-column flex-md-row text-center text-md-start secondary-color-font">
            <div className="text-muted rightsReserved">
              © 2022 VitalPaws. All rights reserved.
            </div>
            <h5 className="footerBrandName m-0 font-italic">VitalPaws</h5>
            <div className="d-flex gap-3 footerTermsOfService justify-content-center justify-content-md-end">
              <a href="#" className="text-dark text-decoration-none">
                Terms of Service
              </a>
              <a href="#" className="text-dark text-decoration-none">
                Privacy Policy
              </a>
            </div>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Footer;
