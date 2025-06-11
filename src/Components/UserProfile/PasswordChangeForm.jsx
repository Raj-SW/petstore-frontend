import { Modal, Form, Button } from "react-bootstrap";
import { PasswordChangeDTO } from "../../models";

const PasswordChangeForm = ({ show, onHide, onSubmit, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const passwordData = {
      oldPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    };

    const passwordDTO = new PasswordChangeDTO(passwordData);
    const { isValid, errors } = passwordDTO.validate();

    if (!isValid) {
      // Handle validation errors
      return;
    }

    onSubmit(passwordData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Current Password</Form.Label>
            <Form.Control type="password" name="currentPassword" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              required
              minLength={6}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control type="password" name="confirmPassword" required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PasswordChangeForm;
