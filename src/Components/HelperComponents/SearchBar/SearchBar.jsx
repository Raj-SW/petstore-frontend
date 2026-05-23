import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = ({ showInPages = ["/petshop", "/product"] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const sanitizeInput = (input) => input.replace(/[<>]/g, "").trim().slice(0, 100);

  const debouncedSearch = useCallback(
    (query) => {
      const sanitized = sanitizeInput(query);
      if (sanitized) {
        setIsLoading(true);
        setTimeout(() => {
          navigate(`/petshop?search=${encodeURIComponent(sanitized)}`);
          setIsLoading(false);
        }, 200);
      }
    },
    [navigate]
  );

  const handleSearch = () => debouncedSearch(searchQuery);
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  const shouldShow = showInPages.some((path) =>
    location.pathname.toLowerCase().includes(path.toLowerCase())
  );
  if (!shouldShow) return null;

  return (
    <div className="search-wrapper" role="search" aria-label="Search products">
      <FaSearch className="search-leading-icon" aria-hidden />
      <input
        type="text"
        placeholder="Search for products..."
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
        type="button"
      >
        {isLoading ? "..." : "Search"}
      </button>
    </div>
  );
};

export default SearchBar;
