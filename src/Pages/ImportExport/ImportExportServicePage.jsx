import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import "./ImportExportServicePage.css";
import catflying from "../../assets/ExportImport/catflying.png";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
const ImportExportServicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Import/Export" },
  ];

  const handleApply = () => {
    if(user==null){
      addToast("You need to log in to apply for import/export service.", "warning");
      return;
    }
    navigate("/import-page");
  };
  return (
    <div className="min-vh-100 importexport-services-section">
      <Container className="pt-4 pb-2">
        <Breadcrumb items={breadcrumbItems} />
      </Container>
      {/* Hero Section */}
      <Container fluid className="py-5 importexport-hero-section">
        <Row className="align-items-center justify-content-center flex-column-reverse flex-md-row">
          <Col
            xs={12}
            md={6}
            className="mb-4 mb-md-0 d-flex flex-column align-items-start justify-content-center text-center text-md-start px-5"
          >
            <h1 className="fw-bold poppins-bold caveat-Heading mb-3 importexport-title">
              Your Pet&apos;s Health & Happiness Is Our Priority
            </h1>
            <p className="mb-4 poppins-regular importexport-desc">
              Comprehensive pet care services including import/export
              assistance, veterinary care, and more.
            </p>
            <div className="d-flex gap-2 justify-content-center justify-content-md-start w-100">
              <Button
                className="px-4 py-2 poppins-medium importexport-btn rounded-5"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </Col>
          <Col
            xs={12}
            md={6}
            className="d-flex justify-content-center mb-4 mb-md-0"
          >
            <div className="importexport-img-container">
              <img
                src={catflying}
                alt="Cat and dog traveling around the world"
                className="img-fluid importexport-img"
              />
            </div>
          </Col>
        </Row>
      </Container>

      {/* Services Section */}
      <Container className="py-5">
        <h2 className="text-center fw-bold poppins-bold caveat-Heading mb-5 importexport-services-title">
          Our Services
        </h2>
        <Row className="g-4 justify-content-center flex-wrap justify-content-md-center">
          <Col>
            <Card className="h-100 importexport-card">
              <Card.Body>
                <div className="mb-3 importexport-icon-heart">
                  <i className="bi bi-heart" />
                </div>
                <div className="importexport-card-icon-accent" />
                <Card.Text className="poppins-regular mb-3 importexport-card-text">
                  We handle all the paperwork and logistics to bring your pet
                  into the country safely and legally.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="h-100 importexport-card">
              <Card.Body>
                <div className="mb-3 importexport-icon-flag">
                  <i className="bi bi-flag" />
                </div>
                <div className="importexport-card-icon-accent" />
                <Card.Text className="poppins-regular mb-3 importexport-card-text">
                  We ensure your pet meets all requirements for travel to their
                  destination country.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="h-100 importexport-card">
              <Card.Body>
                <div className="mb-3 importexport-icon-heart">
                  <i className="bi bi-heart" />
                </div>
                <div className="importexport-card-icon-accent" />
                <Card.Text className="poppins-regular mb-3 importexport-card-text">
                  Our network of veterinarians provides comprehensive care for
                  your pets.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ImportExportServicePage;
