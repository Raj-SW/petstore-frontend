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
  FaThLarge,
  FaStethoscope,
  FaPlane,
} from "react-icons/fa";
import vitalPawsLogo from "../../assets/NavBar Assets/Vital-paws-logo.png";
import pawsImg from "../../assets/NavBar Assets/Paws.png";
import { useAuth } from "../../context/AuthContext";
import AddToCart from "./AddToCart";
import SignUpDropdown from "./Dropdowns/SignUpDropdown";
import CurrencySelector from "../HelperComponents/CurrencySelector/CurrencySelector";
import ServicesDropdown from "./Dropdowns/ServicesDropdown";
import "./NavigationBar.css";

const SERVICES_PATHS = ["/services", "/appointments", "/import-export-service"];

const isPathActive = (pathname, href) => {
  if (!href) return false;
  if (href === "/home") return pathname === "/" || pathname === "/home";
  return pathname.startsWith(href);
};

const isServicesPathActive = (pathname) =>
  SERVICES_PATHS.some((p) => pathname.startsWith(p));

const MOBILE_SERVICE_ITEMS = [
  { label: "All Services", href: "/services", icon: FaThLarge },
  { label: "Find a Professional", href: "/appointments", icon: FaStethoscope },
  { label: "Import & Export", href: "/import-export-service", icon: FaPlane },
];

