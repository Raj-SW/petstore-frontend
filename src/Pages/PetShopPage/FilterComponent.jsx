import React, { useState } from "react";
import { Container, Form, Row, Col, Button } from "react-bootstrap";
import "./FilterComponent.css";
const FilterComponent = ({ onApplyFilters }) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [rating, setRating] = useState("");

  const categories = ["Dog", "Cat", "Bird", "Fish", "Small Pets", "General"];

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handleApplyFilters = () => {
    const filters = {
      minPrice: minPrice || 0,
      maxPrice: maxPrice || Infinity,
      categories: selectedCategories,
      rating: rating || 0,
    };
    onApplyFilters(filters);
  };

  return (
    <Container className="filter-container">
      <h5 className=" poppins-medium fs-5 secondary-color-font">
        Filter Products
      </h5>

      {/* Category Filter */}
      <div className="filter-section mb-4">
        <h6 className="poppins-medium secondary-color-font">Category</h6>
        <Form>
          {categories.map((category) => (
            <Form.Check
              key={category}
              type="checkbox"
              label={category}
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
              className="poppins-medium secondary-color-font"
            />
          ))}
        </Form>
      </div>

      {/* Price Filter */}
      <div className="filter-section mb-4">
        <h6 className="poppins-medium secondary-color-font">Price</h6>
        <Row>
          <Col>
            <Form.Control
              min={0}
              max={maxPrice}
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="poppins-regular secondary-color-font"
              style={{ outline: `1px solid var(--secondary-color)` }}
            />
          </Col>
          <Col>
            <Form.Control
              min={minPrice}
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="poppins-regular secondary-color-font"
              style={{ outline: `1px solid var(--secondary-color)` }}
            />
          </Col>
        </Row>
      </div>

      {/* Rating Filter */}
      <div className="filter-section mb-4">
        <h6 className="poppins-medium secondary-color-font">Rating</h6>
        <Form>
          {[5, 4, 3, 2, 1].map((value) => (
            <Form.Check
              key={value}
              type="radio"
              label={`${value} stars & up`}
              name="rating"
              value={value}
              checked={rating === `${value}`}
              onChange={(e) => setRating(e.target.value)}
              className="poppins-regular secondary-color-font"
            />
          ))}
        </Form>
      </div>

      {/* <Button variant="primary" onClick={handleApplyFilters}>
        Apply Filters
      </Button> */}
      <Button onClick={handleApplyFilters} className="rounded-5 filter-btn">
        Apply Filters
      </Button>
    </Container>
  );
};

export default FilterComponent;
