import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const sanitizeInput = (input) => input.replace(/[<>]/g, "").trim().slice(0, 100);

/**
 * Reusable search bar (design-system, token-styled).
 *
 * Props:
 * - placeholder
 * - onSearch(query): called on submit (and with "" on clear). When provided, no navigation happens.
 * - searchPath: navigation target when no onSearch is given (default behaviour — Pet Shop search).
 * - showInPages: back-compat — when provided, the bar only renders on those paths.
 */
const SearchBar = ({
  placeholder = "Search for products...",
  onSearch,
  searchPath = "/petshop",
  showInPages,
  className,
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");

  const submit = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const q = sanitizeInput(query);
    if (!q) return;
    if (typeof onSearch === "function") onSearch(q);
    else navigate(`${searchPath}?search=${encodeURIComponent(q)}`);
  };

  const clear = () => {
    setQuery("");
    if (typeof onSearch === "function") onSearch("");
  };

  // Back-compat: when showInPages is supplied, only render on those paths.
  if (Array.isArray(showInPages)) {
    const shouldShow = showInPages.some((p) =>
      location.pathname.toLowerCase().includes(p.toLowerCase())
    );
    if (!shouldShow) return null;
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        "flex items-center w-full max-w-lg rounded-full border border-input bg-card px-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring",
        className
      )}
    >
      <Search size={18} className="ml-2 shrink-0 text-content-muted" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
        autoFocus={autoFocus}
        className="w-full bg-transparent px-2 py-2.5 text-sm text-foreground outline-none placeholder:text-content-soft"
      />
      {query && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="mr-1 p-1 text-content-muted hover:text-foreground"
        >
          <X size={16} />
        </button>
      )}
      <button
        type="submit"
        className="mr-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
