import { useState, useEffect, useCallback } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import "./AppointmentForm.css";
import usersApi from "@/Services/api/usersApi";
import appointmentsApi from "@/Services/api/appointmentsApi";
import { useToast } from "@/context/ToastContext";

const AppointmentForm = ({
  show,
  handleClose,
  onSubmit,
  initialData,
  professionalInfo,
}) => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    appointmentType: professionalInfo?.role,
    professionalName: professionalInfo?.name || "",
    professionalId: professionalInfo?.id || "",
    petName: "",
    petId: "",
    description: "",
    dateTime: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState(null);

  useEffect(() => {
    // Helper to map incoming data to form fields
    const mapToFormData = (data, profInfo) => ({
      appointmentType: data?.role || profInfo?.role,
      professionalName: data?.professionalName || profInfo?.name || "",
      professionalId: data?.professionalId || profInfo?.id || "",
      petName: data?.petName || "",
      petId: data?.petId || "",
      description: data?.description || "",
      dateTime: data?.datetimeISO || "",
      address: data?.address || profInfo?.address || "",
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
    if (!formData.dateTime) newErrors.dateTime = "Date and time is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.address) newErrors.address = "Location is required";
    if (!formData.petId) newErrors.petId = "Please select a pet";
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

  const handlePetSelection = useCallback(
    (e) => {
      const selectedPetId = e.target.value;
      const selectedPet = pets.find(
        (pet) => (pet.id || pet._id) === selectedPetId
      );

      setFormData((prev) => ({
        ...prev,
        petId: selectedPetId,
        petName: selectedPet ? selectedPet.name : "",
      }));

      // Clear pet-related errors
      if (errors.petName || errors.petId) {
        setErrors((prev) => ({
          ...prev,
          petName: undefined,
          petId: undefined,
        }));
      }
    },
    [pets, errors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await appointmentsApi.createAppointment(formData);
      // Call the onSubmit prop if provided
      if (onSubmit) {
        onSubmit(response);
      }
      // Show success toast with appointment details
      const appointmentDate = new Date(formData.dateTime).toLocaleDateString();
      const appointmentTime = new Date(formData.dateTime).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

      addToast(
        `Appointment booked successfully with ${formData.professionalName} on ${appointmentDate} at ${appointmentTime}`,
        "success"
      );

      handleClose();
    } catch (error) {
      setErrors({ submit: error.message || "Failed to create appointment" });
      addToast(
        error.message || "Failed to create appointment. Please try again.",
        "error"
      );
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
        <Modal.Title>New Appointment</Modal.Title>
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
                    value={formData.appointmentType}
                    onChange={handleChange}
                    isInvalid={!!errors.role}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.appointmentType}
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
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleChange}
                    isInvalid={!!errors.dateTime}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dateTime}
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
                    onChange={handlePetSelection}
                    required
                    disabled={petsLoading}
                    isInvalid={!!errors.petId}
                  >
                    <option value="">Select a pet...</option>
                    {pets.map((pet) => (
                      <option key={pet.id || pet._id} value={pet.id || pet._id}>
                        {pet.name} ({pet.type})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.petId}
                  </Form.Control.Feedback>
                  {formData.petName && (
                    <div className="text-muted mt-1">
                      <small>Selected: {formData.petName}</small>
                    </div>
                  )}
                  {petsError && (
                    <div className="text-danger mt-1">{petsError}</div>
                  )}
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
