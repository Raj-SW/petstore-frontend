import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPaw, FaFacebook, FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import { FiSend, FiMapPin, FiPhone } from "react-icons/fi";
import contactApi from "../../Services/api/contactApi";
import advertsApi from "../../Services/api/advertsApi";
import { useToast } from "../../context/ToastContext";
import GoogleMap, { CLINIC_LOCATION } from "../../Components/Common/GoogleMap";
import "./Contact.css";

// Same targets as the footer — keep in sync.
const SOCIALS = [
  { label: "WhatsApp", href: "https://wa.me/23057580480", Icon: IoLogoWhatsapp },
  { label: "Facebook", href: "https://www.facebook.com/share/1BUiS7SRxh/?mibextid=wwXIfr", Icon: FaFacebook },
  { label: "Instagram", href: "https://www.instagram.com/vitalpawsmru", Icon: FaInstagram },
  { label: "TikTok", href: "https://www.tiktok.com/@vitalpawsmru", Icon: FaTiktok },
];

const SHOWCASE = [
  "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600",
  "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=700",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600",
];

const PromoCard = ({ adverts }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (adverts.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % adverts.length), 5000);
    return () => clearInterval(id);
  }, [adverts.length]);

  // Fallback static card when no promo adverts are configured.
  const ad = adverts[i];
  const content = (
    <div
      className="ct-promo"
      style={ad?.image ? { backgroundImage: `url(${ad.image})` } : undefined}
    >
      <span className="ct-promo-pill">{ad?.title?.match(/\d+%/) ? ad.title : "Get 50% Discount"}</span>
      <div className="ct-promo-overlay">
        <h3>{ad?.title || "Celebrate the Joy of Christmas with Your Pets!"}</h3>
        <p>This holiday season, let's make it special for every member of the family — including your furry friends!</p>
        {adverts.length > 1 && (
          <div className="ct-promo-dots">
            {adverts.map((a, idx) => (
              <span key={a._id} className={`ct-dot${idx === i ? " on" : ""}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (ad?.link) {
    const external = ad.link.startsWith("http");
    return (
      <a href={ad.link} target={external ? "_blank" : undefined} rel="noopener noreferrer" className="ct-promo-link">
        {content}
      </a>
    );
  }
  return content;
};

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [promoAds, setPromoAds] = useState([]);
  const { addToast } = useToast();
  const headerRef = useRef(null);

  useEffect(() => {
    advertsApi
      .getAdverts("promo")
      .then((r) => setPromoAds(r.data || []))
      .catch(() => setPromoAds([]));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      addToast("Please fill in your name, email and message", "error");
      return;
    }
    try {
      setSending(true);
      await contactApi.submitContact(form);
      addToast("Message sent! We'll get back to you shortly.", "success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ct-page">
      {/* Hero */}
      <header className="ct-hero" ref={headerRef}>
        <motion.span className="ct-tag" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          #1 Pet care in Mauritius
        </motion.span>
        <motion.h1 className="ct-hero-title" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
          Compassionate Care,<br />Dedicated to Your Pet's Wellness
        </motion.h1>
        <motion.p className="ct-hero-sub" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}>
          Discover our mission, values, and unwavering commitment to providing exceptional veterinary care for your cherished companions.
        </motion.p>
        <motion.div className="ct-hero-actions" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }}>
          <Link to="/appointments" className="ct-btn ct-btn-primary">Find a Professional</Link>
          <Link to="/petshop" className="ct-btn ct-btn-ghost">Get Started</Link>
        </motion.div>
        <FaPaw className="ct-hero-paw" aria-hidden="true" />

        {/* Showcase blobs */}
        <div className="ct-showcase">
          {SHOWCASE.map((src, idx) => (
            <motion.div
              key={src}
              className={`ct-blob ct-blob-${idx}`}
              style={{ backgroundImage: `url(${src})` }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.08 }}
            />
          ))}
        </div>
        <svg className="ct-squiggle" viewBox="0 0 160 20" fill="none" aria-hidden="true">
          <path d="M2 10 Q 20 0, 40 10 T 80 10 T 120 10 T 158 10" stroke="#E8943A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </header>

      {/* Connect section */}
      <section className="ct-connect">
        <div className="ct-connect-inner">
          <div className="ct-form-col">
            <h2 className="ct-connect-title">Connecting You with Care for Your Beloved Pets</h2>
            <p className="ct-connect-sub">We're here to answer your questions and provide support.</p>

            <form className="ct-form" onSubmit={handleSubmit}>
              <label className="ct-label">Your Name</label>
              <input className="ct-input" type="text" value={form.name} onChange={set("name")} placeholder="Your name" maxLength={100} />

              <label className="ct-label">Your Email Address</label>
              <input className="ct-input" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />

              <label className="ct-label">Message</label>
              <textarea className="ct-input ct-textarea" rows={5} value={form.message} onChange={set("message")} placeholder="How can we help?" maxLength={2000} />

              <button type="submit" className="ct-submit" disabled={sending}>
                <FiSend size={15} /> {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>

          <div className="ct-promo-col">
            <PromoCard adverts={promoAds} />
          </div>
        </div>
      </section>

      {/* Map + address */}
      <section className="ct-map-section">
        <div className="ct-map-inner">
          <div className="ct-address">
            <h2 className="ct-connect-title">Visit Us</h2>
            <p className="ct-addr-line"><FiMapPin size={15} /> Vitalpaws Veterinary Clinic, Mauritius</p>
            <a className="ct-addr-line ct-addr-link" href="tel:+23057580480">
              <FiPhone size={15} /> +230 5758 0480
            </a>

            <div className="ct-socials">
              <span className="ct-socials-label">Follow us</span>
              <div className="ct-socials-row">
                {SOCIALS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ct-social"
                    aria-label={label}
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="ct-map-wrap">
            <GoogleMap query={CLINIC_LOCATION} height="340px" title="VitalPaws location" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
