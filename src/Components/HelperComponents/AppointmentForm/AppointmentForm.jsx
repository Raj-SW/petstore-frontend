import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import ProfessionalService from "@/Services/localServices/professionalService";
import "./AppointmentForm.css";
const AppointmentForm = ({ show, handleClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: "",
    datetimeISO: "",
    description: "",
    type: "vet",
    location: "",
    duration: 60,
    notes: "",
  });

  const [veterinarians, setVeterinarians] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        datetimeISO: "",
        description: "",
        type: "vet",
        location: "",
        duration: 60,
        notes: "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const [vets, groomers] = await Promise.all([
          ProfessionalService.getAll({ profession: "veterinarian" }),
          ProfessionalService.getAll({ profession: "groomer" }),
        ]);
        setVeterinarians(vets);
        setGroomers(groomers);
        setError(null);
      } catch (err) {
        setError("Failed to fetch providers");
        console.error("Error fetching providers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) {
    return (
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Loading...</Modal.Title>
        </Modal.Header>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{error}</Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? "Edit Appointment" : "New Appointment"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Appointment Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="vet">Veterinarian</option>
                    <option value="grooming">Grooming</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Provider</Form.Label>
                  <Form.Select
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a provider</option>
                    {formData.type === "vet"
                      ? veterinarians.map((vet) => (
                          <option key={vet.id} value={vet.name}>
                            {vet.name} - {vet.specialization}
                          </option>
                        ))
                      : groomers.map((groomer) => (
                          <option key={groomer.id} value={groomer.name}>
                            {groomer.name} - {groomer.specialties.join(", ")}
                          </option>
                        ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date and Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="datetimeISO"
                    value={formData.datetimeISO}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="15"
                    step="15"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {initialData ? "Update" : "Create"} Appointment
              </Button>
            </div>
          </Form>
        </motion.div>
      </Modal.Body>
    </Modal>
  );
};

export default AppointmentForm;
