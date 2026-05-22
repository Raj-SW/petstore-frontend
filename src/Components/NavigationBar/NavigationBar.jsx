import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FaUserCircle,
  FaUser,
  FaSignInAlt,
  FaTachometerAlt,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import vitalPawsLogo from "../../assets/NavBar Assets/Vital-paws-logo.png";
import pawsImg from "../../assets/NavBar Assets/Paws.png";
import { useAuth } from "../../context/AuthContext";
import AddToCart from "./AddToCart";
import SignUpDropdown from "./Dropdowns/SignUpDropdown";
import "./NavigationBar.css";

// Routes that exist in the app router
const NAV_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Services", href: "/services" },
  { label: "Pet Store", href: "/petshop" },
  { label: "Pet Care Tips", href: null },
  { label: "Gallery", href: null },
  { label: "Contact", href: null },
];

const NavigationBar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) mobileMenuRef.current.focus();
  }, [mobileMenuOpen]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("mobile-menu-overlay"))
      setMobileMenuOpen(false);
  };

  const isActive = (href) => {
    if (!href) return false;
    if (href === "/home") return location.pathname === "/" || location.pathname === "/home";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <nav className="vitalpaws-nav sticky-top">
        <div className="nav-inner">
          {/* Logo */}
          <a href="/home" className="nav-brand">
            <img src={vitalPawsLogo} alt="VitalPaws" className="nav-logo-img" />
            <div className="nav-brand-text">
              <span className="nav-brand-name">
                <span className="nav-brand-vital">Vital</span>
                <span className="nav-brand-paws">Paws</span>
              </span>
              <span className="nav-brand-sub">VETERINARY CARE</span>
            </div>
          </a>

          {/* Decorative paws — large desktop only */}
          <img
            src={pawsImg}
            alt=""
            className="nav-paws d-none d-xl-block"
            aria-hidden="true"
          />

          {/* Desktop nav links */}
          <ul className="nav-links d-none d-lg-flex">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    className={`nav-link-item${isActive(href) ? " active" : ""}`}
                  >
                    {label}
                  </a>
                ) : (
                  <span className="nav-link-item nav-link-disabled">{label}</span>
                )}
              </li>
            ))}
          </ul>

          {/* Right-side actions */}
          <div className="nav-actions">
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="nav-user-btn">
                  <FaUserCircle size={24} />
                  <span className="nav-user-name d-none d-lg-inline">
                    {user.name}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/profile">
                    <FaUser className="me-2" /> Profile
                  </Dropdown.Item>
                  {isAdmin() && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item href="/admin">
                        <FaTachometerAlt className="me-2" /> Admin Dashboard
                      </Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="text-danger">
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

            <AddToCart />

            {/* Mobile hamburger */}
            <button
              className="nav-hamburger d-lg-none"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <FaBars size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      <div
        className={`mobile-menu-overlay${mobileMenuOpen ? " open" : ""}`}
        onClick={handleOverlayClick}
        aria-hidden={!mobileMenuOpen}
      >
        <nav
          className={`mobile-slide-menu${mobileMenuOpen ? " open" : ""}`}
          ref={mobileMenuRef}
          tabIndex={mobileMenuOpen ? 0 : -1}
          aria-label="Mobile navigation"
        >
          <div className="mobile-menu-header">
            <div className="d-flex align-items-center gap-2">
              <FaUserCircle size={24} className="mobile-user-icon" />
              <span className="mobile-user-greeting">
                {user ? `Hi, ${user.name}` : "Welcome!"}
              </span>
            </div>
            <button
              className="mobile-menu-close-btn"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="mobile-menu-content">
            {NAV_LINKS.map(({ label, href }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  className={`mobile-menu-link${isActive(href) ? " active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ) : (
                <span key={label} className="mobile-menu-link mobile-link-disabled">
                  {label}
                </span>
              )
            )}

            <div className="mobile-menu-divider" />

            {user ? (
              <>
                <a
                  href="/profile"
                  className="mobile-menu-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUser className="me-2" /> Profile
                </a>
                {isAdmin() && (
                  <a
                    href="/admin"
                    className="mobile-menu-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaTachometerAlt className="me-2" /> Admin Dashboard
                  </a>
                )}
                <a
                  href="#"
                  className="mobile-menu-link logout-link"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <FaSignInAlt className="me-2" /> Logout
                </a>
              </>
            ) : (
              <a
                href="#"
                className="mobile-menu-link"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  setShowLogin(true);
                }}
              >
                <FaSignInAlt className="me-2" /> Login
              </a>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavigationBar;
