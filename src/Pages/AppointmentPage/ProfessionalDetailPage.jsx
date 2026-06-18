import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiArrowLeft, FiAward, FiClock, FiCheckCircle } from "react-icons/fi";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import professionalsApi from "../../Services/api/professionalsApi";
import "./ProfessionalDetailPage.css";

const ROLE_LABELS = {
  veterinarian: "Veterinarian", groomer: "Groomer", trainer: "Trainer", petTaxi: "Pet Taxi",
};

const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Pro")}&background=74B49B&color=fff&size=256`;

const ProfessionalDetailPage = () => {
  const { id } = useParams();
  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    professionalsApi
      .getProfessionalById(id)
      .then((data) => { if (active) setPro(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="pd-page"><div className="pd-loading">Loading…</div></div>;
  }

  if (error || !pro) {
    return (
      <div className="pd-page">
        <div className="pd-notfound">
          <h1>Professional not found</h1>
          <p>We couldn’t load this profile.</p>
          <Link to="/appointments" className="pd-back-link"><FiArrowLeft /> Back to professionals</Link>
        </div>
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[pro.role] || "Professional";
  const specialty = pro.specialization
    || (Array.isArray(pro.specialties) ? pro.specialties.join(", ") : "");
  const qualifications = pro.qualifications || [];
  const services = pro.services || [];

  return (
    <div className="pd-page">
      <div className="pd-crumb">
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Appointments", path: "/appointments" },
            { label: pro.name, path: null },
          ]}
        />
      </div>

      <motion.div
        className="pd-grid"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Left — identity + contact */}
        <aside className="pd-aside">
          <img src={pro.image || avatarUrl(pro.name)} alt={pro.name} className="pd-avatar" />
          <span className="pd-role">{roleLabel}</span>
          <h1 className="pd-name">{pro.name}</h1>
          {specialty && <p className="pd-specialty">{specialty}</p>}
          {pro.experience != null && (
            <p className="pd-experience"><FiClock /> {pro.experience} years experience</p>
          )}

          <div className="pd-contact">
            {pro.email && <a className="pd-contact-line" href={`mailto:${pro.email}`}><FiMail /> {pro.email}</a>}
            {pro.phone && <a className="pd-contact-line" href={`tel:${pro.phone}`}><FiPhone /> {pro.phone}</a>}
            <Link to="/contact" className="pd-cta">Get in touch</Link>
          </div>
        </aside>

        {/* Right — details */}
        <div className="pd-main">
          {pro.bio && (
            <section className="pd-section">
              <h2 className="pd-section-title">About</h2>
              <p className="pd-bio">{pro.bio}</p>
            </section>
          )}

          {qualifications.length > 0 && (
            <section className="pd-section">
              <h2 className="pd-section-title"><FiAward /> Qualifications</h2>
              <ul className="pd-quals">
                {qualifications.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </section>
          )}

          {services.length > 0 && (
            <section className="pd-section">
              <h2 className="pd-section-title">Services</h2>
              <div className="pd-services">
                {services.map((s, i) => (
                  <div key={i} className="pd-service">
                    <p className="pd-service-name"><FiCheckCircle /> {s.name}</p>
                    {s.description && <p className="pd-service-desc">{s.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {pro.availability && (
            <section className="pd-section">
              <h2 className="pd-section-title"><FiClock /> Availability</h2>
              <p className="pd-availability">
                {typeof pro.availability === "string" ? pro.availability : JSON.stringify(pro.availability)}
              </p>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfessionalDetailPage;
