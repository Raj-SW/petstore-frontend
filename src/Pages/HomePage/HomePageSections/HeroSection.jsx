import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import { FaHome, FaStethoscope, FaTruck, FaShoppingBag } from "react-icons/fa";
// Re-encoded as WebP — originals were PNGs at small display dimensions
// (553x370 / 661x370) but 264KB/547KB, a poor format choice for this content.
import heroLeftBg from "../../../assets/HeroSectionAssets/Hero-Image-left-background.webp";
import heroRight from "../../../assets/HeroSectionAssets/hero-image-right.webp";
import vitalPawsLogo from "../../../assets/HeroSectionAssets/VitalPaws Logo.png";
import AppointmentModal from "../../../Components/AppointmentModal/AppointmentModal";

const FEATURES = [
  { label: "Evening Clinic", sub: "Perfect for busy owners" },
  { label: "Weekend Care", sub: "We're open Saturdays" },
  { label: "Home Visits", sub: "At your doorstep" },
  { label: "Pet Relocation", sub: "Safe & stress-free" },
];

const CONSULTATION_HOURS = ["Mon, Wed, Thu, Sat: 4:30 PM – 6:00 PM"];

const HeroSection = () => {
  const navigate = useNavigate();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [mobileVetOpen, setMobileVetOpen] = useState(false);

  return (
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

          <div className="hero-buttons">
            <button type="button" className="hero-btn hero-btn-primary" onClick={() => setBookingOpen(true)}>
              <FaStethoscope size={18} className="me-2" />
              Book Appointment
            </button>
            <button type="button" className="hero-btn hero-btn-outline" onClick={() => setMobileVetOpen(true)}>
              <FaTruck size={18} className="me-2" />
              Mobile Vet
            </button>
            <button type="button" className="hero-btn hero-btn-outline" onClick={() => navigate("/import-export-service")}>
              <FaHome size={18} className="me-2" />
              Pet Travel
            </button>
            <button type="button" className="hero-btn hero-btn-outline" onClick={() => navigate("/petshop")}>
              <FaShoppingBag size={18} className="me-2" />
              Shop
            </button>
          </div>

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
        </div>

        {/* Transparent spacer — right bg shows through */}
        <div className="hero-right-col" />
      </div>

      <AppointmentModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        title="Book an Appointment"
        description="We're here for you and your pet."
        hours={CONSULTATION_HOURS}
        waMessage="Hi, I'd like to book a vet appointment."
      />
      <AppointmentModal
        open={mobileVetOpen}
        onClose={() => setMobileVetOpen(false)}
        title="Book a Mobile Vet Visit"
        description="Our vet comes to you. Tell us your location and pet details."
        waMessage="Hi, I'd like to book a mobile vet visit."
        primaryLabel="Book via WhatsApp"
      />
    </section>
  );
};

export default HeroSection;
