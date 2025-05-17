import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaUserMd,
  FaCut,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { veterinarianService } from "@/Services/localServices/veterinarianService";
import { groomerService } from "@/Services/localServices/groomerService";
import { Container, Row, Col, Badge, Card, Button } from "react-bootstrap";

const ProfessionalCalendar = () => {
  const { type, id } = useParams();
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfessional = async () => {
      setLoading(true);
      try {
        let data;
        if (type === "vet") {
          data = await veterinarianService.getById(Number(id));
        } else if (type === "groomer") {
          data = await groomerService.getById(Number(id));
        }
        setProfessional(data);
        setError(null);
      } catch (err) {
        setError("Professional not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProfessional();
  }, [type, id]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  if (error || !professional)
    return (
      <div className="error-container">
        <p className="error-message">{error || "Professional not found"}</p>
      </div>
    );

  const badgeIcon =
    type === "vet" ? (
      <FaUserMd className="specialization-icon me-1" />
    ) : (
      <FaCut className="specialization-icon me-1" />
    );
  const badgeLabel = type === "vet" ? "Veterinarian" : "Groomer";
  const specialty =
    type === "vet"
      ? professional.specialization
      : professional.specialties?.join(", ") || "";

  return (
    <Container className="py-4">
      <Card
        className="mb-4 shadow-sm"
        style={{ maxWidth: 600, margin: "0 auto" }}
      >
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #74B49B",
                }}
              >
                <img
                  src={professional.image}
                  alt={professional.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </Col>
            <Col>
              <h5 className="mb-1">{professional.name}</h5>
              <Badge className="specialization-badge mb-2" bg="light">
                {badgeIcon} {badgeLabel}
              </Badge>
              <div className="text-muted" style={{ fontSize: "0.95rem" }}>
                {specialty}
              </div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {professional.phone && (
                  <span>
                    <FaPhone className="contact-icon" /> {professional.phone}
                  </span>
                )}
                {professional.email && (
                  <span>
                    <FaEnvelope className="contact-icon" /> {professional.email}
                  </span>
                )}
                {professional.location && (
                  <span>
                    <FaMapMarkerAlt className="contact-icon" />{" "}
                    {professional.location}
                  </span>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card className="shadow-sm" style={{ maxWidth: 600, margin: "0 auto" }}>
        <Card.Body>
          {/* Placeholder for calendar and booking UI */}
          <h6 className="mb-3">Book an Appointment</h6>
          <div
            style={{
              minHeight: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
            }}
          >
            [Calendar and time slots will go here]
          </div>
          <Button variant="success" className="w-100 mt-3">
            Confirm Appointment
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfessionalCalendar;
