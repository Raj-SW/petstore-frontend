import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { FaUserMd, FaCut, FaCar } from "react-icons/fa";
import ProfessionalCard from "../../../../Components/HelperComponents/ProfessionalCard/ProfessionalCard";
import SkeletonCard from "../../../../Components/HelperComponents/SkeletonCard/SkeletonCard";
import professionalsApi from "../../../../Services/api/professionalsApi";
import "./VetNetworkSection.css";

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

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

      <motion.div
        className="vn-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={gridVariants}
      >
        {loading ? (
          <SkeletonCard variant="card" count={4} />
        ) : (
          professionals.map((pro) => {
            const badge = ROLE_BADGES[pro.role] || {};
            return (
              <motion.div key={pro._id || pro.id} variants={cardVariants}>
                <ProfessionalCard
                  name={pro.name}
                  specialty={pro.specialization}
                  image={pro.profileImage?.url}
                  badgeIcon={badge.icon}
                  badgeLabel={badge.label}
                  onBook={() => navigate(`/appointments/professional/${pro._id || pro.id}`)}
                />
              </motion.div>
            );
          })
        )}
      </motion.div>
    </section>
  );
};

export default VetNetworkSection;
