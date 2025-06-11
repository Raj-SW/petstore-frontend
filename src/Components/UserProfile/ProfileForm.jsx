import { Modal, Form, Button } from "react-bootstrap";
import { User } from "../../models";

const ProfileForm = ({ show, onHide, onSubmit, initialData, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber"),
      address: formData.get("address"),
    };

    const user = new User(userData);
    const { isValid, errors } = user.validate();

    if (!isValid) {
      // Handle validation errors
      return;
    }

    onSubmit(userData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="name"
              defaultValue={initialData?.name}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              defaultValue={initialData?.email}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phoneNumber"
              defaultValue={initialData?.phoneNumber}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              defaultValue={initialData?.address}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProfileForm;
