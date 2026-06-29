import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronRight, FaHome } from "react-icons/fa";
import "./Breadcrumb.css";

const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (path, active) => {
    if (path && !active) navigate(path);
  };

  // The current page is the last crumb, or any crumb whose path matches the URL.
  const isActive = (path, index) =>
    index === items.length - 1 ||
    location.pathname.toLowerCase() === (path || "").toLowerCase();

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const active = isActive(item.path, index);
        const isHome = index === 0 && /^home$/i.test(item.label || "");
        return (
          <React.Fragment key={item.path || item.label || index}>
            <button
              type="button"
              className={`breadcrumb-text${active ? " active" : ""}`}
              onClick={() => handleClick(item.path, active)}
              aria-current={active ? "page" : undefined}
            >
              {isHome && <FaHome className="breadcrumb-home" aria-hidden />}
              <span>{item.label}</span>
            </button>
            {index < items.length - 1 && (
              <FaChevronRight className="breadcrumb-sep" aria-hidden />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
