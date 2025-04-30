import React, { useState } from "react";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import "./SortDropdown.css"; // Import your CSS for hover styles

const SortDropDown = ({ onSort }) => {
  const [selectedSort, setSelectedSort] = useState("Sort By");

  const handleSort = (sortType) => {
    setSelectedSort(sortType);
    onSort(sortType);
  };

  return (
    <Dropdown as={ButtonGroup}>
      <Dropdown.Toggle className="sort-button" id="dropdown-sort-button">
        {selectedSort}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleSort("priceAsc")}>
          Price: Low to High
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleSort("priceDesc")}>
          Price: High to Low
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleSort("alphabeticalAsc")}>
          Alphabetical: A-Z
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleSort("alphabeticalDesc")}>
          Alphabetical: Z-A
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SortDropDown;
