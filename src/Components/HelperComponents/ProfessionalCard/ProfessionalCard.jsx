import { Card, Button, Badge } from "react-bootstrap";
import {
  FaStar,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserMd,
} from "react-icons/fa";
import { motion } from "framer-motion";
import "./ProfessionalCard.css";

const ProfessionalCard = ({
  name,
  specialty,
  qualifications = [],
  experience,
  rating,
  reviews,
  image,
  phone,
  email,
  location,
  badgeIcon,
  badgeLabel,
  onBook,
}) => {
  // Generate UI Avatar URL as fallback
  const getAvatarUrl = () => {
    const bgColor = "74B49B";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=${bgColor}&color=fff&size=128`;
  };

  return (
    <motion.div
      className="professional-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card>
        <Card.Header className="d-flex align-items-center professional-card-header">
          <div className="professional-avatar">
            {image ? (
              <img
                src={image}
                alt={`${name} avatar`}
                className="avatar-image"
              />
            ) : (
              <img
                src={getAvatarUrl()}
                alt={`${name} avatar`}
                className="avatar-image"
              />
            )}
          </div>
          <div className="ms-3">
            <div className="professional-name mb-1">{name}</div>
          </div>
        </Card.Header>
        <Card.Body className="professional-content">
          <Badge className="specialization-badge mb-2" bg="light">
            {badgeIcon ? (
              badgeIcon
            ) : (
              <FaUserMd className="specialization-icon me-1" />
            )}{" "}
            {badgeLabel || specialty}
          </Badge>
          <div className="professional-qualifications">
            <h4>Qualifications</h4>
            <ul>
              {qualifications.map((qual, index) => (
                <li key={index}>{qual}</li>
              ))}
            </ul>
          </div>
          <div className="professional-experience">
            <span className="experience-years">
              {experience} years experience
            </span>
          </div>
          <div className="professional-rating">
            <div className="stars">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={
                    index < Math.floor(rating) ? "star-filled" : "star-empty"
                  }
                />
              ))}
            </div>
            <span className="rating-text">
              {rating?.toFixed(1)}
              {reviews !== undefined ? ` (${reviews} reviews)` : ""}
            </span>
          </div>
          <div className="professional-contact">
            {phone && (
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                {phone}
              </div>
            )}
            {email && (
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                {email}
              </div>
            )}
            {location && (
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                {location}
              </div>
            )}
          </div>
        </Card.Body>
        <Card.Footer className="bg-white border-0 professional-card-footer">
          <Button onClick={onBook} className="book-appointment-btn">
            Book Appointment
          </Button>
        </Card.Footer>
      </Card>
    </motion.div>
  );
};

export default ProfessionalCard;
