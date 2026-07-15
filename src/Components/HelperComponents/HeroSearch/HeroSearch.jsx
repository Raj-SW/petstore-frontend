import { FiSearch } from "react-icons/fi";
import "./HeroSearch.css";

/** The standard site search pill — used in every page hero that searches. */
const HeroSearch = ({ value, onChange, placeholder = "Search…", onSubmit, ariaLabel = "Search" }) => (
  <div className="hero-search">
    <FiSearch size={17} aria-hidden="true" />
    <input
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter" && onSubmit) onSubmit(value); }}
    />
  </div>
);

export default HeroSearch;
