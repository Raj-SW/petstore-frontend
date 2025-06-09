import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = ({ showInPages = ["/PetShop", "/product"] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sanitize and validate search input
  const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, "").trim().slice(0, 100);
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    (query) => {
      const sanitizedQuery = sanitizeInput(query);
      if (sanitizedQuery) {
        setIsLoading(true);
        // Simulate API delay
        setTimeout(() => {
          navigate(`/PetShop?search=${encodeURIComponent(sanitizedQuery)}`);
          setIsLoading(false);
        }, 200);
      }
    },
    [navigate]
  );

  const handleSearch = () => {
    debouncedSearch(searchQuery);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Check if current path is in showInPages array
  const shouldShow = showInPages.some((path) =>
    location.pathname.includes(path)
  );

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="search-wrapper" role="search" aria-label="Search products">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="search-input"
        aria-label="Search input"
        maxLength={100}
        disabled={isLoading}
      />
      <button
        onClick={handleSearch}
        className="search-button"
        aria-label="Search"
        disabled={isLoading}
      >
        <FaSearch className="search-icon" />
      </button>
      {isLoading && <span className="visually-hidden">Searching...</span>}
    </div>
  );
};

export default SearchBar;
