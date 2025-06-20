import { useState, useEffect, useMemo, useCallback } from "react";
import { Container, InputGroup, Form, Alert, Button } from "react-bootstrap";
import { FaSearch, FaSync, FaUserMd, FaCut } from "react-icons/fa";
import { motion } from "framer-motion";
import ProfessionalCard from "@/Components/HelperComponents/ProfessionalCard/ProfessionalCard";
import ProfessionalCalendar from "@/Components/HelperComponents/ProfessionalCalendar/ProfessionalCalendar";
import PaginationBar from "@/Components/HelperComponents/PaginationBar/PaginationBar";
import LoadingSpinner from "@/Components/HelperComponents/LoadingSpinner/LoadingSpinner";
import ProfessionalService from "@/Services/localServices/professionalService";
import { useToast } from "@/context/ToastContext";
import useDebounce from "@/hooks/useDebounce";
import "./ProfessionalList.css";

const PAGE_SIZE = 10;

// Configuration for different professional types
const PROFESSIONAL_CONFIGS = {
  veterinarian: {
    title: "Our Veterinarians",
    badgeIcon: <FaUserMd className="specialization-icon me-1" />,
    badgeLabel: "Veterinarian",
    searchPlaceholder: "Search veterinarians...",
    specialtyField: "specialization",
    noResultsMessage: "No veterinarians found",
    loadingMessage: "Loading veterinarians...",
    errorMessage: "Failed to fetch veterinarians",
  },
  groomer: {
    title: "Our Groomers",
    badgeIcon: <FaCut className="specialization-icon me-1" />,
    badgeLabel: "Groomer",
    searchPlaceholder: "Search groomers...",
    specialtyField: "specialties",
    noResultsMessage: "No groomers found",
    loadingMessage: "Loading groomers...",
    errorMessage: "Failed to fetch groomers",
  },
};

const ProfessionalList = ({
  role,
  className = "",
  onProfessionalSelect,
  enableFiltering = true,
  enableSorting = true,
  customConfig = {},
}) => {
  // Get configuration for the professional type
  const config = { ...PROFESSIONAL_CONFIGS[role], ...customConfig };
  const { addToast } = useToast();

  // State management
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized fetch function
  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProfessionalService.getAll({ role });
      setProfessionals(data);
    } catch (err) {
      const errorMessage = err.message || config.errorMessage;
      setError(errorMessage);
      addToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [role, config.errorMessage, addToast]);

  // Initial data fetch
  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Search and filter logic with performance optimization
  const filteredProfessionals = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return professionals;

    const query = debouncedSearchQuery.toLowerCase();
    return professionals.filter((professional) => {
      const name = professional.name?.toLowerCase() || "";
      const qualifications = Array.isArray(professional.qualifications)
        ? professional.qualifications.join(" ").toLowerCase()
        : "";

      // Handle different specialty field structures
      let specialties = "";
      if (
        config.specialtyField === "specialties" &&
        Array.isArray(professional.specialties)
      ) {
        specialties = professional.specialties.join(" ").toLowerCase();
      } else if (
        config.specialtyField === "specialization" &&
        professional.specialization
      ) {
        specialties = professional.specialization.toLowerCase();
      }

      return (
        name.includes(query) ||
        qualifications.includes(query) ||
        specialties.includes(query)
      );
    });
  }, [professionals, debouncedSearchQuery, config.specialtyField]);

  // Sorting logic
  const sortedProfessionals = useMemo(() => {
    return [...filteredProfessionals].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "experience":
          aValue = parseInt(a.experience) || 0;
          bValue = parseInt(b.experience) || 0;
          break;
        case "rating":
          aValue = parseFloat(a.rating) || 0;
          bValue = parseFloat(b.rating) || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [filteredProfessionals, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(sortedProfessionals.length / PAGE_SIZE);
  const paginatedProfessionals = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedProfessionals.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedProfessionals, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, sortBy, sortOrder]);

  // Handlers
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSortChange = useCallback(
    (field) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    },
    [sortBy]
  );

  const handleBook = useCallback(
    (professional) => {
      setSelectedProfessional(professional);
      setShowCalendar(true);

      // Call parent callback if provided
      if (onProfessionalSelect) {
        onProfessionalSelect(professional);
      }
    },
    [onProfessionalSelect]
  );

  const handleRetry = useCallback(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const handleBackToList = useCallback(() => {
    setShowCalendar(false);
    setSelectedProfessional(null);
  }, []);

  // Render calendar view
  if (showCalendar && selectedProfessional) {
    return (
      <ProfessionalCalendar
        professional={selectedProfessional}
        onBack={handleBackToList}
      />
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <LoadingSpinner />
        <p>{config.loadingMessage}</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <div className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={handleRetry}>
            <FaSync /> Retry
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Container fluid>
        {/* Header with search and filtering */}
        <div className={`${role}-list-header`}>
          <h4
            className="poppins-light"
            style={{ color: "var(--primary-blue-color)" }}
          >
            {config.title}
          </h4>

          <div className="d-flex gap-2 align-items-center">
            <InputGroup className="search-bar">
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={config.searchPlaceholder}
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label={config.searchPlaceholder}
                aria-describedby={`${role}-search-help`}
              />
            </InputGroup>

            {enableSorting && (
              <Form.Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                style={{ width: "200px" }}
                aria-label="Sort professionals"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="experience-desc">Most Experienced</option>
                <option value="experience-asc">Least Experienced</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
              </Form.Select>
            )}
          </div>
        </div>

        {/* Results summary */}
        <div className="results-summary mb-3">
          <small className="text-muted">
            Showing {paginatedProfessionals.length} of{" "}
            {sortedProfessionals.length} {role}s
            {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
          </small>
        </div>

        {/* Professional cards */}
        <Container
          className={`${role}-list d-flex flex-wrap justify-content-center gap-4`}
        >
          {paginatedProfessionals.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">{config.noResultsMessage}</p>
              {debouncedSearchQuery && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            paginatedProfessionals.map((professional) => (
              <div
                key={professional._id || professional.id}
                className="mb-4 d-flex justify-content-center"
              >
                <ProfessionalCard
                  id={professional._id || professional.id}
                  name={professional.name}
                  specialty={
                    config.specialtyField === "specialties"
                      ? professional.specialties?.join(", ")
                      : professional.specialization
                  }
                  qualifications={professional.qualifications || []}
                  experience={professional.experience}
                  rating={professional.rating}
                  reviews={professional.reviews}
                  image={professional.image}
                  phone={professional.phone}
                  email={professional.email}
                  location={professional.location}
                  badgeIcon={config.badgeIcon}
                  badgeLabel={config.badgeLabel}
                  onBook={() => handleBook(professional)}
                />
              </div>
            ))
          )}
        </Container>

        {/* Pagination */}
        {totalPages > 1 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Screen reader help text */}
        <div id={`${role}-search-help`} className="visually-hidden">
          Search by name, qualifications, or specialties
        </div>
      </Container>
    </motion.div>
  );
};

export default ProfessionalList;
