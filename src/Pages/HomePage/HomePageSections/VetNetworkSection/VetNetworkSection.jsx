import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { FaUserMd, FaCut, FaCar } from "react-icons/fa";
import ProfessionalCard from "../../../../Components/HelperComponents/ProfessionalCard/ProfessionalCard";
import SkeletonCard from "../../../../Components/HelperComponents/SkeletonCard/SkeletonCard";
import professionalsApi from "../../../../Services/api/professionalsApi";
import "./VetNetworkSection.css";

const ROLE_BADGES = {
  veterinarian: { icon: <FaUserMd />, label: "Veterinarian" },
  groomer: { icon: <FaCut />, label: "Groomer" },
  trainer: { icon: <FaUserMd />, label: "Trainer" },
  petTaxi: { icon: <FaCar />, label: "Pet Taxi" },
};

const VetNetworkSection = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    professionalsApi
      .getProfessionals({ limit: 4, sortBy: "professionalInfo.rating", sortOrder: "desc" })
      .then((res) => setProfessionals(res?.data ?? []))
      .catch((err) => console.error("Error fetching professionals:", err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && professionals.length === 0) return null;

  return (
    <section className="vn-section">
      <motion.div
        ref={headerRef}
        className="vn-header"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className="vn-title">Meet Our Veterinary Network</h2>
      </motion.div>

      <div className="vn-grid">
        {loading ? (
          <SkeletonCard variant="card" count={4} />
        ) : (
          professionals.map((pro) => {
            const badge = ROLE_BADGES[pro.role] || {};
            return (
              <ProfessionalCard
                key={pro._id || pro.id}
                name={pro.name}
                specialty={pro.specialization}
                image={pro.profileImage?.url}
                badgeIcon={badge.icon}
                badgeLabel={badge.label}
                onBook={() => navigate(`/appointments/professional/${pro._id || pro.id}`)}
              />
            );
          })
        )}
      </div>
    </section>
  );
};

export default VetNetworkSection;
