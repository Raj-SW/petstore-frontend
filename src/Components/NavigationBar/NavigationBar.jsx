import { Container, Accordion, Row, Col } from "react-bootstrap";
import React, { useState, useRef } from "react";
import Navbar from "react-bootstrap/Navbar";
import AddToCart from "./AddToCart";
import SnackBar from "./SnackBar";
import CardDropDown from "./Dropdowns/CardDropdown";
import SignUpDropdown from "./Dropdowns/SignUpDropdown";

import pawsImg from "../../assets/NavigationBarAssets/Logo/paws.png";
import pawsmobileImg from "../../assets/NavigationBarAssets/Logo/pawsMobile.png";
import vitalPawsLogo from "../../assets/NavigationBarAssets/Logo/vitalPawsLogo.png";
import "./NavigationBar.css";

// This is the main navigation bar component for the website
const NavigationBar = () => {
  return (
    <>
      {/* SnackBar component shown at the very top */}
      <SnackBar />

      {/* Main Navigation Bar */}
      <Navbar
        collapseOnSelect // Collapses on mobile when clicking outside
        expand="lg" // Expands on large screens
        className="sticky-top" // Sticks to top while scrolling
        style={{ backgroundColor: "var(--pale-green-color)" }}
        variant="dark" // This changes the hamburger menu color to white
      >
        <Container fluid>
          {/* Hamburger menu button for mobile */}
          <div className="d-flex align-items-center">
            <Navbar.Toggle
              aria-controls="responsive-navbar-nav"
              className="toggle-custom"
              style={{
                border: "none",
                padding: "0.5rem 1rem",
                margin: "0.5rem",
                transform: "scale(1.2)",
                outline: "none",
                boxShadow: "none",
              }}
            >
              <span
                className="navbar-toggler-icon"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 1)' stroke-linecap='round' stroke-width='4' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`,
                }}
              />
            </Navbar.Toggle>

            {/* Brand Logo Section */}
            <div href="#home" className="d-flex align-items-center brand">
              {/* Logo Image */}
              <a href="/home">
                <img
                  src={vitalPawsLogo}
                  alt="Cat Logo"
                  style={{
                    height: "53px",
                    borderRadius: "25%",
                  }}
                  className=" vitalPawsLogo"
                />
              </a>

              {/* Brand Name */}
              <a href="/home">
                <div className="brand-Name pl-1 pr-1 ">
                  <div className="m-0 p-1">
                    <p className="caveat-Heading fs-1">Vital</p>
                  </div>
                  <div className="m-0 p-1 ">
                    <p className="caveat-Heading fs-2">Paws</p>
                  </div>
                </div>
              </a>

              {/* Decorative Paws Image in desktop version */}
              <div className="paws-img-container d-none d-lg-block">
                <img src={pawsImg} alt="" className="pawsImg" />
              </div>

              {/* Decorative Paws Image in mobile version */}
              <div className="paws-mobile-img-container d-block d-lg-none">
                <img src={pawsmobileImg} alt="" className="" />
              </div>
            </div>
          </div>

          {/* Mobile Sign Up Button */}
          <div className="d-flex d-lg-none align-items-center">
            <SignUpDropdown />
          </div>

          {/* Desktop Navigation Items */}
          <div className="ms-auto d-flex d-none d-md-flex d-card-dropdown">
            <CardDropDown /> {/* Card dropdown menu */}
            <SignUpDropdown /> {/* Sign up/Login dropdown */}
            <AddToCart itemCount={3} /> {/* Shopping cart with item count */}
          </div>
        </Container>

        {/* Mobile Navigation Menu */}
        <div className=" w-100 d-block d-lg-none mobile-header">
          <Navbar.Collapse id="responsive-navbar-nav ">
            <div className="">
              {/* Accordion Menu for Mobile Navigation */}
              <Accordion className="bg-transparent text-white">
                {/* Services Section */}
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

                {/* Pet Boutique Section */}
                <Accordion.Item
                  eventKey="1"
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

                {/* Community Section */}
                <Accordion.Item
                  eventKey="2"
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
              </Accordion>
            </div>
          </Navbar.Collapse>
        </div>
      </Navbar>
    </>
  );
};

export default NavigationBar;
