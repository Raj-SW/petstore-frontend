import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useSEO from "../../hooks/useSEO";
import {
  FaPaw,
  FaPhoneAlt,
  FaCheck,
  FaUserMd,
  FaCar,
} from "react-icons/fa";
import PageHero from "../../Components/HelperComponents/PageHero/PageHero";
import heroImg from "../../assets/ServicePageAssets/dogHug.webp";
import "./AboutPage.css";

/* ── Animation helpers ── */
const FadeInWhenVisible = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
};

/* ── First-aid numbered card ── */
const FirstAidCard = ({ number, title, desc }) => (
  <div className="about-fa-card">
    <div className="about-fa-number">{number}</div>
    <div className="about-fa-body">
      <h4 className="about-fa-title">{title}</h4>
      <p className="about-fa-desc">{desc}</p>
    </div>
  </div>
);

/* ── Alternating care row ── */
const CareRow = ({ reverse, icon: Icon, image, heading, body, meta, checks, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const navigate = useNavigate();

  return (
    <motion.div
      ref={ref}
      className={`about-care-row${reverse ? " about-care-row--reverse" : ""}`}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="about-care-img-placeholder">
        <img src={image} alt={heading} className="about-care-img" loading="lazy" />
        <span className="about-care-img-badge" aria-hidden="true"><Icon /></span>
      </div>
      <div className="about-care-text">
        <h3 className="about-care-heading">{heading}</h3>
        <p className="about-care-body">{body}</p>
        <p className="about-care-meta">{meta}</p>
        <ul className="about-care-checklist">
          {checks.map((item) => (
            <li key={item}>
              <FaCheck className="about-check-icon" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <motion.button
          type="button"
          className="about-btn-primary"
          onClick={() => navigate("/appointments")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Schedule a Visit
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ── Data ── */

const FIRST_AID_ITEMS = [
  {
    number: 1,
    title: "Control Bleeding",
    desc: "Apply firm, gentle pressure with a clean cloth. Elevate the limb if possible and keep your pet calm while seeking immediate veterinary help.",
  },
  {
    number: 2,
    title: "Perform CPR",
    desc: "Place your pet on their side, extend the neck, and deliver 30 chest compressions followed by 2 rescue breaths. Repeat until help arrives.",
  },
  {
    number: 3,
    title: "Handle Choking",
    desc: "Look in the mouth carefully. For small pets, hold them upside-down and give 5 gentle back blows. For larger pets, use a modified Heimlich — always follow up with a vet visit.",
  },
  {
    number: 4,
    title: "Stabilize Broken Bones",
    desc: "Do not attempt to reset the bone. Muzzle your pet gently to prevent biting from pain, create a makeshift stretcher, and transport them immediately.",
  },
];

const SERVICE_STRIP = [
  "Supplies",
  "Grooming",
  "Veterinary Support",
  "Pet Adoption",
  "Boarding",
  "Pet Daycare",
  "Pet Training",
];

const CARE_ROWS = [
  {
    icon: FaPhoneAlt,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=720&h=640&fit=crop",
    heading: "24/7 Emergency Hotline",
    body: "When your pet needs urgent care at 2 AM, our emergency line connects you directly to a qualified vet. No waiting, no hold music — real help, real fast.",
    meta: "Response within 5 minutes",
    checks: [
      "Immediate triage over the phone",
      "Dispatch of on-call vet if needed",
      "Follow-up care coordination",
    ],
  },
  {
    icon: FaUserMd,
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=720&h=640&fit=crop",
    heading: "Expert Veterinary Team",
    body: "Our certified vets bring decades of combined experience across small animals, exotic pets, and emergency medicine. Every consultation is thorough and compassionate.",
    meta: "60 min / session",
    checks: [
      "Wellness checks & vaccinations",
      "Diagnostics & blood work",
      "Surgical & post-op support",
    ],
  },
  {
    icon: FaCar,
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=720&h=640&fit=crop",
    heading: "Home Visits & Pet Taxi",
    body: "Can't make it to the clinic? We come to you. Our trained pet-handling drivers offer safe, GPS-tracked door-to-door transport for appointments, grooming, and more.",
    meta: "Available island-wide in Mauritius",
    checks: [
      "Insured, climate-controlled vehicles",
      "In-home vet consultations",
      "Flexible same-day booking",
    ],
  },
];

/* ── Main Page ── */

const AboutPage = () => {
  useSEO("About Us", "Learn about VitalPaws — our mission, team, and commitment to compassionate pet care in Mauritius.");
  const navigate = useNavigate();

  return (
    <div className="about-page">

      {/* ═══════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════ */}
      <PageHero
        image={heroImg}
        title="About Us"
        subtitle="Always ready, with"
        script="compassionate care"
        tagline="VitalPaws is Mauritius's all-in-one pet care destination — from routine wellness visits to 24-hour emergencies, we're here for you and the animals you love most."
      >
        <motion.button
          type="button"
          className="ph-btn-primary"
          onClick={() => navigate("/appointments")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Find a Professional
        </motion.button>
        <motion.button
          type="button"
          className="ph-btn-outline"
          onClick={() => navigate("/services")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Our Services
        </motion.button>
      </PageHero>

      {/* ═══════════════════════════════════════
          2. SERVICE STRIP
      ═══════════════════════════════════════ */}
      <div className="about-service-strip">
        <div className="about-strip-inner">
          {SERVICE_STRIP.map((label, i) => (
            <span key={label} className="about-strip-chip">
              {label}
              {i < SERVICE_STRIP.length - 1 && (
                <FaPaw className="about-strip-sep" aria-hidden="true" />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          3. FIRST AID / DON'T WORRY SECTION
      ═══════════════════════════════════════ */}
      <section className="about-firstaid">
        <div className="about-firstaid-inner">
          {/* Section image */}
          <FadeInWhenVisible className="about-firstaid-img" delay={0}>
            <div className="about-firstaid-img-block">
              <img
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=760&h=920&fit=crop"
                alt="A happy, well-cared-for dog"
                className="about-firstaid-img-photo"
                loading="lazy"
              />
            </div>
          </FadeInWhenVisible>

          {/* Text + cards */}
          <FadeInWhenVisible className="about-firstaid-content" delay={0.12}>
            <h2 className="about-firstaid-heading">
              From now on, don&apos;t worry if your pet needs urgent help.
            </h2>
            <p className="about-firstaid-sub">
              We&apos;ve got you covered — 24 hours a day, seven days a week.
              And if you ever need to act fast, here are the four key steps to know.
            </p>
            <div className="about-fa-grid">
              {FIRST_AID_ITEMS.map((item) => (
                <FirstAidCard key={item.number} {...item} />
              ))}
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. EMERGENCY BANNER
      ═══════════════════════════════════════ */}
      <section className="about-emergency-banner">
        <FadeInWhenVisible className="about-emergency-inner">
          <div className="about-emergency-phone-chip" aria-hidden="true">
            <FaPhoneAlt />
          </div>
          <p className="about-emergency-label">
            Our emergency contact, 24 hours a day
          </p>
          <p className="about-emergency-hotline">
            Hotline: +230 5758 0480
          </p>
        </FadeInWhenVisible>
      </section>

      {/* ═══════════════════════════════════════
          5. CARE ROWS
      ═══════════════════════════════════════ */}
      <section className="about-care-section">
        <FadeInWhenVisible className="about-care-section-header">
          <h2 className="about-care-section-title">
            Quick, Reliable, and Compassionate Care<br />
            <span className="about-care-section-title--accent">
              When Your Pet Needs It Most
            </span>
          </h2>
        </FadeInWhenVisible>

        <div className="about-care-rows">
          {CARE_ROWS.map((row, i) => (
            <CareRow
              key={row.heading}
              {...row}
              reverse={i % 2 === 1}
              delay={0.05}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. CTA BAND
      ═══════════════════════════════════════ */}
      <section className="about-cta-band">
        <div className="about-cta-paw-deco" aria-hidden="true">
          <FaPaw />
        </div>
        <motion.div
          className="about-cta-inner"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="about-cta-heading">
            Your Pet&apos;s Happiness,<br />
            <span className="about-cta-heading--gold">Our Priority.</span>
          </h2>
          <p className="about-cta-tagline">
            Everything your pet needs, all in one place.
          </p>
          <p className="about-cta-sub">
            Join thousands of Mauritian pet owners who trust VitalPaws every day
            for care, supplies, and peace of mind.
          </p>
          <motion.button
            type="button"
            className="about-btn-gold"
            onClick={() => navigate("/services")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </section>

    </div>
  );
};

export default AboutPage;