const NAV_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Services", href: "/services", hasDropdown: true },
  { label: "Pet Store", href: "/petshop" },
  { label: "Pet Care Tips", href: "/pet-care-tips" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const NavigationBar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const servicesWrapRef = useRef(null);

  // Esc closes all menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
        setServicesOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click-outside closes user menu + services dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (servicesOpen && servicesWrapRef.current && !servicesWrapRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen, servicesOpen]);

  // Focus mobile menu when opened
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) mobileMenuRef.current.focus();
  }, [mobileMenuOpen]);

  // Close mobile services accordion when menu closes
  useEffect(() => {
    if (!mobileMenuOpen) setMobileServicesOpen(false);
  }, [mobileMenuOpen]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("mobile-menu-overlay")) setMobileMenuOpen(false);
  };

  const isActive = (href) => isPathActive(location.pathname, href);
  const isServicesActive = () => isServicesPathActive(location.pathname);

  const handleNav = (href) => (e) => {
    e.preventDefault();
    navigate(href);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setServicesOpen(false);
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
            {NAV_LINKS.map(({ label, href, hasDropdown }) => {
              let linkElement;
              if (hasDropdown) {
                linkElement = (
                  <div className="nav-services-trigger-wrap" ref={servicesWrapRef}>
                    <button
                      type="button"
                      className={`nav-link-item nav-services-trigger${isServicesActive() ? " active" : ""}`}
                      onClick={() => setServicesOpen((s) => !s)}
                      aria-expanded={servicesOpen}
                      aria-haspopup="menu"
                    >
                      {label}
                      <FaChevronDown
                        size={10}
                        className={`nav-services-chev${servicesOpen ? " open" : ""}`}
                      />
                    </button>
                    <ServicesDropdown
                      open={servicesOpen}
                      onClose={() => setServicesOpen(false)}
                    />
                  </div>
                );
              } else if (href) {
                linkElement = (
                  <a
                    href={href}
                    onClick={handleNav(href)}
                    className={`nav-link-item${isActive(href) ? " active" : ""}`}
                  >
                    {label}
                  </a>
                );
              } else {
                linkElement = <span className="nav-link-item nav-link-disabled">{label}</span>;
              }
              return (
                <li key={label} className={hasDropdown ? "nav-link-services-wrap" : ""}>
                  {linkElement}
                </li>
              );
            })}
          </ul>

          {/* Right-side actions */}
          <div className="nav-actions">
            {/* Desktop-only: currency + account (hidden < 992px; moved into the drawer on mobile) */}
            <div className="nav-actions-desktop">
            <CurrencySelector />
            {user ? (
              <div className="nav-user-wrap" ref={userMenuRef}>
                <button
                  className="nav-user-btn"
                  onClick={() => setUserMenuOpen((s) => !s)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  {user?.profileImage?.url ? (
                    <img
                      src={user.profileImage.url}
                      alt=""
                      className="nav-avatar-img"
                    />
                  ) : (
                    <FaUserCircle size={22} />
                  )}
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
                      <a href="/my-orders" onClick={handleNav("/my-orders")} className="nav-menu-item">
                        <span style={{ fontSize: "14px" }}>📦</span>
                        <span>My Orders</span>
                      </a>
                      <a href="/my-subscriptions" onClick={handleNav("/my-subscriptions")} className="nav-menu-item">
                        <span style={{ fontSize: "14px" }}>🔁</span>
                        <span>My Subscriptions</span>
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
            </div>

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

      {/* Mobile slide-in menu — the overlay is just a click-to-close backdrop;
          it must not be a <button> since it wraps a <nav> containing several
          real buttons/links (invalid to nest interactive elements). */}
      <div
        className={`mobile-menu-overlay${mobileMenuOpen ? " open" : ""}`}
        onClick={handleOverlayClick}
        aria-hidden={!mobileMenuOpen}
      >
        <nav
          className={`mobile-slide-menu${mobileMenuOpen ? " open" : ""}`}
          ref={mobileMenuRef}
          tabIndex={-1}
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
            {/* Currency (desktop shows it in the top bar; on mobile it lives here) */}
            <div className="mobile-currency-wrap">
              <CurrencySelector />
            </div>

            {/* Home */}
            <a
              href="/home"
              className={`mobile-menu-link${isActive("/home") ? " active" : ""}`}
              onClick={handleNav("/home")}
            >
              Home
            </a>

            {/* Services accordion */}
            <div className="mobile-services-group">
              <button
                type="button"
                className={`mobile-menu-link mobile-services-trigger${isServicesActive() ? " active" : ""}`}
                onClick={() => setMobileServicesOpen((s) => !s)}
                aria-expanded={mobileServicesOpen}
              >
                <span>Services</span>
                <FaChevronDown
                  size={12}
                  className={`mobile-services-chev${mobileServicesOpen ? " open" : ""}`}
                />
              </button>

              <AnimatePresence>
                {mobileServicesOpen && (
                  <motion.div
                    className="mobile-services-sub"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {MOBILE_SERVICE_ITEMS.map(({ label, href, icon: Icon }) => (
                      <a
                        key={href}
                        href={href}
                        className={`mobile-sub-link${location.pathname.startsWith(href) ? " active" : ""}`}
                        onClick={handleNav(href)}
                      >
                        <Icon size={13} className="mobile-sub-icon" />
                        {label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pet Store */}
            <a
              href="/petshop"
              className={`mobile-menu-link${isActive("/petshop") ? " active" : ""}`}
              onClick={handleNav("/petshop")}
            >
              Pet Store
            </a>

            {/* Pet Care Tips */}
            <a
              href="/pet-care-tips"
              className={`mobile-menu-link${isActive("/pet-care-tips") ? " active" : ""}`}
              onClick={handleNav("/pet-care-tips")}
            >
              Pet Care Tips
            </a>

            {/* Gallery */}
            <a
              href="/gallery"
              className={`mobile-menu-link${isActive("/gallery") ? " active" : ""}`}
              onClick={handleNav("/gallery")}
            >
              Gallery
            </a>

            {/* About */}
            <a
              href="/about"
              className={`mobile-menu-link${isActive("/about") ? " active" : ""}`}
              onClick={handleNav("/about")}
            >
              About
            </a>

            {/* Contact */}
            <a
              href="/contact"
              className={`mobile-menu-link${isActive("/contact") ? " active" : ""}`}
              onClick={handleNav("/contact")}
            >
              Contact
            </a>

            <div className="mobile-menu-divider" />

            {user ? (
              <>
                <a href="/profile" className="mobile-menu-link" onClick={handleNav("/profile")}>
                  <FaUser size={14} /><span>Profile</span>
                </a>
                <a href="/my-orders" className="mobile-menu-link" onClick={handleNav("/my-orders")}>
                  <span style={{ fontSize: "14px" }}>📦</span><span>My Orders</span>
                </a>
                <a href="/my-subscriptions" className="mobile-menu-link" onClick={handleNav("/my-subscriptions")}>
                  <span style={{ fontSize: "14px" }}>🔁</span><span>My Subscriptions</span>
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
