import { useState } from "react";
import { FaFacebook, FaInstagram, FaPaw } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import pawImg from "../../assets/Decoratives/paw.png";
import "./Footer.css";

const SOCIALS = [
  { label: "WhatsApp", href: "https://wa.me/23057580480", Icon: IoLogoWhatsapp },
  { label: "TikTok", href: "https://www.tiktok.com/@vitalpawsmru", Icon: FaTiktok },
  { label: "Facebook", href: "https://www.facebook.com/share/1BUiS7SRxh/?mibextid=wwXIfr", Icon: FaFacebook },
  { label: "Instagram", href: "https://www.instagram.com/vitalpawsmru", Icon: FaInstagram },
];

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
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="ft-social-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative paw */}
      <img src={pawImg} alt="" className="ft-deco-paw" aria-hidden="true" />
    </footer>
  );
};

export default Footer;
