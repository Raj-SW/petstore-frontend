import { Container, Accordion, Row, Col } from "react-bootstrap";
import React, { useState, useRef, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import AddToCart from "./AddToCart";
import { useCart } from "react-use-cart";
import SnackBar from "./SnackBar";
import CardDropDown from "./Dropdowns/CardDropdown";
import SignUpDropdown from "./Dropdowns/SignUpDropdown";
import {
  FaTimes,
  FaPaw,
  FaUserCircle,
  FaShoppingCart,
  FaDog,
  FaCat,
  FaFish,
  FaHome,
  FaUser,
  FaSignInAlt,
  FaStore,
  FaUsers,
  FaPlane,
} from "react-icons/fa";
import pawsImg from "../../assets/NavigationBarAssets/Logo/paws.png";
import pawsmobileImg from "../../assets/NavigationBarAssets/Logo/pawsMobile.png";
import vitalPawsLogo from "../../assets/NavigationBarAssets/Logo/vitalPawsLogo.png";
import { useAuth } from "../../context/AuthContext";
import { Dropdown } from "react-bootstrap";
import "./NavigationBar.css";

// This is the main navigation bar component for the website
const NavigationBar = () => {
  const { items, updateItemQuantity, removeItem, totalItems } = useCart();
  const [showCartModal, setShowCartModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const mobileMenuRef = useRef(null);
  const { user, logout } = useAuth();

  // Accessibility: trap focus in mobile menu
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      mobileMenuRef.current.focus();
    }
  }, [mobileMenuOpen]);

  const handleIncreaseQuantity = (id) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      updateItemQuantity(id, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (id) => {
    const item = items.find((item) => item.id === id);
    if (item && item.quantity > 1) {
      updateItemQuantity(id, item.quantity - 1);
    }
  };

  const handleRemoveItem = (id) => {
    removeItem(id);
  };

  // Overlay click closes menu
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("mobile-menu-overlay")) {
      setMobileMenuOpen(false);
    }
  };

  // Keyboard accessibility: ESC closes menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* SnackBar component shown at the very top */}
      <SnackBar />

      {/* Main Navigation Bar */}
      <Navbar
        collapseOnSelect // Collapses on mobile when clicking outside
        expand="lg" // Expands on large screens
        className="sticky-top nav-bar" // Sticks to top while scrolling
        //style={{ backgroundColor: "var(--secondary-color)" }}
        variant="dark" // This changes the hamburger menu color to white
      >
        <Container fluid>
          {/* Hamburger menu button for mobile */}
          <div className="d-flex align-items-center">
            <button
              className="toggle-custom mobile-hamburger-btn"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                border: "none",
                padding: "0.5rem 1rem",
                margin: "0.5rem",
                background: "none",
                outline: "none",
                boxShadow: "none",
                fontSize: 28,
                color: "#fff",
                display: "block",
              }}
            >
              <FaPaw />
            </button>

            {/* Brand Logo Section */}
            <div href="#home" className="d-flex align-items-center brand">
              {/* Logo Image */}
              <a href="/home">
                <img
                  src={vitalPawsLogo}
                  alt="Cat Logo"
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
            <SignUpDropdown showLogin={showLogin} setShowLogin={setShowLogin} />
          </div>

          {/* Desktop Navigation Items */}
          <div className="ms-auto d-flex d-none d-md-flex d-card-dropdown">
            <CardDropDown /> {/* Card dropdown menu */}
            {user ? (
              <Dropdown align="end" className="ms-3">
                <Dropdown.Toggle
                  variant="link"
                  className="d-flex align-items-center text-white text-decoration-none p-0 border-0"
                  style={{ boxShadow: "none", height: "100%" }}
                >
                  <div className="d-flex align-items-center">
                    <FaUserCircle size={28} className="me-2" />
                    <span className="fw-bold">{user.name}</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/profile">
                    <FaUser className="me-2" /> Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} style={{ color: "#d32f2f" }}>
                    <FaSignInAlt className="me-2" /> Log out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <SignUpDropdown
                showLogin={showLogin}
                setShowLogin={setShowLogin}
              />
            )}
            <AddToCart
              itemCount={totalItems}
              cartItems={items}
              onIncreaseQuantity={handleIncreaseQuantity}
              onDecreaseQuantity={handleDecreaseQuantity}
              onRemoveItem={handleRemoveItem}
              showCartModal={showCartModal}
              setShowCartModal={setShowCartModal}
            />
          </div>
        </Container>
      </Navbar>

      {/* Mobile Fullscreen Slide-in Menu & Overlay */}
      <div
        className={`mobile-menu-overlay${mobileMenuOpen ? " open" : ""}`}
        onClick={handleOverlayClick}
        aria-hidden={!mobileMenuOpen}
        tabIndex={-1}
      >
        <nav
          className={`mobile-slide-menu${mobileMenuOpen ? " open" : ""}`}
          ref={mobileMenuRef}
          tabIndex={mobileMenuOpen ? 0 : -1}
          aria-label="Mobile navigation menu"
        >
          <div className="mobile-menu-header d-flex align-items-center justify-content-between px-3 py-3">
            <div className="d-flex align-items-center gap-2">
              <FaUserCircle size={28} className="mobile-user-icon" />
              <span className="mobile-user-greeting">
                {user ? `Hi, ${user.name}` : "Welcome!"}
              </span>
            </div>
            <button
              className="mobile-menu-close-btn"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaTimes size={24} />
            </button>
          </div>
          <div className="mobile-menu-content px-3">
            <a href="/home" className="mobile-menu-link">
              <FaHome className="me-2" /> Home
            </a>
            <a href="/petshop" className="mobile-menu-link">
              <FaStore className="me-2" /> Pet Shop
            </a>

            <Accordion className="mobile-menu-accordion">
              <Accordion.Item eventKey="0">
                <Accordion.Header className="mobile-menu-link">
                  <FaPaw className="me-2" /> Services
                </Accordion.Header>
                <Accordion.Body className="ps-4">
                  <a href="/services" className="mobile-menu-link d-block mb-2">
                    All Services
                  </a>
                  <a
                    href="/import-export-service"
                    className="mobile-menu-link d-block"
                  >
                    Import/Export
                  </a>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header className="mobile-menu-link">
                  <FaUser className="me-2" /> Appointments
                </Accordion.Header>
                <Accordion.Body className="ps-4">
                  <a
                    href="/appointments/vet"
                    className="mobile-menu-link d-block mb-2"
                  >
                    Vet Appointment
                  </a>
                  <a
                    href="/appointments/groomer"
                    className="mobile-menu-link d-block mb-2"
                  >
                    Groomer Appointment
                  </a>
                  <a
                    href="/appointments/pet-taxi"
                    className="mobile-menu-link d-block"
                  >
                    Pet Taxi
                  </a>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <div
              className="mobile-menu-link coming-soon"
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            >
              <FaUsers className="me-2" /> Community
              <span className="ms-2 badge bg-secondary">Coming Soon</span>
            </div>

            <a href="/profile" className="mobile-menu-link">
              <FaUserCircle className="me-2" /> Profile
            </a>
            <a href="/checkout" className="mobile-menu-link">
              <FaShoppingCart className="me-2" /> Cart ({totalItems})
            </a>
            <div className="mobile-menu-divider my-3"></div>
            <div className="mobile-menu-section-title mb-2">Pet Boutique</div>
            <div className="mobile-menu-boutique d-flex gap-3 mb-3">
              <a href="/petshop?type=dog" className="mobile-menu-boutique-link">
                <FaDog className="me-1" /> Dogs
              </a>
              <a href="/petshop?type=cat" className="mobile-menu-boutique-link">
                <FaCat className="me-1" /> Cats
              </a>
              <a
                href="/petshop?type=fish"
                className="mobile-menu-boutique-link"
              >
                <FaFish className="me-1" /> Fish
              </a>
            </div>
            <div className="mobile-menu-divider my-3"></div>
            <div className="mobile-menu-section-title mb-2">Account</div>
            <div className="mobile-menu-account d-flex gap-3 mb-3">
              <a
                href="/profile"
                className="mobile-menu-account-link"
                tabIndex={!user ? -1 : 0}
                aria-disabled={!user}
                style={!user ? { pointerEvents: "none", opacity: 0.5 } : {}}
              >
                <FaUserCircle className="me-1" /> Profile
              </a>
              {user ? (
                <a
                  href="#"
                  className="mobile-menu-account-link"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  style={{ color: "#d32f2f" }}
                >
                  <FaSignInAlt className="me-1" /> Logout
                </a>
              ) : (
                <a
                  href="#"
                  className="mobile-menu-account-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    setShowLogin(true);
                  }}
                >
                  <FaSignInAlt className="me-1" /> Login
                </a>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavigationBar;
