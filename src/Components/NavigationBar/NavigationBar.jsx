import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaUserCircle,
  FaUser,
  FaSignInAlt,
  FaTachometerAlt,
  FaTimes,
  FaBars,
  FaChevronDown,
} from "react-icons/fa";
import vitalPawsLogo from "../../assets/NavBar Assets/Vital-paws-logo.png";
import pawsImg from "../../assets/NavBar Assets/Paws.png";
import { useAuth } from "../../context/AuthContext";
import AddToCart from "./AddToCart";
import SignUpDropdown from "./Dropdowns/SignUpDropdown";
import "./NavigationBar.css";

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
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Esc closes mobile + user menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (userMenuOpen) setUserMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen, userMenuOpen]);

  // Click-outside closes user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  // Focus mobile menu when opened
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) mobileMenuRef.current.focus();
  }, [mobileMenuOpen]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("mobile-menu-overlay")) setMobileMenuOpen(false);
  };

  const isActive = (href) => {
    if (!href) return false;
    if (href === "/home") return location.pathname === "/" || location.pathname === "/home";
    return location.pathname.startsWith(href);
  };

  const handleNav = (href) => (e) => {
    e.preventDefault();
    navigate(href);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <>
      <nav className="vitalpaws-nav">
        <div className="nav-inner">
          {/* Logo */}
          <a href="/home" onClick={handleNav("/home")} className="nav-brand">
            <img src={vitalPawsLogo} alt="VitalPaws" className="nav-logo-img" />
            <div className="nav-brand-text">
              <span className="nav-brand-name">
                <span className="nav-brand-vital">Vital</span>
                <span className="nav-brand-paws">Paws</span>
              </span>
              <span className="nav-brand-sub">VETERINARY CARE</span>
            </div>
          </a>

          {/* Decorative paws — desktop only */}
          <img src={pawsImg} alt="" className="nav-paws" aria-hidden="true" />

          {/* Desktop nav links */}
          <ul className="nav-links">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    onClick={handleNav(href)}
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
              <div className="nav-user-wrap" ref={userMenuRef}>
                <button
                  className="nav-user-btn"
                  onClick={() => setUserMenuOpen((s) => !s)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <FaUserCircle size={22} />
                  <span className="nav-user-name">{user.name}</span>
                  <FaChevronDown size={11} className={`nav-user-chev${userMenuOpen ? " open" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      role="menu"
                      className="nav-user-menu"
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <a href="/profile" onClick={handleNav("/profile")} className="nav-menu-item">
                        <FaUser size={14} />
                        <span>Profile</span>
                      </a>
                      {isAdmin() && (
                        <>
                          <div className="nav-menu-divider" />
                          <a href="/admin" onClick={handleNav("/admin")} className="nav-menu-item">
                            <FaTachometerAlt size={14} />
                            <span>Admin Dashboard</span>
                          </a>
                        </>
                      )}
                      <div className="nav-menu-divider" />
                      <button
                        type="button"
                        className="nav-menu-item nav-menu-item--danger"
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                      >
                        <FaSignInAlt size={14} />
                        <span>Log out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <SignUpDropdown showLogin={showLogin} setShowLogin={setShowLogin} />
            )}

            <AddToCart />

            {/* Mobile hamburger */}
            <button
              className="nav-hamburger"
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
            <div className="mobile-menu-greeting-row">
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
                  onClick={handleNav(href)}
                >
                  {label}
                </a>
              ) : (
                <span key={label} className="mobile-menu-link mobile-link-disabled">{label}</span>
              )
            )}

            <div className="mobile-menu-divider" />

            {user ? (
              <>
                <a href="/profile" className="mobile-menu-link" onClick={handleNav("/profile")}>
                  <FaUser size={14} /><span>Profile</span>
                </a>
                {isAdmin() && (
                  <a href="/admin" className="mobile-menu-link" onClick={handleNav("/admin")}>
                    <FaTachometerAlt size={14} /><span>Admin Dashboard</span>
                  </a>
                )}
                <button
                  type="button"
                  className="mobile-menu-link logout-link"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                >
                  <FaSignInAlt size={14} /><span>Logout</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="mobile-menu-link"
                onClick={() => { setMobileMenuOpen(false); setShowLogin(true); }}
              >
                <FaSignInAlt size={14} /><span>Login</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavigationBar;
