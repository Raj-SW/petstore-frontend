import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io5";
import { FiSend, FiMapPin, FiPhone } from "react-icons/fi";
import contactApi from "../../Services/api/contactApi";
import advertsApi from "../../Services/api/advertsApi";
import { useToast } from "../../context/ToastContext";
import GoogleMap, { CLINIC_LOCATION } from "../../Components/Common/GoogleMap";
import PageHero from "../../Components/HelperComponents/PageHero/PageHero";
import heroImg from "../../assets/ServicePageAssets/catKiss.webp";
import useSEO from "../../hooks/useSEO";
import "./Contact.css";

// Same targets as the footer — keep in sync.
const SOCIALS = [
  { label: "WhatsApp", href: "https://wa.me/23057580480", Icon: IoLogoWhatsapp },
  { label: "Facebook", href: "https://www.facebook.com/share/1BUiS7SRxh/?mibextid=wwXIfr", Icon: FaFacebook },
  { label: "Instagram", href: "https://www.instagram.com/vitalpawsmru", Icon: FaInstagram },
  { label: "TikTok", href: "https://www.tiktok.com/@vitalpawsmru", Icon: FaTiktok },
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
      <span className="ct-promo-pill">{ad?.title?.match(/\d+%/u) ? ad.title : "Get 50% Discount"}</span>
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
  useSEO("Contact Us", "Get in touch with VitalPaws. Find us in Piton, Mauritius or send us a message online.");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [promoAds, setPromoAds] = useState([]);
  const { addToast } = useToast();

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
      <PageHero
        compact
        image={heroImg}
        title="Contact Us"
        subtitle="We'd love to"
        script="hear from you"
        tagline="Find us in Piton, reach us on WhatsApp, or send a message — we're here for you and your pet."
      >
        <Link to="/appointments" className="ph-btn-primary">Find a Professional</Link>
        <Link to="/petshop" className="ph-btn-outline">Get Started</Link>
      </PageHero>

      {/* Connect section */}
      <section className="ct-connect">
        <div className="ct-connect-inner">
          <div className="ct-form-col">
            <h2 className="ct-connect-title">Connecting You with Care for Your Beloved Pets</h2>
            <p className="ct-connect-sub">We&apos;re here to answer your questions and provide support.</p>

            <form className="ct-form" onSubmit={handleSubmit}>
              <label className="ct-label" htmlFor="ct-name">Your Name</label>
              <input id="ct-name" className="ct-input" type="text" value={form.name} onChange={set("name")} placeholder="Your name" maxLength={100} />

              <label className="ct-label" htmlFor="ct-email">Your Email Address</label>
              <input id="ct-email" className="ct-input" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />

              <label className="ct-label" htmlFor="ct-message">Message</label>
              <textarea id="ct-message" className="ct-input ct-textarea" rows={5} value={form.message} onChange={set("message")} placeholder="How can we help?" maxLength={2000} />

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
