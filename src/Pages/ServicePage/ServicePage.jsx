import React from "react";
//Asset Import
import CatKissImg from "../../assets/ServicePageAssets/catKiss.png";
import dogHugImg from "../../assets/ServicePageAssets/dogHug.png";
import dogFamily from "../../assets/ServicePageAssets/Man & woman with dogs.png";
import "./ServicePage.css";
//Component import
import { Container, Row, Col, Button } from "react-bootstrap";
import { SlBadge } from "react-icons/sl";
import ProductReviewCard from "@/Components/HelperComponents/ProductReviewCard";
const ServicePage = () => {
  return (
    <>
      <Container className="ServicePageContainer d-flex flex-column justify-content-center align-items-center">
        <Row className="rounded-4 w-100 border p-3 text-center mt-5 mb-5">
          <h3>The Service Page</h3>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laboriosam,
          aliquam vero dignissimos, culpa aspernatur eius molestiae non cum
          debitis, odit harum sunt! Ratione itaque repellendus excepturi
          architecto. In, eum nisi. Fugiat deserunt possimus, officiis et quidem
          at dignissimos magnam praesentium odio ducimus nulla maiores
          consectetur adipisci voluptate quod.
        </Row>
        <Row className="catKissBanner w-100 mt-5 mb-5">
          <img src={CatKissImg} alt="" />
        </Row>
        <Row className="Service1Description w-100 d-flex flex-wrap align-items-center p-4">
          <Col className="description1 col-12 col-lg-9 pe-lg-4 text-center text-lg-start ">
            <h5 className="mb-3">What We Do</h5>
            <p className="mb-3">
              We're a safer, more professional, and ethical alternative to sites
              like Facebook, Preloved, Pets4Homes, and Gumtree.
            </p>
            <br />
            <br />
            <p className="mb-3">
              Our platform connects potential adopters with people who need to
              rehome their pets, dogs, and cats. This makes it easier for good
              people to adopt the right pet while maximizing the chance of pets
              finding their forever home.
            </p>
            <br />
            <br />
            <p className="mb-3">
              We offer a non-judgmental service to rehomers and give them full
              control of the process. We're also helping to reduce the number of
              animals going into shelters. This frees up space and resources for
              the pets who have been abandoned, need immediate help, or require
              specialist care.
            </p>
          </Col>
          <Col className="stats1 col-12 col-lg-3 d-flex flex-column align-items-center align-items-lg-start p-3 border rounded mt-4 mt-lg-0">
            <div className="mb-3">
              <span className="fw-bold text-success">
                <SlBadge size={"1.5rem"} /> 4.2 million
              </span>{" "}
              pets Rehomed
            </div>
            <div>
              <span className="fw-bold text-success">
                <SlBadge size={"1.5rem"} /> 6.8 million
              </span>{" "}
              pets adopted
            </div>
          </Col>
        </Row>
        <Row className="catKissBanner w-100 mt-5 mb-5">
          <img src={dogHugImg} alt="" />
        </Row>
        <Row className="rounded-4 w-100 border p-3 text-center mt-5 mb-5">
          <h3>Service 2</h3>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laboriosam,
          aliquam vero dignissimos, culpa aspernatur eius molestiae non cum
          debitis, odit harum sunt! Ratione itaque repellendus excepturi
          architecto. In, eum nisi. Fugiat deserunt possimus, officiis et quidem
          at dignissimos magnam praesentium odio ducimus nulla maiores
          consectetur adipisci voluptate quod.
        </Row>
        <Row className="Service1Description w-100 d-flex flex-wrap align-items-center p-4">
          <Col className="stats1 col-12 col-lg-3 d-flex flex-column align-items-center align-items-lg-start p-3 border rounded mt-4 mt-lg-0">
            <div className="mb-3">
              <span className="fw-bold text-success">
                <SlBadge size={"1.5rem"} /> 4.2 million
              </span>{" "}
              pets Rehomed
            </div>
            <div>
              <span className="fw-bold text-success">
                <SlBadge size={"1.5rem"} /> 6.8 million
              </span>{" "}
              pets adopted
            </div>
          </Col>
          <Col className="description1 col-12 col-lg-9 pe-lg-4 text-center text-lg-end ">
            <h5 className="mb-3">What We Do</h5>
            <p className="mb-3">
              We're a safer, more professional, and ethical alternative to sites
              like Facebook, Preloved, Pets4Homes, and Gumtree.
            </p>
            <br />
            <br />
            <p className="mb-3">
              Our platform connects potential adopters with people who need to
              rehome their pets, dogs, and cats. This makes it easier for good
              people to adopt the right pet while maximizing the chance of pets
              finding their forever home.
            </p>
            <br />
            <br />
            <p className="mb-3">
              We offer a non-judgmental service to rehomers and give them full
              control of the process. We're also helping to reduce the number of
              animals going into shelters. This frees up space and resources for
              the pets who have been abandoned, need immediate help, or require
              specialist care.
            </p>
          </Col>
        </Row>
        <Row>
          <Row className="VetServices d-flex align-items-center p-3">
            <Col md={6} className="mb-3">
              <img
                src={dogFamily}
                alt="Dog Family"
                className="img-fluid rounded"
              />
            </Col>
            <Col md={6}>
              <h5 className="text-success mb-2">Our Vet Services</h5>
              <p>
                Dogs might enjoy interaction with humans, making the human-dog
                relationship (HDR) important and necessary for domestic dogs.
                This relationship has expanded into an interaction where dogs
                are not solely considered companion animals but “service
                animals” for humans with special needs such as blindness,
                deafness, locomotion problems, or various conditions such as
                cardiovascular pathologies, epilepsy, diabetes, depression, and
                autism.
              </p>
              <br />
              <br />
              <Button
                variant="success"
                type="submit"
                className="rounded-pill"
                style={{
                  backgroundColor: "#74B49B",
                  border: "none",
                  width: "fit-content",
                  paddingLeft: "2rem",
                  paddingRight: "2rem",
                }}
              >
                Book an Appointment
              </Button>
            </Col>
          </Row>
          <Row>
            <div className="text-center p-4">
              <h3 className="text-success mb-4">Our Vets on Stand By</h3>
              <Row className="justify-content-center gap-5">
                <ProductReviewCard reviewDescription=" BSc chate lisien" />
                <ProductReviewCard reviewDescription=" BSc chate lisien" />
                <ProductReviewCard reviewDescription=" BSc chate lisien" />
                <ProductReviewCard reviewDescription=" BSc chate lisien" />
                <ProductReviewCard reviewDescription=" BSc chate lisien" />
              </Row>
            </div>
          </Row>
        </Row>
      </Container>
    </>
  );
};

export default ServicePage;
