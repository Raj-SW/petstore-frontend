import { useState, useEffect } from "react";
import {
  Col,
  Container,
  Row,
  Card,
  Button,
  Modal,
  Form,
  Image,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaPlus, FaPencilAlt, FaKey, FaTrash } from "react-icons/fa";
import Breadcrumb from "../Components/HelperComponents/Breadcrumb/Breadcrumb";
import UserProfileService from "../Services/localServices/userProfileService";
import "./UserProfile.css";

const UserProfile = () => {
  // State for user details
  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    profileImage: "https://placehold.co/150x150?text=Profile",
  });

  // State for pets
  const [pets, setPets] = useState([]);
  const [showPetModal, setShowPetModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  // State for modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // State for pet form
  const [petForm, setPetForm] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    color: "",
    description: "",
  });

  // State for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Add loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Gender options
  const genderOptions = ["male", "female", "other"];

  // Pet type options
  const petTypeOptions = ["Dog", "Cat", "Bird", "Fish", "Small Pets", "Other"];

  // Separate fetch functions for better error handling and reusability
  const fetchUserProfile = async () => {
    try {
      const profileData = await UserProfileService.getUserProfile();
      setUserDetails(profileData.data);
      console.log("profileData from user profile", profileData);
    } catch (err) {
      setError(`Failed to load profile: ${err.message}`);
    }
  };

  const fetchUserPets = async () => {
    try {
      const petsData = await UserProfileService.getUserPets();
      setPets(Array.isArray(petsData) ? petsData : []);
    } catch (err) {
      setError(`Failed to load pets: ${err.message}`);
      setPets([]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Fetch profile and pets in parallel
        await Promise.all([fetchUserProfile(), fetchUserPets()]);
      } catch (error) {
        setError(`Failed to initialize data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Optimize pet form submission
  const handlePetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (selectedPet) {
        // Update existing pet
        const updatedPet = await UserProfileService.updatePet(
          selectedPet.id,
          petForm
        );
        setPets((prevPets) =>
          prevPets.map((pet) => (pet.id === selectedPet.id ? updatedPet : pet))
        );
        setSuccessMessage("Pet updated successfully!");
      } else {
        // Add new pet
        const newPet = await UserProfileService.addPet(petForm);
        setPets((prevPets) => [...prevPets, newPet]);
        setSuccessMessage("Pet added successfully!");
      }

      // Reset form and close modal
      setShowPetModal(false);
      setPetForm({
        name: "",
        type: "",
        breed: "",
        age: "",
        gender: "",
        color: "",
        description: "",
      });
      setSelectedPet(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const updatedProfile = await UserProfileService.updateUserProfile(
        userDetails
      );
      setUserDetails(updatedProfile);
      setShowProfileModal(false);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await UserProfileService.changePassword(passwordForm);
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize pet deletion
  const handleDeletePet = async (petId) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await UserProfileService.deletePet(petId);
      setPets((prevPets) => prevPets.filter((pet) => pet.id !== petId));
      setSuccessMessage("Pet deleted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize pet list rendering
  const renderPetList = () => {
    if (!pets || pets.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted mb-0">No pets added yet.</p>
        </div>
      );
    }

    return pets.map((pet) => (
      <div key={pet.id} className="pet-card p-3">
        <div className="d-flex align-items-center">
          <div className="ms-3 flex-grow-1">
            <h6 className="mb-1">{pet.name}</h6>
            <small className="text-muted d-block">
              {pet.breed} • {pet.age} years • {pet.type}
            </small>
          </div>
          <div className="d-flex flex-column gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                setSelectedPet(pet);
                setPetForm(pet);
                setShowPetModal(true);
              }}
            >
              <FaPencilAlt />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDeletePet(pet.id)}
            >
              <FaTrash />
            </Button>
          </div>
        </div>
      </div>
    ));
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (isLoading && !pets.length) {
    return (
      <div className="spinner-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Container>
        <Row className="mt-4 mb-4">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "User Profile", path: "/UserProfile" },
            ]}
          />
        </Row>

        {/* Success Message */}
        {successMessage && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Row className="g-4">
          {/* Pets Section */}
          <Col lg={4}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>My Pets</h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedPet(null);
                    setShowPetModal(true);
                  }}
                >
                  <FaPlus className="me-2" />
                  Add Pet
                </Button>
              </Card.Header>
              <Card.Body>{renderPetList()}</Card.Body>
            </Card>
          </Col>

          {/* User Profile Section */}
          <Col lg={4}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Profile Details</h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowProfileModal(true)}
                >
                  <FaPencilAlt className="me-2" />
                  Edit
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="profile-image-container">
                  <Image
                    src={userDetails.profileImage}
                    className="profile-image"
                  />
                </div>
                <div className="profile-details">
                  <div className="mb-3">
                    <label className="text-muted small">Name</label>
                    <p className="fw-medium">{userDetails.name}</p>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small">Email</label>
                    <p className="fw-medium">{userDetails.email}</p>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small">Phone</label>
                    <p className="fw-medium">{userDetails.phone}</p>
                  </div>
                  <div className="mb-3">
                    <label className="text-muted small">Address</label>
                    <p className="fw-medium">{userDetails.address}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Password Section */}
          <Col lg={4}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Security</h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <FaKey className="me-2" />
                  Change Password
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="text-center py-4">
                  <FaKey size={48} className="text-muted mb-3" />
                  <p className="text-muted mb-0">
                    Manage your password and security preferences here. Click
                    the button above to change your password.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pet Modal */}
        <Modal
          show={showPetModal}
          onHide={() => setShowPetModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedPet ? "Edit Pet" : "Add New Pet"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handlePetSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pet Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={petForm.name}
                      onChange={(e) =>
                        setPetForm({ ...petForm, name: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pet Type *</Form.Label>
                    <Form.Select
                      value={petForm.type}
                      onChange={(e) =>
                        setPetForm({ ...petForm, type: e.target.value })
                      }
                      required
                    >
                      <option value="">Select pet type</option>
                      {petTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Breed *</Form.Label>
                    <Form.Control
                      type="text"
                      value={petForm.breed}
                      onChange={(e) =>
                        setPetForm({ ...petForm, breed: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Age *</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.1"
                      value={petForm.age}
                      onChange={(e) =>
                        setPetForm({ ...petForm, age: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender *</Form.Label>
                    <Form.Select
                      value={petForm.gender}
                      onChange={(e) =>
                        setPetForm({ ...petForm, gender: e.target.value })
                      }
                      required
                    >
                      <option value="">Select gender</option>
                      {genderOptions.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Color *</Form.Label>
                    <Form.Control
                      type="text"
                      value={petForm.color}
                      onChange={(e) =>
                        setPetForm({ ...petForm, color: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={petForm.description}
                      onChange={(e) =>
                        setPetForm({ ...petForm, description: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowPetModal(false)}
                >
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
                  ) : selectedPet ? (
                    "Save Changes"
                  ) : (
                    "Add Pet"
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Profile Modal */}
        <Modal
          show={showProfileModal}
          onHide={() => setShowProfileModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleProfileUpdate}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={userDetails.name}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, name: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={userDetails.phone}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, phone: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={userDetails.address}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, address: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      value={userDetails.city}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, city: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      value={userDetails.state}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          state: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>ZIP</Form.Label>
                    <Form.Control
                      type="text"
                      value={userDetails.zip}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, zip: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowProfileModal(false)}
                >
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
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Password Modal */}
        <Modal
          show={showPasswordModal}
          onHide={() => setShowPasswordModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handlePasswordChange}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
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
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default UserProfile;
