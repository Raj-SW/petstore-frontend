import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container, InputGroup, Form, Alert, Button } from "react-bootstrap";
import { FaSearch, FaSync, FaUserMd, FaCut, FaCar } from "react-icons/fa";
import { motion } from "framer-motion";
import ProfessionalCard from "@/Components/HelperComponents/ProfessionalCard/ProfessionalCard";
import PaginationBar from "@/Components/HelperComponents/PaginationBar/PaginationBar";
import SkeletonCard from "@/Components/HelperComponents/SkeletonCard/SkeletonCard";
import professionalsApi from "@/Services/api/professionalsApi";
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
  trainer: {
    title: "Our Trainers",
    badgeIcon: <FaUserMd className="specialization-icon me-1" />,
    badgeLabel: "Trainer",
    searchPlaceholder: "Search trainers...",
    specialtyField: "specialties",
    noResultsMessage: "No trainer found",
    loadingMessage: "Loading trainers...",
    errorMessage: "Failed to fetch trainers",
  },
  petTaxi: {
    title: "Our Pet Taxi",
    badgeIcon: <FaCar className="specialization-icon me-1" />,
    badgeLabel: "Pet Taxi",
    searchPlaceholder: "Search pet taxi...",
    specialtyField: "specialties",
    noResultsMessage: "No pet taxi found",
    loadingMessage: "Loading pet taxi...",
    errorMessage: "Failed to fetch pet taxi",
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
  const navigate = useNavigate();

  // State management
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized fetch function
  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await professionalsApi.getProfessionalsByRole(role);
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
          aValue = Number.parseInt(a.experience) || 0;
          bValue = Number.parseInt(b.experience) || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        if (aValue > bValue) return 1;
        if (aValue < bValue) return -1;
        return 0;
      } else {
        if (aValue < bValue) return 1;
        if (aValue > bValue) return -1;
        return 0;
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

  const handleBook = useCallback(
    (professional) => {
      navigate(`/appointments/professional/${professional._id || professional.id}`);
    },
    [navigate]
  );

  const handleRetry = useCallback(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Render loading state
  if (loading) {
    return (
      <div className={className} role="status" aria-live="polite">
        <SkeletonCard variant="row" count={4} />
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
        <div className="pro-list-header">
          <h4 className="pro-list-title" style={{ color: "var(--primary-blue-color)" }}>
            {config.title}
          </h4>

          <div className="pro-list-controls">
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
                aria-label="Sort professionals"
                className="p-2 rounded-5 pro-list-sort"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="experience-desc">Most Experienced</option>
                <option value="experience-asc">Least Experienced</option>
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
          <div className="pro-list-grid">
            {paginatedProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional._id || professional.id}
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
                image={professional.profileImage?.url}
                phone={professional.phone}
                email={professional.email}
                location={professional.location}
                badgeIcon={config.badgeIcon}
                badgeLabel={config.badgeLabel}
                onBook={() => handleBook(professional)}
              />
            ))}
          </div>
        )}

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
