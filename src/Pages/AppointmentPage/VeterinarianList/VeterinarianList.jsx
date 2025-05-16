import React, { useState, useEffect } from "react";
import { Container, Row, Col, InputGroup, Form } from "react-bootstrap";
import { FaSearch, FaUserMd } from "react-icons/fa";
import { motion } from "framer-motion";
import VeterinarianCard from "@/Components/HelperComponents/ProfessionalCard/ProfessionalCard";
import { veterinarianService } from "@/Services/localServices/veterinarianService";
import "./VeterinarianList.css";

const VeterinarianList = () => {
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchVeterinarians();
  }, []);

  const fetchVeterinarians = async () => {
    try {
      setLoading(true);
      const data = await veterinarianService.getAll();
      setVeterinarians(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch veterinarians");
      console.error("Error fetching veterinarians:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter veterinarians based on search query
  const filteredVeterinarians = veterinarians.filter((vet) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vet.name.toLowerCase().includes(query) ||
      vet.specialization.toLowerCase().includes(query) ||
      vet.qualifications.some((qual) => qual.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading veterinarians...</p>
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
        <div className="veterinarian-list-header">
          <h4>Our Veterinarians</h4>
          <InputGroup className="search-bar">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search veterinarians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>

        <Container className="veterinarian-list d-flex flex-wrap justify-content-center gap-4">
          {filteredVeterinarians.map((vet) => (
            <div key={vet.id} className="">
              <VeterinarianCard
                name={vet.name}
                specialty={vet.specialization}
                qualifications={vet.qualifications}
                experience={vet.experience}
                rating={vet.rating}
                reviews={vet.reviews}
                image={vet.image}
                phone={vet.phone}
                email={vet.email}
                location={vet.location}
                badgeIcon={<FaUserMd className="specialization-icon me-1" />}
                badgeLabel="Veterinarian"
                onBook={() => {
                  // Handle booking appointment
                  console.log("Book appointment for:", vet.name);
                }}
              />
            </div>
          ))}
        </Container>
      </Container>
    </motion.div>
  );
};

export default VeterinarianList;
