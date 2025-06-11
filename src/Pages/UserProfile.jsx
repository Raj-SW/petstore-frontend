import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaPlus, FaPencilAlt, FaKey } from "react-icons/fa";
import Breadcrumb from "../Components/HelperComponents/Breadcrumb/Breadcrumb";
import UserProfileService from "../Services/localServices/userProfileService";
import PetForm from "../Components/UserProfile/PetForm";
import PetList from "../Components/UserProfile/PetList";
import ProfileForm from "../Components/UserProfile/ProfileForm";
import PasswordChangeForm from "../Components/UserProfile/PasswordChangeForm";
import { User, Pet } from "../models";
import "./UserProfile.css";

const UserProfile = () => {
  // State for user details
  const [userDetails, setUserDetails] = useState(new User());
  const [pets, setPets] = useState([]);

  // Modal states
  const [showPetModal, setShowPetModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch user profile and pets
  const fetchUserProfile = async () => {
    try {
      const profileData = await UserProfileService.getUserProfile();
      setUserDetails(new User(profileData.data));
    } catch (err) {
      setError(`Failed to load profile: ${err.message}`);
    }
  };

  const fetchUserPets = async () => {
    try {
      const petsData = await UserProfileService.getUserPets();
      setPets(petsData.data.map((pet) => new Pet(pet)));
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
        await Promise.all([fetchUserProfile(), fetchUserPets()]);
      } catch (error) {
        setError(`Failed to initialize data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle pet form submission
  const handlePetSubmit = async (petData) => {
    setIsLoading(true);
    setError("");

    try {
      if (selectedPet) {
        // Update existing pet
        const updatedPet = await UserProfileService.updatePet(
          selectedPet.id,
          petData
        );
        setPets((prevPets) =>
          prevPets.map((pet) =>
            pet.id === selectedPet.id ? new Pet(updatedPet.data) : pet
          )
        );
        setSuccessMessage("Pet updated successfully!");
      } else {
        // Add new pet
        const newPet = await UserProfileService.addPet(petData);
        setPets((prevPets) => [...prevPets, new Pet(newPet.data)]);
        setSuccessMessage("Pet added successfully!");
      }

      setShowPetModal(false);
      setSelectedPet(null);
    } catch (err) {
      setError(err.message || "Failed to save pet");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (profileData) => {
    setIsLoading(true);
    setError("");
    try {
      // Only send the fields that can be updated
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
      };

      // Send the update request
      const response = await UserProfileService.updateUserProfile(updateData);

      // Update the state with the response data
      setUserDetails(new User(response.data));
      setShowProfileModal(false);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (passwordData) => {
    setIsLoading(true);
    setError("");
    try {
      await UserProfileService.changePassword(passwordData);
      setShowPasswordModal(false);
      setSuccessMessage("Password changed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pet deletion
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

  if (isLoading && !userDetails.id) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Breadcrumb
        items={[
          { label: "Home", path: "/" },
          { label: "Profile", path: "/profile" },
        ]}
      />

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccessMessage("")}
          dismissible
        >
          {successMessage}
        </Alert>
      )}

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <img
                src={
                  userDetails.profileImage ||
                  "https://placehold.co/150x150?text=Profile"
                }
                alt="Profile"
                className="rounded-circle mb-3"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
              <h4>{userDetails.name}</h4>
              <p className="text-muted">{userDetails.email}</p>
              <br />
              {userDetails.phoneNumber && (
                <p className="text-muted mb-2">{userDetails.phoneNumber}</p>
              )}
              <br />

              {userDetails.address && (
                <p className="text-muted mb-3">{userDetails.address}</p>
              )}
              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowProfileModal(true)}
                >
                  <FaPencilAlt className="me-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <FaKey className="me-2" />
                  Change Password
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Pets</h5>
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
            <Card.Body>
              <PetList
                pets={pets}
                onEdit={(pet) => {
                  setSelectedPet(pet);
                  setShowPetModal(true);
                }}
                onDelete={handleDeletePet}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <PetForm
        show={showPetModal}
        onHide={() => {
          setShowPetModal(false);
          setSelectedPet(null);
        }}
        onSubmit={handlePetSubmit}
        initialData={selectedPet}
        isLoading={isLoading}
      />

      <ProfileForm
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        onSubmit={handleProfileUpdate}
        initialData={userDetails}
        isLoading={isLoading}
      />

      <PasswordChangeForm
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordChange}
        isLoading={isLoading}
      />
    </Container>
  );
};

export default UserProfile;
