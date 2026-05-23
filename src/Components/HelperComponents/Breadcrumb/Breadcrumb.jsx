import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import "./Breadcrumb.css";

const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (path) => {
    if (path) navigate(path);
  };

  const isActive = (path) =>
    location.pathname.toLowerCase() === (path || "").toLowerCase();

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <button
            type="button"
            className={`breadcrumb-text${isActive(item.path) ? " active" : ""}`}
            onClick={() => handleClick(item.path)}
          >
            {item.label}
          </button>
          {index < items.length - 1 && (
            <FaChevronRight className="breadcrumb-sep" aria-hidden />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
