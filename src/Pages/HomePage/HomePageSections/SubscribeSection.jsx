import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import "./SubscribeSection.css";
const SubscribeSection = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <div className="p-3">
        <Container className="subscribe-section-wrapper p-4">
          <Row className="align-items-center">
            {/* Left Text Column */}
            <Col md={6} className="mb-3 mb-md-0">
              <h4 className="subscribe-heading caveat-Heading fs-3">
                Register Now So You Don't Miss Our Programs
              </h4>
            </Col>

            {/* Right Form Column */}
            <Col md={6}>
              <Form className="d-flex flex-column flex-md-row">
                <Form.Group
                  controlId="formBasicEmail"
                  className="flex-grow-1 mb-3 mb-md-0"
                >
                  <Form.Control
                    type="email"
                    placeholder="Enter your Email"
                    className="form-input"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  className="subscribe-btn"
                >
                  Subscribe Now
                </Button>
                <Button
                  variant="primary"
                  onClick={handleShow}
                  className="subscribe-btn"
                >
                  Leave us a Feedback
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Leave a Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="formFirstName">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control type="text" placeholder="Name" />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="formLastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control type="text" placeholder="Last Name" />
                </Form.Group>
              </div>
            </div>

            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Email" />
            </Form.Group>

            <Form.Group controlId="formPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" placeholder="Phone" />
            </Form.Group>

            <Form.Group controlId="formMessage">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Message" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Envoyer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SubscribeSection;
