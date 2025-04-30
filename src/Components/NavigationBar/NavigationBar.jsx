import { Container, Accordion, Row, Col } from "react-bootstrap";
import React, { useState, useRef } from "react";
import Navbar from "react-bootstrap/Navbar";
import AddToCart from "./AddToCart";
import SnackBar from "./SnackBar";
import CardDropDown from "./Dropdowns/CardDropdown";
import SignUpDropdown from "./Dropdowns/SignUpDropdown";

import pawsImg from "../../assets/NavigationBarAssets/Logo/paws.png";
import vitalPawsLogo from "../../assets/NavigationBarAssets/Logo/vitalPawsLogo.png";
import "./NavigationBar.css";

const NavigationBar = () => {
  return (
    <>
      <SnackBar />
      <Navbar
        collapseOnSelect
        expand="lg"
        className="sticky-top"
        style={{ backgroundColor: "var(--pale-green-color)" }}
      >
        <Container fluid>
          <Navbar.Toggle
            aria-controls="responsive-navbar-nav"
            color="white"
            className="toggle-custom"
          />
          <div href="#home" className="d-flex align-items-center brand">
            <a href="/home">
              <img
                src={vitalPawsLogo}
                alt="Cat Logo"
                style={{
                  height: "53px",
                  borderRadius: "50%",
                }}
                className=" vitalPawsLogo"
              />
            </a>
            <a href="/home">
              <div className="brand-Name pl-1 pr-1 ">
                <div className="m-0 p-1">
                  <p className="caveat-Heading fs-3">Vital</p>
                </div>
                <div className="m-0 p-1 ">
                  <p className="caveat-Heading fs-4">Paws</p>
                </div>
              </div>
            </a>
            <div className="paws-img-container">
              <img src={pawsImg} alt="" className="pawsImg" />
            </div>
          </div>
          {/* mobile add to cart and login */}
          <div className="d-flex d-lg-none align-items-center">
            <SignUpDropdown />
            <AddToCart itemCount={3} />
          </div>
          <div className="ms-auto d-flex d-none d-md-flex d-card-dropdown">
            <CardDropDown />
            <SignUpDropdown />
            <AddToCart itemCount={3} />
          </div>
        </Container>

        <div className=" w-100 d-block d-lg-none mobile-header">
          <Navbar.Collapse id="responsive-navbar-nav ">
            <div className="">
              <Accordion className="bg-transparent text-white">
                <Accordion.Item
                  eventKey="0"
                  className="bg-transparent text-white"
                >
                  <Accordion.Header className="bg-transparent text-white border-0 poppins-medium">
                    Services
                  </Accordion.Header>
                  <Accordion.Body className="bg-transparent text-white d-flex flex-column poppins-light">
                    <a>Vet Care</a>
                    <a>Wellness Tracker</a>
                    <a>Pet Transport</a>
                    <a>Grooming</a>
                    <a>Boarding</a>
                    <a>Training Centre</a>
                    <a>Pet Relocation</a>
                  </Accordion.Body>
                  <hr className="bg-white my-2" />
                </Accordion.Item>
                <Accordion.Item
                  eventKey="1"
                  className="bg-transparent text-white"
                >
                  <Accordion.Header className="bg-transparent text-white border-0 poppins-medium">
                    Insurance
                  </Accordion.Header>
                  <Accordion.Body className="bg-transparent text-white d-flex flex-column poppins-light">
                    <a>Dogs</a>
                    <a>Cats</a>
                    <a>Fish</a>
                  </Accordion.Body>
                  <hr className="bg-white my-2" />
                </Accordion.Item>
                <Accordion.Item
                  eventKey="2"
                  className="bg-transparent text-white"
                >
                  <Accordion.Header className="bg-transparent text-white border-0 poppins-medium">
                    Pet Boutique
                  </Accordion.Header>
                  <Accordion.Body className="bg-transparent text-white d-flex flex-column poppins-light">
                    <a>Dogs</a>
                    <a>Cats</a>
                    <a>Fish</a>
                  </Accordion.Body>
                  <hr className="bg-white my-2" />
                </Accordion.Item>
                <Accordion.Item
                  eventKey="3"
                  className="bg-transparent text-white"
                >
                  <Accordion.Header className="bg-transparent text-white border-0 poppins-medium">
                    Community
                  </Accordion.Header>
                  <Accordion.Body className="bg-transparent text-white d-flex flex-column poppins-light">
                    <a>Dogs</a>
                    <a>Cats</a>
                    <a>Fish</a>
                  </Accordion.Body>
                  <hr className="bg-white my-2" />
                </Accordion.Item>
                <Accordion.Item
                  eventKey="4"
                  className="bg-transparent text-white"
                >
                  <Accordion.Header className="bg-transparent text-white border-0 poppins-medium">
                    Membership
                  </Accordion.Header>
                  <Accordion.Body className="bg-transparent text-white d-flex flex-column poppins-light">
                    <a>Dogs</a>
                    <a>Cats</a>
                    <a>Fish</a>
                  </Accordion.Body>
                  <hr className="bg-white my-2" />
                </Accordion.Item>
              </Accordion>
            </div>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </>
  );
};

export default NavigationBar;
