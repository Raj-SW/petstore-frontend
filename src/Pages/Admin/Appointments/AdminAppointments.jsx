import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import appointmentsApi from "../../../Services/api/appointmentsApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminAppointments.css";

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

const getStatusClass = (status) => {
  const map = {
    pending: "admin-appt-status--pending",
    confirmed: "admin-appt-status--confirmed",
    completed: "admin-appt-status--completed",
    cancelled: "admin-appt-status--cancelled",
  };
  return `admin-appt-status ${map[status?.toLowerCase()] || ""}`;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return value;
  }
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesModal, setNotesModal] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const { addToast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsApi.getProfessionalAppointments({ limit: 1000 });
      setAppointments(response.data || response || []);
    } catch (error) {
      addToast("Failed to fetch appointments", "error");
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointment, newStatus) => {
    setStatusLoading((prev) => ({ ...prev, [appointment._id]: true }));
    try {
      await appointmentsApi.updateAppointmentStatus(appointment._id, newStatus);
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointment._id ? { ...a, status: newStatus } : a
        )
      );
      addToast(`Appointment status updated to "${newStatus}"`, "success");
    } catch (error) {
      addToast("Failed to update appointment status", "error");
      console.error("Error updating appointment status:", error);
    } finally {
      setStatusLoading((prev) => ({ ...prev, [appointment._id]: false }));
    }
  };

  // Derived stats
  const totalAppts = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  const columns = [
    {
      header: "Service",
      accessor: "serviceType",
      render: (value) => (
        <span className="admin-appt-service">{value || "—"}</span>
      ),
    },
    {
      header: "Customer",
      accessor: "customerName",
      render: (value, item) => (
        <span className="admin-appt-person">
          {value || item.user?.name || item.user?.email || "—"}
        </span>
      ),
    },
    {
      header: "Professional",
      accessor: "professionalName",
      render: (value, item) => (
        <span className="admin-appt-person">
          {value || item.professional?.name || "—"}
        </span>
      ),
    },
    {
      header: "Date & Time",
      accessor: "dateTime",
      render: (value) => (
        <span className="admin-appt-datetime">{formatDateTime(value)}</span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span className={getStatusClass(value)}>{value || "pending"}</span>
      ),
    },
    {
      header: "Notes",
      accessor: "notes",
      sortable: false,
      render: (value) =>
        value ? (
          <span className="admin-appt-notes-snippet" title={value}>
            {value.length > 40 ? `${value.substring(0, 40)}…` : value}
          </span>
        ) : (
          <span className="admin-appt-notes-empty">—</span>
        ),
    },
  ];

  const customActions = (appointment) => (
    <div className="admin-appt-actions">
      {appointment.notes && (
        <button
          className="admin-action-btn admin-action-btn--notes"
          onClick={() => setNotesModal(appointment)}
          title="View notes"
        >
          Notes
        </button>
      )}
      <select
        className="admin-status-select"
        value={appointment.status || "pending"}
        onChange={(e) => handleStatusChange(appointment, e.target.value)}
        disabled={statusLoading[appointment._id]}
        aria-label={`Change status for appointment ${appointment._id}`}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
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
          <h1 className="admin-page-title">Appointments</h1>
          <p className="admin-page-subtitle">
            Track and manage all service appointments
          </p>
        </div>
      </div>

      {/* Stat pills */}
      <div className="admin-stats-row">
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{totalAppts}</span>
          <span className="admin-stat-pill-lbl">Total</span>
        </div>
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{confirmedCount}</span>
          <span className="admin-stat-pill-lbl">Confirmed</span>
        </div>
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{completedCount}</span>
          <span className="admin-stat-pill-lbl">Completed</span>
        </div>
        <div className="admin-stat-pill">
          <span className="admin-stat-pill-val">{pendingCount}</span>
          <span className="admin-stat-pill-lbl">Pending</span>
        </div>
      </div>

      <div className="admin-card">
        <DataTable
          data={appointments}
          columns={columns}
          loading={loading}
          showActions={true}
          customActions={customActions}
        />
      </div>

      {/* Notes Modal */}
      <AnimatePresence>
        {notesModal && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotesModal(null)}
          >
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.92, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -16 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header-row">
                <h3 className="admin-modal-title">Appointment Notes</h3>
                <button
                  className="admin-modal-icon-close"
                  onClick={() => setNotesModal(null)}
                  aria-label="Close"
                >
                  <FiX size={18} />
                </button>
              </div>
              <div className="admin-appt-notes-meta">
                <span>{notesModal.serviceType || "Service"}</span>
                <span className="admin-appt-notes-meta-sep">·</span>
                <span>{formatDateTime(notesModal.dateTime)}</span>
              </div>
              <p className="admin-modal-notes-body">{notesModal.notes}</p>
              <div className="admin-modal-actions">
                <button
                  className="admin-modal-btn cancel"
                  onClick={() => setNotesModal(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminAppointments;
