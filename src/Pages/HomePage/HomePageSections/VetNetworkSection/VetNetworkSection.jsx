import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { FaPaw, FaStar, FaArrowRight } from "react-icons/fa";
import SkeletonCard from "../../../../Components/HelperComponents/SkeletonCard/SkeletonCard";
import professionalsApi from "../../../../Services/api/professionalsApi";
import "./VetNetworkSection.css";

const ease = [0.25, 0.46, 0.45, 0.94];

const ROLE_LABELS = {
  veterinarian: "Veterinarian",
  groomer: "Groomer",
  trainer: "Trainer",
  petTaxi: "Pet Taxi",
};

// API responses are sometimes flattened (pro.specialization) and sometimes
// nested (pro.professionalInfo.specialization) — normalize both shapes.
const info = (pro) => ({
  specialization: pro.specialization ?? pro.professionalInfo?.specialization ?? "",
  rating: pro.rating ?? pro.professionalInfo?.rating ?? 0,
  experience: pro.experience ?? pro.professionalInfo?.experience ?? null,
});

const initials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

const AUTO_ADVANCE_MS = 6000;

const VetNetworkSection = () => {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  // Auto-advance stops permanently once the user picks an avatar, and pauses
  // while hovering — user intent always wins over the carousel timer.
  const [userTookControl, setUserTookControl] = useState(false);
  const [hovering, setHovering] = useState(false);

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    professionalsApi
      .getProfessionals({ limit: 4, sortBy: "professionalInfo.rating", sortOrder: "desc" })
      .then((res) => setProfessionals(res?.data ?? []))
      .catch((err) => console.error("Error fetching professionals:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (reducedMotion || userTookControl || hovering || professionals.length < 2) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % professionals.length),
      AUTO_ADVANCE_MS,
    );
    return () => clearInterval(id);
  }, [reducedMotion, userTookControl, hovering, professionals.length]);

  if (!loading && professionals.length === 0) return null;

  const pro = professionals[active];
  const meta = pro ? info(pro) : null;
  const firstName = pro?.name?.split(" ")[0] ?? "";

  return (
    <section className="vn-section">
      <motion.div
        ref={headerRef}
        className="vn-header"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="vn-deco" aria-hidden="true">
          <span className="vn-deco-line" />
          <FaPaw className="vn-deco-paw" />
          <span className="vn-deco-line" />
        </div>
        <h2 className="vn-title">Meet Our Veterinary Network</h2>
      </motion.div>

      {loading ? (
        <div className="vn-skeleton"><SkeletonCard variant="card" count={1} /></div>
      ) : (
        <motion.div
          className="vn-stage"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="vn-spotlight">
            <AnimatePresence mode="wait">
              <motion.div
                key={`portrait-${active}`}
                className="vn-portrait"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.35, ease }}
              >
                {pro.profileImage?.url ? (
                  <img src={pro.profileImage.url} alt={pro.name} loading={active === 0 ? undefined : "lazy"} />
                ) : (
                  <span className="vn-monogram" aria-hidden="true">{initials(pro.name)}</span>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`bio-${active}`}
                className="vn-bio"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.35, delay: 0.05, ease }}
              >
                <p className="vn-eyebrow" data-testid="vn-eyebrow">
                  {ROLE_LABELS[pro.role] || "Professional"}
                  {meta.rating > 0 && (
                    <span className="vn-rating">
                      {" · "}<FaStar aria-hidden="true" /> {meta.rating.toFixed(1)}
                    </span>
                  )}
                </p>
                <h3 className="vn-name">{pro.name}</h3>
                <p className="vn-spec">
                  {meta.specialization}
                  {meta.experience != null && ` · ${meta.experience} yrs experience`}
                </p>
                <div className="vn-actions">
                  <motion.button
                    type="button"
                    className="vn-book-btn"
                    onClick={() => navigate(`/appointments/professional/${pro._id || pro.id}`)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Book with {firstName}
                  </motion.button>
                  <button
                    type="button"
                    className="vn-all-link"
                    onClick={() => navigate("/appointments")}
                  >
                    View all professionals <FaArrowRight size={11} aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {professionals.length > 1 && (
            <div className="vn-rail" role="group" aria-label="Choose a professional">
              {professionals.map((p, i) => (
                <button
                  key={p._id || p.id}
                  type="button"
                  className={`vn-avatar${i === active ? " vn-avatar--active" : ""}`}
                  aria-label={p.name}
                  aria-pressed={i === active}
                  onClick={() => { setActive(i); setUserTookControl(true); }}
                >
                  {p.profileImage?.url ? (
                    <img src={p.profileImage.url} alt="" loading="lazy" />
                  ) : (
                    <span aria-hidden="true">{initials(p.name)}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
};

export default VetNetworkSection;
