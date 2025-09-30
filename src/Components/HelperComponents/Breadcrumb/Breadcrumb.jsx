import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CaretDownIcon } from "@radix-ui/react-icons";
import "./Breadcrumb.css";

const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span onClick={() => handleClick(item.path)}>
            <p
              className={`breadcrumb-text poppins-medium fs-6 ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              {item.label}
            </p>
          </span>
          {index < items.length - 1 && (
            <CaretDownIcon
              className="CaretDownBreadCrumb"
              aria-hidden
              style={{
                width: "1.5rem",
                height: "1.5rem",
                color: "var(--neutral-color-60)",
                transform: "rotate(-90deg)",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
