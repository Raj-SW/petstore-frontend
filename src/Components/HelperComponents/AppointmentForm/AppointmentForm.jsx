import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import ProfessionalService from "@/Services/localServices/professionalService";
import {
  APPOINTMENT_TYPES,
  APPOINTMENT_DURATIONS,
} from "@/constants/appointmentConstants";
import "./AppointmentForm.css";

const AppointmentForm = ({ show, handleClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: "",
    datetimeISO: "",
    description: "",
    type: APPOINTMENT_TYPES.VET,
    location: "",
    duration: APPOINTMENT_DURATIONS.DEFAULT,
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        type: APPOINTMENT_TYPES.VET,
        location: "",
        duration: APPOINTMENT_DURATIONS.DEFAULT,
        notes: "",
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const [vets, groomers] = await Promise.all([
          ProfessionalService.getAll({ role: "veterinarian" }),
          ProfessionalService.getAll({ role: "groomer" }),
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

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.datetimeISO)
      newErrors.datetimeISO = "Date and time is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (formData.duration < APPOINTMENT_DURATIONS.MIN) {
      newErrors.duration = `Duration must be at least ${APPOINTMENT_DURATIONS.MIN} minutes`;
    }
    if (formData.duration > APPOINTMENT_DURATIONS.MAX) {
      newErrors.duration = `Duration cannot exceed ${APPOINTMENT_DURATIONS.MAX} minutes`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error when field is modified
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
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
                    isInvalid={!!errors.type}
                    required
                  >
                    <option value={APPOINTMENT_TYPES.VET}>Veterinarian</option>
                    <option value={APPOINTMENT_TYPES.GROOMING}>Grooming</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Provider</Form.Label>
                  <Form.Select
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    isInvalid={!!errors.title}
                    required
                  >
                    <option value="">Select a provider</option>
                    {formData.type === APPOINTMENT_TYPES.VET
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
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
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
                    isInvalid={!!errors.datetimeISO}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.datetimeISO}
                  </Form.Control.Feedback>
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
                    min={APPOINTMENT_DURATIONS.MIN}
                    max={APPOINTMENT_DURATIONS.MAX}
                    step="15"
                    isInvalid={!!errors.duration}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.duration}
                  </Form.Control.Feedback>
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
                isInvalid={!!errors.description}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                isInvalid={!!errors.location}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.location}
              </Form.Control.Feedback>
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

            {errors.submit && (
              <div className="alert alert-danger" role="alert">
                {errors.submit}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}{" "}
                Appointment
              </Button>
            </div>
          </Form>
        </motion.div>
      </Modal.Body>
    </Modal>
  );
};

export default AppointmentForm;
