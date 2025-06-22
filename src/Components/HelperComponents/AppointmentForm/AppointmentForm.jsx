import { useState, useEffect, useCallback } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { APPOINTMENT_DURATIONS } from "@/constants/appointmentConstants";
import PropTypes from "prop-types";
import "./AppointmentForm.css";
import usersApi from "@/Services/api/usersApi";
import appointmentsApi from "@/Services/api/appointmentsApi";

const AppointmentForm = ({
  show,
  handleClose,
  onSubmit,
  initialData,
  professionalInfo,
}) => {
  const [formData, setFormData] = useState({
    professionalName: professionalInfo?.name || "",
    title: "",
    datetimeISO: "",
    description: "",
    type: professionalInfo?.role,
    address: "",
    duration: APPOINTMENT_DURATIONS.DEFAULT,
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState(null);

  useEffect(() => {
    // Helper to map incoming data to form fields
    const mapToFormData = (data, profInfo) => ({
      professionalName: data?.professionalName || profInfo?.name || "",
      title: data?.title || "",
      datetimeISO: data?.datetimeISO || "",
      description: data?.description || "",
      type: data?.role || profInfo?.role,
      address: data?.address || profInfo?.address || "",
      duration: data?.duration || APPOINTMENT_DURATIONS.DEFAULT,
      notes: data?.notes || "",
    });

    if (initialData) {
      setFormData(mapToFormData(initialData, professionalInfo));
    } else if (professionalInfo) {
      setFormData(mapToFormData({}, professionalInfo));
    } else {
      setFormData(mapToFormData({}, {}));
    }
  }, [initialData, professionalInfo]);

  useEffect(() => {
    if (show) {
      setPetsLoading(true);
      usersApi
        .getUserPets()
        .then((res) => {
          console.log(res);
          setPets(res || []);
          setPetsError(null);
          setPetsLoading(false);
        })
        .catch(() => {
          setPetsError("Failed to fetch pets");
          setPets([]);
        })
        .finally(() => setPetsLoading(false));
    }
  }, [show]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.datetimeISO)
      newErrors.datetimeISO = "Date and time is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.address) newErrors.address = "Location is required";
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
    try {
      await AppointmentService.create(formData);
      handleClose();
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  if (petsLoading) {
    return (
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Loading...</Modal.Title>
        </Modal.Header>
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
                <Form.Group className="mb-3 ">
                  <Form.Label>Appointment Type</Form.Label>
                  <Form.Control
                    className="appointment-input"
                    disabled={true}
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    isInvalid={!!errors.role}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Provider</Form.Label>
                  <Form.Control
                    className="appointment-input"
                    disabled={true}
                    type="text"
                    name="name"
                    value={formData.professionalName}
                    onChange={handleChange}
                    isInvalid={!!errors.professionalName}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.professionalName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date and Time</Form.Label>
                  <Form.Control
                    className="appointment-input"
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
                  <Form.Label>Pet</Form.Label>
                  <Form.Select
                    className="appointment-input"
                    name="petId"
                    value={formData.petId}
                    onChange={handleChange}
                    required
                    disabled={petsLoading}
                  >
                    {pets.map((pet) => (
                      <option key={pet.id || pet._id} value={pet.id || pet._id}>
                        {pet.name} ({pet.type})
                      </option>
                    ))}
                  </Form.Select>
                  {petsError && <div className="text-danger">{petsError}</div>}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                className="appointment-input"
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
                className="appointment-input"
                disabled={true}
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                isInvalid={!!errors.address}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
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
              <Button variant="primary" type="submit">
                Create Appointment
              </Button>
            </div>
          </Form>
        </motion.div>
      </Modal.Body>
    </Modal>
  );
};

AppointmentForm.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  professionalInfo: PropTypes.object,
};

export default AppointmentForm;
