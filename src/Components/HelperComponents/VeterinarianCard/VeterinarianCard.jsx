import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import {
  FaStar,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserMd,
} from "react-icons/fa";
import { motion } from "framer-motion";
import "./VeterinarianCard.css";

const VeterinarianCard = ({
  name,
  specialization,
  qualifications,
  experience,
  rating,
  reviews,
  image,
  phone,
  email,
  location,
  onBookAppointment,
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
      className="veterinarian-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-100">
        <Card.Header className="d-flex align-items-center veterinarian-card-header">
          <div className="veterinarian-avatar">
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
            <div className="veterinarian-name mb-1">{name}</div>
          </div>
        </Card.Header>
        <Card.Body className="veterinarian-content">
          <Badge className="specialization-badge mb-2" bg="light">
            <FaUserMd className="specialization-icon me-1" />
            {specialization}
          </Badge>
          <div className="veterinarian-qualifications">
            <h4>Qualifications</h4>
            <ul>
              {qualifications.map((qual, index) => (
                <li key={index}>{qual}</li>
              ))}
            </ul>
          </div>
          <div className="veterinarian-experience">
            <span className="experience-years">
              {experience} years experience
            </span>
          </div>
          <div className="veterinarian-rating">
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
              {rating.toFixed(1)} ({reviews} reviews)
            </span>
          </div>
          <div className="veterinarian-contact">
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
        <Card.Footer className="bg-white border-0 veterinarian-card-footer">
          <div style={{ width: "100%" }}>
            <Button
              variant="success"
              onClick={onBookAppointment}
              className="book-appointment-btn "
            >
              Book Appointment
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </motion.div>
  );
};

export default VeterinarianCard;
