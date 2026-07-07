import "./HeroSection.css";
import { FaHome, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
// Re-encoded as WebP — originals were PNGs at small display dimensions
// (553x370 / 661x370) but 264KB/547KB, a poor format choice for this content.
import heroLeftBg from "../../../assets/HeroSectionAssets/Hero-Image-left-background.webp";
import heroRight from "../../../assets/HeroSectionAssets/hero-image-right.webp";
import vitalPawsLogo from "../../../assets/HeroSectionAssets/VitalPaws Logo.png";

const FEATURES = [
  { label: "Evening Clinic", sub: "Perfect for busy owners" },
  { label: "Weekend Care", sub: "We're open Saturdays" },
  { label: "Home Visits", sub: "At your doorstep" },
  { label: "Pet Relocation", sub: "Safe & stress-free" },
];

const HeroSection = () => (
  <section className="hero-section">
    {/* Background layers */}
    <img src={heroLeftBg} alt="" className="hero-bg-img hero-bg-left" aria-hidden="true" />
    <img src={heroRight} alt="" className="hero-bg-img hero-bg-right" aria-hidden="true" fetchpriority="high" />

    {/* Gradient fade — right image bleeds into center */}
    <div className="hero-right-fade" aria-hidden="true" />

    {/* Content overlay */}
    <div className="hero-overlay">
      {/* Logo sits over the left background */}
      <div className="hero-logo-col">
        <img src={vitalPawsLogo} alt="VitalPaws" className="hero-logo-badge" />
      </div>

      {/* Center text */}
      <div className="hero-content">
        <p className="hero-because">Because</p>
        <h1 className="hero-headline">
          <span className="hero-headline-dark">They Can't Speak…</span>
          <br />
          <span className="hero-headline-gold">We Listen.</span>
        </h1>
        <p className="hero-body">
          Compassionate veterinary care in Piton
          <br />
          for the pets you love the most.
        </p>

        <div className="hero-features">
          {FEATURES.map((f) => (
            <div key={f.label} className="hero-feature-item">
              <FaHome className="hero-feature-icon" />
              <div>
                <p className="hero-feature-label">{f.label}</p>
                <p className="hero-feature-sub">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="hero-buttons">
          <a href="https://wa.me/" className="hero-btn hero-btn-primary">
            <FaWhatsapp size={22} className="me-2" />
            Book On WhatsApp
          </a>
          <a
            href="https://maps.app.goo.gl/YQRTJz6vFe3K9Z6UA"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn hero-btn-outline"
          >
            <FaMapMarkerAlt size={20} className="me-2" />
            Find Us
          </a>
        </div>
      </div>

      {/* Transparent spacer — right bg shows through */}
      <div className="hero-right-col" />
    </div>
  </section>
);

export default HeroSection;
