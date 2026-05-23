import { useState } from "react";
import { FaFacebook, FaInstagram, FaYoutube, FaPaw } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import pawImg from "../../assets/Decoratives/paw.png";
import "./Footer.css";

const LINKS = [
  {
    heading: "Shop",
    items: [
      { label: "Dogs",       href: "/petshop?category=dog" },
      { label: "Cats",       href: "/petshop?category=cat" },
      { label: "Fish",       href: "/petshop?category=fish" },
      { label: "Small Pets", href: "/petshop?category=general" },
      { label: "New Arrivals", href: "/petshop" },
    ],
  },
  {
    heading: "Services",
    items: [
      { label: "Veterinary Care", href: "/appointments" },
      { label: "Grooming",        href: "/appointments" },
      { label: "Boarding",        href: "/appointments" },
      { label: "Pet Training",    href: "/appointments" },
      { label: "Adoption",        href: "/services" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About Us",  href: "/about" },
      { label: "Our Team",  href: "/about" },
      { label: "Blog",      href: "/" },
      { label: "Careers",   href: "/" },
      { label: "Community", href: "/" },
    ],
  },
  {
    heading: "Support",
    items: [
      { label: "Contact Us",       href: "/" },
      { label: "FAQ",              href: "/" },
      { label: "Terms of Service", href: "/" },
      { label: "Privacy Policy",   href: "/" },
      { label: "Refund Policy",    href: "/" },
    ],
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <footer className="ft-root">
      <div className="ft-container">

        {/* ── Top: brand + links ── */}
        <div className="ft-top">
          {/* Brand col */}
          <div className="ft-brand-col">
            <div className="ft-brand">
              <FaPaw className="ft-brand-paw" />
              <span className="ft-brand-name">VitalPaws</span>
            </div>
            <p className="ft-tagline">
              Where every pet gets the love and care they deserve.
            </p>

            {/* Newsletter */}
            <form className="ft-subscribe" onSubmit={handleSubscribe}>
              <p className="ft-subscribe-label">Stay updated — join our newsletter</p>
              <div className="ft-subscribe-row">
                <input
                  type="email"
                  className="ft-subscribe-input"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="ft-subscribe-btn" type="submit">
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          {/* Link columns */}
          <div className="ft-links">
            {LINKS.map(({ heading, items }) => (
              <div key={heading} className="ft-link-col">
                <h5 className="ft-link-heading">{heading}</h5>
                <ul className="ft-link-list">
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="ft-link">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="ft-bottom">
          <span className="ft-copy">© 2024 VitalPaws. All rights reserved.</span>

          <div className="ft-legal">
            <a href="/" className="ft-legal-link">Terms of Service</a>
            <a href="/" className="ft-legal-link">Privacy Policy</a>
          </div>

          <div className="ft-socials">
            <a href="#" aria-label="Facebook"  className="ft-social-btn"><FaFacebook  size={18} /></a>
            <a href="#" aria-label="WhatsApp"  className="ft-social-btn"><IoLogoWhatsapp size={18} /></a>
            <a href="#" aria-label="Instagram" className="ft-social-btn"><FaInstagram size={18} /></a>
            <a href="#" aria-label="YouTube"   className="ft-social-btn"><FaYoutube   size={18} /></a>
          </div>
        </div>
      </div>

      {/* Decorative paw */}
      <img src={pawImg} alt="" className="ft-deco-paw" aria-hidden="true" />
    </footer>
  );
};

export default Footer;
