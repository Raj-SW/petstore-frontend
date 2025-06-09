import { useState, useEffect } from "react";
import { Container, InputGroup, Form } from "react-bootstrap";
import { FaSearch, FaUserMd } from "react-icons/fa";
import { motion } from "framer-motion";
import ProfessionalCard from "@/Components/HelperComponents/ProfessionalCard/ProfessionalCard";
import ProfessionalCalendar from "@/Components/HelperComponents/ProfessionalCalendar/ProfessionalCalendar";
import PaginationBar from "@/Components/HelperComponents/PaginationBar/PaginationBar";
import ProfessionalService from "@/Services/localServices/professionalService";
import "./VeterinarianList.css";

const PAGE_SIZE = 10;

const VeterinarianList = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      setLoading(true);
      const data = await ProfessionalService.getAll({
        role: "veterinarian",
      });
      setVets(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch veterinarians \n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter vets based on search query
  const filteredVets = vets.filter((vet) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vet.name.toLowerCase().includes(query) ||
      (vet.specialization &&
        vet.specialization.toLowerCase().includes(query)) ||
      (vet.qualifications &&
        vet.qualifications.join(" ").toLowerCase().includes(query))
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVets.length / PAGE_SIZE);
  const paginatedVets = filteredVets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleBook = (vet) => {
    setSelectedVet(vet);
    setShowCalendar(true);
  };

  if (showCalendar) {
    return (
      <ProfessionalCalendar
        professional={selectedVet}
        onBack={() => setShowCalendar(false)}
      />
    );
  }

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading veterinarians...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container fluid>
        <div className="veterinarian-list-header ">
          <h4
            className="poppins-light"
            style={{ color: "var(--primary-blue-color)" }}
          >
            Our Veterinarians
          </h4>
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
          {paginatedVets.map((vet) => (
            <div key={vet._id} className="mb-4 d-flex justify-content-center">
              <ProfessionalCard
                id={vet._id}
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
                onBook={() => handleBook(vet)}
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

export default VeterinarianList;
