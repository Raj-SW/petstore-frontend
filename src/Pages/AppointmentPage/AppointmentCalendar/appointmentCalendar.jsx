import { useState, useEffect, useMemo, useCallback } from "react";
// CSS
import "./appointmentCalendar.css";
import "@/styles/calendarStyles.css";
// Components
import {
  Container,
  Row,
  Tab,
  Nav,
  Form,
  InputGroup,
  Modal,
  Button,
} from "react-bootstrap";
import { FaSearch, FaSync } from "react-icons/fa";
import AppointmentCard from "@/Components/HelperComponents/AppointmentCard/AppointmentCard";
import AppointmentForm from "@/Components/HelperComponents/AppointmentForm/AppointmentForm";
// import AppointmentService from "../../../Services/localServices/appointmentService";
import appointmentsApi from "@/Services/api/appointmentsApi";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";

const AppointmentCalendar = () => {
  const { addToast } = useToast();
  const { loading: authLoading } = useAuth();
  const [activeKey, setActiveKey] = useState("list-view");
  const [filters, setFilters] = useState({
    searchQuery: "",
    statusFilter: "all",
    sortOrder: "asc",
  });
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // Memoized fetch function to avoid dependency issues
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentsApi.getMyAppointments();
      setAppointments(response);
    } catch (err) {
      setError(err.message);
      addToast("Failed to fetch appointments", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Fetch appointments on component mount
  useEffect(() => {
    if (!authLoading) {
      fetchAppointments();
    }
  }, [authLoading, fetchAppointments]);

  // Helper function to get appointment ID consistently
  const getAppointmentId = useCallback((appointment) => {
    return appointment._id || appointment.id;
  }, []);

  // Filter and sort logic for appointments with search functionality
  const getFilteredAndSortedAppointments = useCallback(
    (view = "list-view") => {
      return appointments
        .filter((appointment) => {
          // View-based filtering
          if (view === "list-view") {
            return (
              appointment.status?.toLowerCase() === "confirmed" ||
              appointment.status?.toLowerCase() === "pending"
            );
          } else if (view === "history-view") {
            return (
              appointment.status?.toLowerCase() === "cancelled" ||
              appointment.status?.toLowerCase() === "completed" ||
              appointment.status?.toLowerCase() === "rejected"
            );
          }
          return false;
        })
        .filter((appointment) => {
          // Status filtering
          const statusMatch =
            filters.statusFilter === "all" ||
            appointment.status?.toLowerCase() === filters.statusFilter;

          // Search filtering
          const searchMatch =
            !filters.searchQuery ||
            appointment.title
              ?.toLowerCase()
              .includes(filters.searchQuery.toLowerCase()) ||
            appointment.professionalName
              ?.toLowerCase()
              .includes(filters.searchQuery.toLowerCase()) ||
            appointment.petName
              ?.toLowerCase()
              .includes(filters.searchQuery.toLowerCase()) ||
            appointment.description
              ?.toLowerCase()
              .includes(filters.searchQuery.toLowerCase());

          return statusMatch && searchMatch;
        })
        .sort((a, b) => {
          const dateA = new Date(a.dateTime);
          const dateB = new Date(b.dateTime);

          if (filters.sortOrder === "asc") {
            return dateA - dateB; // Earliest first
          } else {
            return dateB - dateA; // Latest first
          }
        });
    },
    [appointments, filters]
  );

  // Memoized filtered appointments for performance
  const listViewAppointments = useMemo(
    () => getFilteredAndSortedAppointments("list-view"),
    [getFilteredAndSortedAppointments]
  );

  const historyViewAppointments = useMemo(
    () => getFilteredAndSortedAppointments("history-view"),
    [getFilteredAndSortedAppointments]
  );

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    // Show confirmation modal instead of window.confirm
    const appointment = appointments.find(
      (appt) => getAppointmentId(appt) === appointmentId
    );
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      setActionLoading(true);
      const appointmentId = getAppointmentId(appointmentToDelete);
      await appointmentsApi.cancelAppointment(appointmentId);
      setAppointments((prev) =>
        prev.filter((appt) => getAppointmentId(appt) !== appointmentId)
      );
      addToast("Appointment deleted successfully", "success");
    } catch (error) {
      addToast(error.message || "Failed to delete appointment", "error");
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
      setAppointmentToDelete(null);
    }
  };

  const cancelDeleteAppointment = () => {
    setShowDeleteConfirm(false);
    setAppointmentToDelete(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setActionLoading(true);
      if (editingAppointment?._id) {
        await AppointmentService.update(editingAppointment._id, formData);
        addToast("Appointment updated successfully", "success");
      } else {
        const newAppointment = await AppointmentService.create(formData);
        setAppointments((prev) => [...prev, newAppointment]);
        addToast("Appointment created successfully", "success");
      }
      setShowAppointmentForm(false);
      setEditingAppointment(null);
      await fetchAppointments();
    } catch (error) {
      addToast(error.message || "Failed to save appointment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedEvent(appointment);
    setShowDetails(true);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleRefresh = () => {
    fetchAppointments();
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        <div className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleRefresh}
            className="p-1"
          >
            <FaSync /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
        <Row className="dashboard-header-row w-100">
          <Nav className="dashboardNavTabs poppins-medium">
            <Nav.Item>
              <Nav.Link eventKey="list-view">List View</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="history-view">History</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="appointment-calendar-content">
            {/* List View */}
            <Tab.Pane eventKey="list-view" className="mt-3">
              <div className="appointment-list-header">
                <div className="filter-controls mb-3">
                  <div className="row">
                    <div className="col-md-6">
                      <InputGroup className="search-bar">
                        <InputGroup.Text>
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search appointments..."
                          value={filters.searchQuery}
                          onChange={(e) =>
                            handleFilterChange("searchQuery", e.target.value)
                          }
                          aria-label="Search appointments"
                        />
                      </InputGroup>
                    </div>
                    <div className="col-md-3">
                      <Form.Select
                        value={filters.statusFilter}
                        onChange={(e) =>
                          handleFilterChange("statusFilter", e.target.value)
                        }
                        aria-label="Filter by status"
                      >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                      </Form.Select>
                    </div>
                    <div className="col-md-3">
                      <Form.Select
                        value={filters.sortOrder}
                        onChange={(e) =>
                          handleFilterChange("sortOrder", e.target.value)
                        }
                        aria-label="Sort appointments"
                      >
                        <option value="asc">Earliest First</option>
                        <option value="desc">Latest First</option>
                      </Form.Select>
                    </div>
                  </div>
                </div>
              </div>
              {listViewAppointments.length === 0 && (
                <div className="text-center">
                  <p>No upcoming appointments found</p>
                </div>
              )}
              {listViewAppointments.map((appointment) => (
                <AppointmentCard
                  key={getAppointmentId(appointment)}
                  professionalName={appointment.professionalName}
                  title={appointment.title}
                  dateTime={appointment.dateTime}
                  description={appointment.description}
                  status={appointment.status}
                  role={appointment.role}
                  location={appointment.location}
                  petName={appointment.petName}
                  appointmentType={appointment.appointmentType}
                  onEdit={() => handleEditAppointment(appointment)}
                  onDelete={() =>
                    handleDeleteAppointment(getAppointmentId(appointment))
                  }
                  onViewDetails={() => handleViewDetails(appointment)}
                />
              ))}
            </Tab.Pane>

            {/* History View */}
            <Tab.Pane eventKey="history-view">
              <div className="appointment-list-header">
                <h4>Appointment History</h4>
                <div className="d-flex gap-2">
                  <InputGroup className="search-bar">
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search appointments..."
                      value={filters.searchQuery}
                      onChange={(e) =>
                        handleFilterChange("searchQuery", e.target.value)
                      }
                      aria-label="Search appointment history"
                    />
                  </InputGroup>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={actionLoading}
                    aria-label="Refresh appointments"
                    className="p-2 rounded-4"
                  >
                    <FaSync /> Refresh
                  </Button>
                </div>
              </div>
              {historyViewAppointments.length === 0 && (
                <div className="text-center">
                  <p>No past appointments found</p>
                </div>
              )}
              {historyViewAppointments.map((appointment) => (
                <AppointmentCard
                  key={getAppointmentId(appointment)}
                  professionalName={appointment.professionalName}
                  title={appointment.title}
                  dateTime={appointment.dateTime}
                  description={appointment.description}
                  status={appointment.status}
                  role={appointment.role}
                  location={appointment.location}
                  petName={appointment.petName}
                  appointmentType={appointment.appointmentType}
                  onEdit={() => handleEditAppointment(appointment)}
                  onDelete={() =>
                    handleDeleteAppointment(getAppointmentId(appointment))
                  }
                  onViewDetails={() => handleViewDetails(appointment)}
                />
              ))}
            </Tab.Pane>
          </Tab.Content>
        </Row>
      </Tab.Container>

      {/* Appointment Form Modal */}
      <AppointmentForm
        show={showAppointmentForm}
        handleClose={() => {
          setShowAppointmentForm(false);
          setEditingAppointment(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAppointment}
      />

      {/* Appointment Details Modal */}
      <Modal show={showDetails} onHide={handleCloseDetails} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <AppointmentCard
              professionalName={selectedEvent.professionalName}
              title={selectedEvent.title}
              dateTime={selectedEvent.dateTime}
              description={selectedEvent.description}
              status={selectedEvent.status}
              role={selectedEvent.role}
              location={selectedEvent.location}
              petName={selectedEvent.petName}
              appointmentType={selectedEvent.appointmentType}
              onDelete={() =>
                handleDeleteAppointment(getAppointmentId(selectedEvent))
              }
              onStatusUpdate={(status) =>
                handleStatusUpdate(getAppointmentId(selectedEvent), status)
              }
              isDetailView={true}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={cancelDeleteAppointment} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-3">
              <i
                className="fas fa-exclamation-triangle text-warning"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>
            <h5>Are you sure you want to delete this appointment?</h5>
            {appointmentToDelete && (
              <div className="mt-3 p-3 bg-light rounded">
                <strong>Appointment with:</strong>{" "}
                {appointmentToDelete.professionalName}
                <br />
                <strong>Date:</strong>{" "}
                {new Date(appointmentToDelete.dateTime).toLocaleDateString()}
                <br />
                <strong>Time:</strong>{" "}
                {new Date(appointmentToDelete.dateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <br />
                <strong>Pet:</strong> {appointmentToDelete.petName}
              </div>
            )}
            <p className="text-muted mt-3">This action cannot be undone.</p>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button
            variant="secondary"
            onClick={cancelDeleteAppointment}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteAppointment}
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Delete Appointment"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AppointmentCalendar;
