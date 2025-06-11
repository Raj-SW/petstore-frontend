import { useState, useEffect } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { Pet } from "../../models";

const PetForm = ({ show, onHide, onSubmit, initialData, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    color: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        type: initialData.type || "",
        breed: initialData.breed || "",
        age: initialData.age || "",
        gender: initialData.gender || "",
        color: initialData.color || "",
        description: initialData.description || "",
      });
    } else {
      // Reset form when adding new pet
      setFormData({
        name: "",
        type: "",
        breed: "",
        age: "",
        gender: "",
        color: "",
        description: "",
      });
    }
  }, [initialData, show]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert age to number
    const petData = {
      ...formData,
      age: Number(formData.age),
    };

    onSubmit(petData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? "Edit Pet" : "Add New Pet"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Pet Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Pet Type *</Form.Label>
            <Form.Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select pet type</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Fish">Fish</option>
              <option value="Small Pets">Small Pets</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Breed *</Form.Label>
            <Form.Control
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Age *</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gender *</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Color *</Form.Label>
            <Form.Control
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Add Pet"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PetForm;
