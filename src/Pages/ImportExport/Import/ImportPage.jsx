import { useState } from "react";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import { Container, Row, Col, Form, Button, Alert, Nav } from "react-bootstrap";
import {
  FaPlaneArrival,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import "./ImportPage.css";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
const ExportImportForm = () => {
  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Import/Export", path: "/import-export-service" },
    { label: "Apply" },
  ];
  const { addToast } = useToast();
  const { user } = useAuth();
  // Multi-step form state
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    zip: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);
  const handleSubmit = (e) => {
    e.preventDefault();
    if(user==null){
      addToast("You need to log in to apply for import/export service.", "warning");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="import-page-container" style={{ height: "fit-content" }}>
      <Container className="pt-4 pb-2">
        <Row>
          <Col>
            <Breadcrumb items={breadcrumbItems} />
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="d-flex align-items-center gap-3">
              <FaPlaneArrival size={32} />
              <h1>Apply</h1>
            </div>
            <p>
              Bringing your pet into the country? Let us handle the paperwork
              and ensure a smooth transition.
            </p>
          </Col>
        </Row>
        <Row className="mt-4" xs={1}>
          {/* Left Column: 30% */}
          <Col md={4} className="mb-4 mb-md-0">
            <div className="import-info-card">
              <div className="import-info-card-header d-flex align-items-center gap-2">
                <span>
                  <FaPlaneArrival size={22} />
                  <span>About Our Import Service</span>
                </span>
              </div>
              <div className="import-info-card-body">
                <p>
                  Our pet import service ensures a seamless transition for your
                  beloved companion when entering the country. We handle all the
                  necessary documentation, health checks, and customs
                  requirements to make the process stress-free for both you and
                  your pet.
                </p>
                <ul className="import-info-list">
                  <li>
                    <span>
                      <BsCheckCircleFill className="text-success me-2" />
                      <b>Documentation Assistance</b>
                    </span>
                    <div className="import-info-list-desc">
                      We help with all required permits, health certificates,
                      and customs forms.
                    </div>
                  </li>
                  <li>
                    <span>
                      <BsCheckCircleFill className="text-success me-2" />
                      <b>Quarantine Arrangements</b>
                    </span>
                    <div className="import-info-list-desc">
                      If required, we arrange comfortable quarantine facilities
                      for your pet.
                    </div>
                  </li>
                  <li>
                    <span>
                      <BsCheckCircleFill className="text-success me-2" />
                      <b>Customs Clearance</b>
                    </span>
                    <div className="import-info-list-desc">
                      Our team handles all customs procedures for a smooth entry
                      process.
                    </div>
                  </li>
                  <li>
                    <span>
                      <BsCheckCircleFill className="text-success me-2" />
                      <b>Transportation</b>
                    </span>
                    <div className="import-info-list-desc">
                      Safe and comfortable transport from the port of entry to
                      your location.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </Col>
          {/* Right Column: 70% */}
          <Col md={8}>
            <div className="import-form-container">
              <h2 className="import-form-title">
                Pet Import/Export Application
              </h2>
              <div className="import-form-desc mb-3">
                Please fill out the form below to apply for our pet import
                service. All fields marked with * are required.
              </div>
              <Nav
                variant="tabs"
                activeKey={step}
                className="import-form-tabs mb-4 d-flex justify-content-between"
              >
                <Nav.Item className="flex-fill text-center">
                  <Nav.Link
                    eventKey={1}
                    active={step === 1}
                    onClick={() => setStep(1)}
                  >
                    Personal
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="flex-fill text-center">
                  <Nav.Link
                    eventKey={2}
                    active={step === 2}
                    onClick={() => setStep(2)}
                  >
                    Pet Details
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="flex-fill text-center">
                  <Nav.Link
                    eventKey={3}
                    active={step === 3}
                    onClick={() => setStep(3)}
                  >
                    Import Info
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="flex-fill text-center">
                  <Nav.Link
                    eventKey={4}
                    active={step === 4}
                    onClick={() => setStep(4)}
                  >
                    Health & Docs
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              {submitted ? (
                <Alert
                  variant="success"
                  className="d-flex align-items-center gap-2"
                >
                  <FaCheckCircle size={24} className="text-success" />
                  Your application has been submitted! We will contact you soon.
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>
                            Are you importing or exporting? *
                          </Form.Label>
                          <div className="d-flex gap-4 mt-2">
                            <Form.Check
                              type="radio"
                              label="Import"
                              name="importOrExport"
                              id="importOrExport-import"
                              value="Import"
                              checked={form.importOrExport === "Import"}
                              onChange={handleChange}
                              required
                            />
                            <Form.Check
                              type="radio"
                              label="Export"
                              name="importOrExport"
                              id="importOrExport-export"
                              value="Export"
                              checked={form.importOrExport === "Export"}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>First Name *</Form.Label>
                          <Form.Control
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Last Name *</Form.Label>
                          <Form.Control
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Phone Number *</Form.Label>
                          <Form.Control
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Address *</Form.Label>
                          <Form.Control
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>City *</Form.Label>
                          <Form.Control
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Country *</Form.Label>
                          <Form.Select
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select country</option>
                            <option value="USA">USA</option>
                            <option value="Canada">Canada</option>
                            <option value="UK">UK</option>
                            <option value="Australia">Australia</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Postal Code *</Form.Label>
                          <Form.Control
                            name="zip"
                            value={form.zip}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col
                        md={12}
                        className="d-flex justify-content-end next-button"
                      >
                        <Button
                          onClick={handleNext}
                          className="rounded-5 px-4 py-2"
                          style={{
                            backgroundColor: "var(--primary-blue-color)",
                            borderColor: "var(--primary-blue-color)",
                            color: "white",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.2)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                          }}
                        >
                          Next <FaArrowRight className="ms-1" />
                        </Button>
                      </Col>
                    </Row>
                  )}
                  {step === 2 && (
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Pet Name *</Form.Label>
                          <Form.Control
                            name="petName"
                            value={form.petName || ""}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Pet Type *</Form.Label>
                          <Form.Select
                            name="petType"
                            value={form.petType || ""}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select pet type</option>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Bird">Bird</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Breed *</Form.Label>
                          <Form.Control
                            name="breed"
                            value={form.breed || ""}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Age *</Form.Label>
                          <Form.Control
                            name="age"
                            value={form.age || ""}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Gender *</Form.Label>
                          <div className="d-flex gap-4 mt-2">
                            <Form.Check
                              type="radio"
                              label="Male"
                              name="gender"
                              id="gender-male"
                              value="Male"
                              checked={form.gender === "Male"}
                              onChange={handleChange}
                              required
                            />
                            <Form.Check
                              type="radio"
                              label="Female"
                              name="gender"
                              id="gender-female"
                              value="Female"
                              checked={form.gender === "Female"}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <div className="p-3 border rounded bg-dark-subtle">
                            <Form.Check
                              type="checkbox"
                              label={
                                <span>
                                  <b>Is your pet microchipped?</b> *
                                </span>
                              }
                              name="microchipped"
                              id="microchipped"
                              checked={!!form.microchipped}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  microchipped: e.target.checked,
                                }))
                              }
                            />
                            <div className="text-secondary small ms-4 mt-1">
                              Most countries require pets to be microchipped
                              before import.
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>
                            Microchip Number (if applicable)
                          </Form.Label>
                          <Form.Control
                            name="microchipNumber"
                            value={form.microchipNumber || ""}
                            onChange={handleChange}
                            placeholder="123456789012345"
                          />
                          <div className="text-secondary small mt-1">
                            The microchip number is usually 15 digits long.
                          </div>
                        </Form.Group>
                      </Col>
                      <Col
                        md={12}
                        className="d-flex justify-content-between mt-3"
                      >
                        <Button
                          onClick={handlePrev}
                          className="rounded-5 px-4 py-2"
                          style={{
                            backgroundColor: "var(--primary-blue-color)",
                            borderColor: "var(--primary-blue-color)",
                            color: "white",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.2)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                          }}
                        >
                          <FaArrowLeft className="me-1" /> Previous
                        </Button>
                        <Button
                          onClick={handleNext}
                          className="rounded-5 px-4 py-2"
                          style={{
                            backgroundColor: "var(--primary-blue-color)",
                            borderColor: "var(--primary-blue-color)",
                            color: "white",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.2)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                          }}
                        >
                          Next <FaArrowRight className="ms-1" />
                        </Button>
                      </Col>
                    </Row>
                  )}
                  {step === 3 && (
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Origin Country *</Form.Label>
                          <Form.Select
                            name="originCountry"
                            value={form.originCountry || ""}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select country</option>
                            <option value="USA">USA</option>
                            <option value="Canada">Canada</option>
                            <option value="UK">UK</option>
                            <option value="Australia">Australia</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                          <div className="text-secondary small mt-1">
                            The country your pet is coming from.
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Destination Country *</Form.Label>
                          <Form.Select
                            name="destinationCountry"
                            value={form.destinationCountry || ""}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select country</option>
                            <option value="USA">USA</option>
                            <option value="Canada">Canada</option>
                            <option value="UK">UK</option>
                            <option value="Australia">Australia</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                          <div className="text-secondary small mt-1">
                            The country your pet is traveling to.
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Estimated Arrival Date *</Form.Label>
                          <Form.Control
                            type="date"
                            name="arrivalDate"
                            value={form.arrivalDate || ""}
                            onChange={handleChange}
                            required
                          />
                          <div className="text-secondary small mt-1">
                            Please select a date within the next 6 months.
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Transport Method *</Form.Label>
                          <Form.Select
                            name="transportMethod"
                            value={form.transportMethod || ""}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select transport method</option>
                            <option value="Air">Air</option>
                            <option value="Sea">Sea</option>
                            <option value="Land">Land</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Purpose of Import *</Form.Label>
                          <Form.Select
                            name="importPurpose"
                            value={form.importPurpose || ""}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select purpose</option>
                            <option value="Personal">Personal</option>
                            <option value="Breeding">Breeding</option>
                            <option value="Show">Show</option>
                            <option value="Relocation">Relocation</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col
                        md={12}
                        className="d-flex justify-content-between mt-3"
                      >
                        <Button
                          onClick={handlePrev}
                          className="rounded-5 px-4 py-2"
                          style={{
                            backgroundColor: "var(--primary-blue-color)",
                            borderColor: "var(--primary-blue-color)",
                            color: "white",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.2)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                          }}
                        >
                          <FaArrowLeft className="me-1" /> Previous
                        </Button>
                        <Button
                          onClick={handleNext}
                          className="rounded-5 px-4 py-2"
                          style={{
                            backgroundColor: "var(--primary-blue-color)",
                            borderColor: "var(--primary-blue-color)",
                            color: "white",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.2)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                          }}
                        >
                          Next <FaArrowRight className="ms-1" />
                        </Button>
                      </Col>
                    </Row>
                  )}
                  {step === 4 && (
                    <Row className="g-3">
                      <Col md={12}>
                        <div className="p-3 border rounded mb-3 bg-white bg-opacity-10">
                          <Form.Check
                            type="checkbox"
                            label={
                              <span>
                                <b>Is your pet vaccinated against rabies?</b>
                              </span>
                            }
                            name="rabiesVaccinated"
                            id="rabiesVaccinated"
                            checked={!!form.rabiesVaccinated}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                rabiesVaccinated: e.target.checked,
                              }))
                            }
                          />
                          <div className="text-secondary small ms-4 mt-1">
                            Most countries require rabies vaccination at least
                            21 days before travel.
                          </div>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="p-3 border rounded mb-3 bg-white bg-opacity-10">
                          <Form.Check
                            type="checkbox"
                            label={
                              <span>
                                <b>
                                  Do you have a veterinary health certificate?
                                </b>
                              </span>
                            }
                            name="healthCertificate"
                            id="healthCertificate"
                            checked={!!form.healthCertificate}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                healthCertificate: e.target.checked,
                              }))
                            }
                          />
                          <div className="text-secondary small ms-4 mt-1">
                            This document must be issued within 10 days of
                            travel.
                          </div>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="p-3 border rounded mb-3 bg-white bg-opacity-10">
                          <Form.Check
                            type="checkbox"
                            label={
                              <span>
                                <b>Does your pet have a pet passport?</b>
                              </span>
                            }
                            name="petPassport"
                            id="petPassport"
                            checked={!!form.petPassport}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                petPassport: e.target.checked,
                              }))
                            }
                          />
                          <div className="text-secondary small ms-4 mt-1">
                            Pet passports are accepted from certain countries.
                          </div>
                        </div>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Additional Information
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="additionalInfo"
                            value={form.additionalInfo || ""}
                            onChange={handleChange}
                            placeholder="Please provide any additional information about your pet's health, special requirements, or other details that may be relevant."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <div className="p-3 border rounded mb-3 bg-white bg-opacity-10">
                          <Form.Check
                            type="checkbox"
                            label={
                              <span>
                                <b>I agree to the terms and conditions *</b>
                              </span>
                            }
                            name="agreeTerms"
                            id="agreeTerms"
                            checked={!!form.agreeTerms}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                agreeTerms: e.target.checked,
                              }))
                            }
                            required
                          />
                          <div className="text-secondary small ms-4 mt-1">
                            By checking this box, you agree to our{" "}
                            <a
                              href="/terms"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                              href="/privacy"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Privacy Policy
                            </a>
                            .
                          </div>
                        </div>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Upload Health & Import Documents
                          </Form.Label>
                          <Form.Control
                            type="file"
                            name="uploadDocs"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              setForm((f) => ({ ...f, uploadDocs: files }));
                            }}
                          />
                          {form.uploadDocs && form.uploadDocs.length > 0 && (
                            <ul
                              className="mt-2"
                              style={{ listStyle: "none", paddingLeft: 0 }}
                            >
                              {form.uploadDocs.map((file, idx) => (
                                <li
                                  key={idx}
                                  className="d-flex align-items-center gap-2 mb-1"
                                >
                                  <span className="text-success">
                                    {file.name}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    className="rounded-5"
                                    style={{
                                      transition: "all 0.3s ease",
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.transform =
                                        "translateY(-2px)";
                                      e.currentTarget.style.boxShadow =
                                        "0 4px 8px rgba(0,0,0,0.2)";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.transform =
                                        "translateY(0)";
                                      e.currentTarget.style.boxShadow =
                                        "0 2px 4px rgba(0,0,0,0.1)";
                                    }}
                                    onClick={() => {
                                      setForm((f) => ({
                                        ...f,
                                        uploadDocs: f.uploadDocs.filter(
                                          (_, i) => i !== idx
                                        ),
                                      }));
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="text-secondary small mt-1">
                            Upload health certificates, vaccination records, or
                            other relevant documents (PDF, JPG, PNG).
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={12} className="d-flex justify-content-end mt-3">
                        <Button
                          type="submit"
                          className="rounded-5 px-4 py-2"
                          style={{
                            backgroundColor: "var(--primary-blue-color)",
                            borderColor: "var(--primary-blue-color)",
                            color: "white",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.2)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                          }}
                        >
                          Submit Application
                        </Button>
                      </Col>
                    </Row>
                  )}
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ExportImportForm;
