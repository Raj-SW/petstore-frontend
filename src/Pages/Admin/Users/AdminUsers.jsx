import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUserX, FiUserCheck, FiTrash2 } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import usersApi from "../../../Services/api/usersApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminUsers.css";

const ROLE_OPTIONS = ["customer", "veterinarian", "groomer", "trainer", "petTaxi", "admin"];

const getRoleBadgeClass = (role) => {
  if (role === "admin") return "admin-role-badge admin-role-badge--admin";
  if (["veterinarian", "groomer", "trainer", "petTaxi"].includes(role))
    return "admin-role-badge admin-role-badge--professional";
  return "admin-role-badge admin-role-badge--default";
};

const getInitials = (name = "", email = "") => {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : "?";
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUsers({ limit: 1000 });
      setUsers(response.data || response || []);
    } catch (error) {
      addToast("Failed to fetch users", "error");
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    setActionLoading((prev) => ({ ...prev, [`status-${user._id}`]: true }));
    try {
      await usersApi.toggleUserStatus(user._id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
      );
      addToast(
        `User ${newStatus ? "activated" : "deactivated"} successfully`,
        "success"
      );
    } catch (error) {
      addToast("Failed to update user status", "error");
      console.error("Error toggling user status:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`status-${user._id}`]: false }));
    }
  };

  const handleRoleChange = async (user, newRole) => {
    setActionLoading((prev) => ({ ...prev, [`role-${user._id}`]: true }));
    try {
      await usersApi.updateUserRole(user._id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
      addToast(`Role updated to "${newRole}"`, "success");
    } catch (error) {
      addToast("Failed to update user role", "error");
      console.error("Error updating user role:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`role-${user._id}`]: false }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    try {
      await usersApi.deleteUser(deleteModal._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteModal._id));
      addToast("User deleted successfully", "success");
      setDeleteModal(null);
    } catch (error) {
      addToast("Failed to delete user", "error");
      console.error("Error deleting user:", error);
    }
  };

  // Derived stats
  const totalUsers = users.length;
  const adminsCount = users.filter((u) => u.role === "admin").length;
  const professionalsCount = users.filter((u) =>
    ["veterinarian", "groomer", "trainer", "petTaxi"].includes(u.role)
  ).length;
  const activeCount = users.filter((u) => u.isActive !== false).length;

  const columns = [
    {
      header: "Avatar",
      accessor: "_id",
      sortable: false,
      searchable: false,
      render: (_, item) => (
        <div className="admin-user-avatar">
          {getInitials(item.name || item.fullName, item.email)}
        </div>
      ),
    },
    {
      header: "Name",
      accessor: "name",
      render: (value, item) => (
        <span className="admin-user-name">{value || item.fullName || "—"}</span>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      render: (value) => <span className="admin-user-email">{value}</span>,
    },
    {
      header: "Role",
      accessor: "role",
      render: (value) => (
        <span className={getRoleBadgeClass(value)}>{value || "user"}</span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (value) => (
        <span className={`admin-status-badge ${value !== false ? "admin-status-badge--active" : "admin-status-badge--inactive"}`}>
          {value !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (value) => value ? new Date(value).toLocaleDateString() : "—",
    },
  ];

  const customActions = (user) => (
    <div className="admin-user-actions">
      <button
        className={`admin-action-btn admin-action-btn--toggle ${user.isActive !== false ? "admin-action-btn--deactivate" : "admin-action-btn--activate"}`}
        onClick={() => handleToggleStatus(user)}
        disabled={actionLoading[`status-${user._id}`]}
        title={user.isActive !== false ? "Deactivate user" : "Activate user"}
      >
        {user.isActive !== false ? <FiUserX size={15} /> : <FiUserCheck size={15} />}
      </button>
      <select
        className="admin-role-select"
        value={user.role || "user"}
        onChange={(e) => handleRoleChange(user, e.target.value)}
        disabled={actionLoading[`role-${user._id}`]}
        aria-label={`Change role for ${user.name || user.email}`}
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <button
        className="admin-action-btn admin-action-btn--delete"
        onClick={() => setDeleteModal(user)}
        title="Delete user"
      >
        <FiTrash2 size={15} />
      </button>
    </div>
  );

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-subtitle">Manage user accounts, roles, and access</p>
        </div>
      </div>

      {/* Stat pills */}
      <div className="admin-stats-row">
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{totalUsers}</span>
          <span className="admin-stat-pill-lbl">Total Users</span>
        </div>
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{adminsCount}</span>
          <span className="admin-stat-pill-lbl">Admins</span>
        </div>
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{professionalsCount}</span>
          <span className="admin-stat-pill-lbl">Professionals</span>
        </div>
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{activeCount}</span>
          <span className="admin-stat-pill-lbl">Active</span>
        </div>
      </div>

      <div className="admin-card">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          showActions={true}
          customActions={customActions}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.92, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -16 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="admin-modal-title">Confirm Delete</h3>
              <p className="admin-modal-msg">
                Are you sure you want to delete{" "}
                <strong>{deleteModal.name || deleteModal.email}</strong>? This
                action cannot be undone.
              </p>
              <div className="admin-modal-actions">
                <button
                  className="admin-modal-btn cancel"
                  onClick={() => setDeleteModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="admin-modal-btn confirm"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUsers;
