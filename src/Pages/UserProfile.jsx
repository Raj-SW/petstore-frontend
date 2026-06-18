import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaPencilAlt, FaKey, FaUser, FaEnvelope,
  FaPhone, FaMapMarkerAlt, FaExclamationCircle, FaCheckCircle, FaTimes,
} from "react-icons/fa";

import AvatarUploader from "../Components/UserProfile/AvatarUploader";
import ManagePhotosModal from "../Components/UserProfile/ManagePhotosModal";
import Breadcrumb from "../Components/HelperComponents/Breadcrumb/Breadcrumb";
import UserProfileService from "../Services/localServices/userProfileService";
import PetForm from "../Components/UserProfile/PetForm";
import PetList from "../Components/UserProfile/PetList";
import ProfileForm from "../Components/UserProfile/ProfileForm";
import PasswordChangeForm from "../Components/UserProfile/PasswordChangeForm";
import ConfirmModal from "../Components/UserProfile/ConfirmModal";
import { User, Pet } from "../models";
import { useAuth } from "@/context/AuthContext";
import usersApi from "@/Services/api/usersApi";
import "./UserProfile.css";

const UserProfile = () => {
  const { user, updateUser } = useAuth();

  const [userDetails, setUserDetails] = useState(user);
  const [salesEmails, setSalesEmails] = useState(user?.emailPreferences?.sales !== false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [pets, setPets] = useState([]);

  const [showPetModal, setShowPetModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [photosPet, setPhotosPet] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchUserPets = async () => {
    try {
      const data = await usersApi.getUserPets();
      setPets(data);
    } catch (err) {
      setError(`Failed to load pets: ${err.message}`);
      setPets([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError("");
      try { await fetchUserPets(); }
      catch (err) { setError(`Failed to load data: ${err.message}`); }
      finally { setIsLoading(false); }
    };
    init();
  }, []);

  // Auto-dismiss banners
  useEffect(() => {
    if (!error && !successMessage) return;
    const t = setTimeout(() => { setError(""); setSuccessMessage(""); }, 5000);
    return () => clearTimeout(t);
  }, [error, successMessage]);

  const handlePetSubmit = async (petData) => {
    setIsLoading(true);
    setError("");
    try {
      if (selectedPet) {
        const petId = selectedPet._id || selectedPet.id;
        const updated = await UserProfileService.updatePet(petId, petData);
        setPets((prev) => prev.map((p) => (p._id || p.id) === petId ? { ...updated.data } : p));
        setSuccessMessage("Pet updated successfully!");
      } else {
        const created = await UserProfileService.addPet(petData);
        setPets((prev) => [...prev, new Pet(created.data)]);
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

  const handleProfileUpdate = async (profileData) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await UserProfileService.updateUserProfile({
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
      });
      setUserDetails(new User(response.data));
      setShowProfileModal(false);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalesEmailsToggle = async (e) => {
    const next = e.target.checked;
    setSalesEmails(next);          // optimistic
    setSavingPrefs(true);
    setError("");
    try {
      await UserProfileService.updateUserProfile({ emailPreferences: { sales: next } });
      updateUser({ emailPreferences: { sales: next } });
      setSuccessMessage(next ? "Subscribed to sale & promo emails" : "Unsubscribed from sale & promo emails");
    } catch (err) {
      setSalesEmails(!next);       // revert on failure
      setError(err.message || "Failed to update email preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

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

  const handleDeletePet = (petId) => {
    setPetToDelete(petId);
    setShowConfirmModal(true);
  };

  const confirmDeletePet = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    setError("");
    try {
      await UserProfileService.deletePet(petToDelete);
      setPets((prev) => prev.filter((p) => (p._id || p.id) !== petToDelete));
      setSuccessMessage("Pet deleted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setPetToDelete(null);
    }
  };

  if (isLoading && !userDetails?.id) {
    return (
      <div className="up-page">
        <div className="up-loader"><div className="up-spinner" /></div>
      </div>
    );
  }

  return (
    <div className="up-page">
      <div className="up-breadcrumb">
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Profile", path: "/profile" }]} />
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="up-alert up-alert--error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <FaExclamationCircle />
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss"><FaTimes size={14} /></button>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            className="up-alert up-alert--success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <FaCheckCircle />
            <span>{successMessage}</span>
            <button type="button" onClick={() => setSuccessMessage("")} aria-label="Dismiss"><FaTimes size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="up-grid">

        {/* Profile column */}
        <motion.aside
          className="up-profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AvatarUploader />

          <h2 className="up-name">{userDetails?.name}</h2>
          <p className="up-role">Member since {new Date(userDetails?.createdAt || Date.now()).getFullYear()}</p>

          <div className="up-meta">
            <div className="up-meta-row">
              <FaEnvelope size={13} />
              <span>{userDetails?.email}</span>
            </div>
            {userDetails?.phoneNumber && (
              <div className="up-meta-row">
                <FaPhone size={13} />
                <span>{userDetails.phoneNumber}</span>
              </div>
            )}
            {userDetails?.address && (
              <div className="up-meta-row">
                <FaMapMarkerAlt size={13} />
                <span>{userDetails.address}</span>
              </div>
            )}
          </div>

          <div className="up-actions">
            <button type="button" className="up-btn up-btn--secondary" onClick={() => setShowProfileModal(true)}>
              <FaPencilAlt size={12} />
              <span>Edit Profile</span>
            </button>
            <button type="button" className="up-btn up-btn--ghost" onClick={() => setShowPasswordModal(true)}>
              <FaKey size={12} />
              <span>Change Password</span>
            </button>
          </div>

          <div className="up-prefs">
            <h3 className="up-prefs-title">Email preferences</h3>
            <label className="up-prefs-toggle">
              <input
                type="checkbox"
                checked={salesEmails}
                disabled={savingPrefs}
                onChange={handleSalesEmailsToggle}
              />
              <span>Receive sale &amp; promo emails</span>
            </label>
          </div>
        </motion.aside>

        {/* Pets column */}
        <motion.div
          className="up-pets-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="up-pets-header">
            <h2 className="up-pets-title">My Pets</h2>
            <button
              type="button"
              className="up-btn up-btn--primary"
              onClick={() => { setSelectedPet(null); setShowPetModal(true); }}
            >
              <FaPlus size={12} />
              <span>Add Pet</span>
            </button>
          </div>

          {pets.length === 0 ? (
            <div className="up-pets-empty">
              <FaUser size={36} />
              <h3>No pets added yet</h3>
              <p>Add your furry friends to start managing their care.</p>
            </div>
          ) : (
            <PetList
              pets={pets}
              onEdit={(pet) => { setSelectedPet(pet); setShowPetModal(true); }}
              onDelete={handleDeletePet}
              onManagePhotos={(pet) => setPhotosPet(pet)}
            />
          )}
        </motion.div>
      </div>

      <PetForm
        show={showPetModal}
        onHide={() => { setShowPetModal(false); setSelectedPet(null); }}
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
      <ConfirmModal
        show={showConfirmModal}
        title="Delete Pet"
        message="Are you sure you want to delete this pet? This action cannot be undone."
        confirmLabel="Delete Pet"
        onConfirm={confirmDeletePet}
        onCancel={() => { setShowConfirmModal(false); setPetToDelete(null); }}
      />
      {photosPet && (
        <ManagePhotosModal
          pet={photosPet}
          onClose={() => setPhotosPet(null)}
          onChange={(updated) => {
            setPhotosPet(updated);
            setPets((prev) => prev.map((p) => ((p._id || p.id) === (updated._id || updated.id) ? updated : p)));
          }}
        />
      )}
    </div>
  );
};

export default UserProfile;
