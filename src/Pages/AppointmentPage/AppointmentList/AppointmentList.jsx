import { useState } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUserMd,
  FaPaw,
} from "react-icons/fa";
import { format, parseISO } from "date-fns";
import "./AppointmentList.css";

const AppointmentList = ({ appointments, onEdit, onDelete }) => {
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAppointments = appointments.filter((appointment) => {
    const typeMatch = filter === "all" || appointment.type === filter;
    const statusMatch =
      statusFilter === "all" || appointment.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getTypeBadgeVariant = (type) => {
    return type === "vet" ? "info" : "primary";
  };

  return (
    <Container fluid className="appointment-list-container">
      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <div className="filter-section">
            <div className="filter-group">
              <Button
                variant={filter === "all" ? "primary" : "outline-primary"}
                onClick={() => setFilter("all")}
                className="filter-button"
              >
                All
              </Button>
              <Button
                variant={filter === "vet" ? "primary" : "outline-primary"}
                onClick={() => setFilter("vet")}
                className="filter-button"
              >
                <FaUserMd className="me-2" />
                Vet
              </Button>
              <Button
                variant={filter === "grooming" ? "primary" : "outline-primary"}
                onClick={() => setFilter("grooming")}
                className="filter-button"
              >
                <FaPaw className="me-2" />
                Grooming
              </Button>
            </div>
            <div className="filter-group">
              <Button
                variant={statusFilter === "all" ? "primary" : "outline-primary"}
                onClick={() => setStatusFilter("all")}
                className="filter-button"
              >
                All Status
              </Button>
              <Button
                variant={
                  statusFilter === "Confirmed" ? "primary" : "outline-primary"
                }
                onClick={() => setStatusFilter("Confirmed")}
                className="filter-button"
              >
                Confirmed
              </Button>
              <Button
                variant={
                  statusFilter === "Pending" ? "primary" : "outline-primary"
                }
                onClick={() => setStatusFilter("Pending")}
                className="filter-button"
              >
                Pending
              </Button>
              <Button
                variant={
                  statusFilter === "Cancelled" ? "primary" : "outline-primary"
                }
                onClick={() => setStatusFilter("Cancelled")}
                className="filter-button"
              >
                Cancelled
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Appointment List */}
      <Row>
        <Col>
          <div className="appointment-list">
            {filteredAppointments.map((appointment) => {
              const appointmentDate = parseISO(appointment.datetimeISO);
              return (
                <Card key={appointment.id} className="appointment-card mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="appointment-info">
                        <div className="d-flex align-items-center mb-2">
                          <h5 className="appointment-title mb-0">
                            {appointment.title}
                          </h5>
                          <div className="ms-3">
                            <Badge
                              bg={getTypeBadgeVariant(appointment.type)}
                              className="me-2"
                            >
                              {appointment.type === "vet" ? "Vet" : "Grooming"}
                            </Badge>
                            <Badge
                              bg={getStatusBadgeVariant(appointment.status)}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="appointment-details">
                          <div className="detail-item">
                            <FaCalendarAlt className="detail-icon" />
                            <span>
                              {format(appointmentDate, "EEEE, MMMM d, yyyy")}
                            </span>
                          </div>
                          <div className="detail-item">
                            <FaClock className="detail-icon" />
                            <span>{format(appointmentDate, "h:mm a")}</span>
                          </div>
                          <div className="detail-item">
                            <FaMapMarkerAlt className="detail-icon" />
                            <span>{appointment.location}</span>
                          </div>
                          {appointment.petName && (
                            <div className="detail-item">
                              <FaPaw className="detail-icon" />
                              <span>{appointment.petName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="appointment-actions">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => onEdit(appointment)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDelete(appointment.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AppointmentList;
