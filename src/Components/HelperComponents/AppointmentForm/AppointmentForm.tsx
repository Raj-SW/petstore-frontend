import React, { useState } from "react";
import { format } from "date-fns";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  InputGroup,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUserMd,
  FaPaw,
} from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import "./AppointmentForm.css";
import {
  AppointmentFormProps,
  AppointmentFormData,
} from "@/types/appointment.types";

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  show,
  handleClose,
  onSubmit,
  initialData = null,
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: initialData?.title || "",
    type: initialData?.type || "vet",
    datetime: initialData?.datetime
      ? new Date(initialData.datetime)
      : new Date(),
    description: initialData?.description || "",
    location: initialData?.location || "",
    serviceProvider: initialData?.serviceProvider || "",
    petName: initialData?.petName || "",
    petType: initialData?.petType || "",
    duration: initialData?.duration || 30,
    price: initialData?.price || 0,
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.datetime) newErrors.datetime = "Date and time is required";
    if (!formData.serviceProvider)
      newErrors.serviceProvider = "Service provider is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.petName) newErrors.petName = "Pet name is required";
    if (!formData.petType) newErrors.petType = "Pet type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        datetimeISO: formData.datetime.toISOString(),
      });
      handleClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="appointment-form-header">
        <Modal.Title>
          {initialData ? "Edit Appointment" : "Schedule New Appointment"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="appointment-form">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaPaw className="form-icon" /> Pet Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="petName"
                  value={formData.petName}
                  onChange={handleChange}
                  isInvalid={!!errors.petName}
                  placeholder="Enter pet's name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.petName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaPaw className="form-icon" /> Pet Type
                </Form.Label>
                <Form.Select
                  name="petType"
                  value={formData.petType}
                  onChange={handleChange}
                  isInvalid={!!errors.petType}
                >
                  <option value="">Select pet type</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.petType}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaCalendarAlt className="form-icon" /> Date and Time
                </Form.Label>
                <DatePicker
                  selected={formData.datetime}
                  onChange={(date: Date) =>
                    setFormData((prev) => ({ ...prev, datetime: date }))
                  }
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="form-control"
                  isInvalid={!!errors.datetime}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.datetime}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUserMd className="form-icon" /> Service Provider
                </Form.Label>
                <Form.Select
                  name="serviceProvider"
                  value={formData.serviceProvider}
                  onChange={handleChange}
                  isInvalid={!!errors.serviceProvider}
                >
                  <option value="">Select service provider</option>
                  <option value="Dr. Smith">Dr. Smith - Veterinarian</option>
                  <option value="Dr. Johnson">
                    Dr. Johnson - Veterinarian
                  </option>
                  <option value="Sarah Wilson">Sarah Wilson - Groomer</option>
                  <option value="Mike Brown">Mike Brown - Groomer</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.serviceProvider}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaClock className="form-icon" /> Duration (minutes)
                </Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="15"
                  step="15"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaMapMarkerAlt className="form-icon" /> Location
                </Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  isInvalid={!!errors.location}
                  placeholder="Enter location"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.location}
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
              placeholder="Enter appointment details"
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
              placeholder="Any special instructions or notes"
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {initialData ? "Update" : "Schedule"} Appointment
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AppointmentForm;
