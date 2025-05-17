import React, { useState, useEffect } from "react";
import { Container, Row, Col, InputGroup, Form } from "react-bootstrap";
import { FaSearch, FaCut } from "react-icons/fa";
import { motion } from "framer-motion";
import ProfessionalCard from "@/Components/HelperComponents/ProfessionalCard/ProfessionalCard";
import ProfessionalCalendar from "@/Components/HelperComponents/ProfessionalCalendar/ProfessionalCalendar";
import PaginationBar from "@/Components/HelperComponents/PaginationBar/PaginationBar";
import { groomerService } from "@/Services/localServices/groomerService";
import "./GroomerList.css";

const PAGE_SIZE = 10;

const GroomerList = () => {
  const [groomers, setGroomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedGroomer, setSelectedGroomer] = useState(null);

  useEffect(() => {
    fetchGroomers();
  }, []);

  const fetchGroomers = async () => {
    try {
      setLoading(true);
      const data = await groomerService.getAll();
      setGroomers(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch groomers");
      console.error("Error fetching groomers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter groomers based on search query
  const filteredGroomers = groomers.filter((groomer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      groomer.name.toLowerCase().includes(query) ||
      (groomer.specialties &&
        groomer.specialties.join(" ").toLowerCase().includes(query)) ||
      (groomer.qualifications &&
        groomer.qualifications.join(" ").toLowerCase().includes(query))
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredGroomers.length / PAGE_SIZE);
  const paginatedGroomers = filteredGroomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleBook = (groomer) => {
    setSelectedGroomer(groomer);
    setShowCalendar(true);
  };

  if (showCalendar) {
    return (
      <ProfessionalCalendar
        professional={selectedGroomer}
        onBack={() => setShowCalendar(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading groomers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container fluid>
        <div className="groomer-list-header">
          <h4 className="poppins-light" style={{ color: "#5C8D89" }}>
            Our Groomers
          </h4>{" "}
          <InputGroup className="search-bar">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search groomers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>

        <Container className="groomer-list d-flex flex-wrap justify-content-center gap-4">
          {paginatedGroomers.map((groomer) => (
            <div
              key={groomer.id}
              className="mb-4 d-flex justify-content-center"
            >
              <ProfessionalCard
                name={groomer.name}
                specialty={groomer.specialties?.join(", ")}
                qualifications={groomer.qualifications || []}
                experience={groomer.experience}
                rating={groomer.rating}
                reviews={groomer.reviews}
                image={groomer.image}
                phone={groomer.phone}
                email={groomer.email}
                location={groomer.location}
                badgeIcon={<FaCut className="specialization-icon me-1" />}
                badgeLabel="Groomer"
                onBook={() => handleBook(groomer)}
              />
            </div>
          ))}
        </Container>
        {/* Pagination Controls */}
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Container>
    </motion.div>
  );
};

export default GroomerList;
