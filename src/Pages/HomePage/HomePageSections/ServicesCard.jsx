import { Container, Row, Col } from "react-bootstrap";
import "./ServicesCard.css";
import imgGrooming from "../../assets/ServicesCardAssets/serviceImg1.png";
import imgVeterinary from "../../assets/ServicesCardAssets/serviceImg2.png";
import imgBoarding from "../../assets/ServicesCardAssets/serviceImg3.png";
import imgTraining from "../../assets/ServicesCardAssets/serviceImg4.png";
import imgAdoption from "../../assets/ServicesCardAssets/serviceImg5.png";
const services = [
  { name: "Grooming", image: imgGrooming },
  { name: "Boarding", image: imgBoarding },
  { name: "Veterinary", image: imgVeterinary },
  { name: "Training", image: imgTraining },
  { name: "Adoption", image: imgAdoption },
];

const ServiceCard = ({ name, image }) => (
  <Col xs={12} md={6} lg={4} className="mb-4">
    <div className="service-card">
      <img src={image} alt={name} className="img-fluid" />
    </div>
  </Col>
);

const ServicesGrid = () => (
  <Container>
    <Row>
      {services.map((service) => (
        <ServiceCard key={service.name} {...service} />
      ))}
    </Row>
  </Container>
);

export default ServicesGrid;
