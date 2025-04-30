import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./MenuDropdown.css";

const MenuDropdown = () => {
  return (
    <>
      <Container className="CardDropDown-Wrapper bg-white p-4 ">
        <Row>
          <Col>
            <h6 className="fw-bold">+ Element List 1</h6>
            <ul className="list-unstyled">
              <li>Interactive Banner 2</li>
              <li>Just Icon</li>
              <li>Info Box</li>
              <li>Info List</li>
              <li>Info Table</li>
              <li>Overlay Effects</li>
              <li>Dual Button</li>
              <li>Text SlideUp Effect</li>
            </ul>
          </Col>
          <Col>
            <h6 className="fw-bold">+ Element List 2</h6>
            <ul className="list-unstyled">
              <li>Flip Box</li>
              <li>Interactive Banners</li>
              <li>Highlight Box</li>
              <li>Heading</li>
              <li>Animation Block</li>
              <li>Advanced Button</li>
              <li>Row Separator</li>
              <li>IHover</li>
            </ul>
          </Col>
          <Col>
            <h6 className="fw-bold">+ Element List 3</h6>
            <ul className="list-unstyled">
              <li>Timeline</li>
              <li>Info Banner</li>
              <li>Stats Counter</li>
              <li>Creative Link</li>
              <li>Modal</li>
              <li>Google Maps</li>
              <li>Font Icon Manager</li>
              <li>Gradient Background</li>
            </ul>
          </Col>
          <Col>
            <h6 className="fw-bold">+ Element List 4</h6>
            <ul className="list-unstyled">
              <li>Google Trends</li>
              <li>Count Down Timer</li>
              <li>Info Circle</li>
              <li>Price Box</li>
              <li>Advanced Carousel</li>
              <li>Image Separator</li>
              <li>Google Fonts Manager</li>
              <li>Text Type Effect</li>
            </ul>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MenuDropdown;
