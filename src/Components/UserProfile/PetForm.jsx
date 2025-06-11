import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { Pet } from "../../models";

const PetForm = ({ show, onHide, onSubmit, initialData = null, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    color: "",
    description: "",
  });
  const [errors, setErrors] = useState([]);

  const genderOptions = ["male", "female", "other"];
  const petTypeOptions = ["Dog", "Cat", "Bird", "Fish", "Small Pets", "Other"];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const pet = new Pet(formData);
    const { isValid, errors } = pet.validate();

    if (!isValid) {
      setErrors(errors);
      return;
    }

    onSubmit(pet);
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
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {errors.length > 0 && (
            <div className="alert alert-danger">
              {errors.map((error, index) => (
                <p key={index} className="mb-0">
                  {error}
                </p>
              ))}
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              {petTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Breed</Form.Label>
            <Form.Control
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Age</Form.Label>
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
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              {genderOptions.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update" : "Add Pet"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PetForm;
