import { useState } from "react";
import { FaStar, FaFilter } from "react-icons/fa";
import "./FilterComponent.css";

const CATEGORIES = ["Dog", "Cat", "Bird", "Fish", "Small Pets", "General"];
const RATINGS = [5, 4, 3, 2, 1];

const FilterComponent = ({ onApplyFilters }) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [rating, setRating] = useState("");

  const toggleCategory = (cat) =>
    setSelectedCategory((c) => (c === cat ? "" : cat));

  const apply = () => {
    onApplyFilters({
      minPrice: minPrice ? Number(minPrice) : 0,
      maxPrice: maxPrice ? Number(maxPrice) : Infinity,
      categories: selectedCategory ? [selectedCategory] : [],
      rating: rating ? Number(rating) : 0,
    });
  };

  const clear = () => {
    setMinPrice(""); setMaxPrice(""); setSelectedCategory(""); setRating("");
    onApplyFilters({ minPrice: 0, maxPrice: Infinity, categories: [], rating: 0 });
  };

  return (
    <aside className="filter-card">
      <div className="filter-card-header">
        <FaFilter size={14} />
        <h3 className="filter-card-title">Filter Products</h3>
      </div>

      {/* Category */}
      <section className="filter-section">
        <h4 className="filter-label">Category</h4>
        <div className="filter-chip-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-chip${selectedCategory === cat ? " filter-chip--active" : ""}`}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Price */}
      <section className="filter-section">
        <h4 className="filter-label">Price Range</h4>
        <div className="filter-price-row">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="filter-price-input"
          />
          <span className="filter-price-divider">—</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="filter-price-input"
          />
        </div>
      </section>

      {/* Rating */}
      <section className="filter-section">
        <h4 className="filter-label">Rating</h4>
        <div className="filter-rating-list">
          {RATINGS.map((v) => (
            <button
              key={v}
              type="button"
              className={`filter-rating-row${rating === String(v) ? " filter-rating-row--active" : ""}`}
              onClick={() => setRating(rating === String(v) ? "" : String(v))}
            >
              <span className="filter-rating-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar
                    key={i}
                    size={12}
                    className={i < v ? "filter-star filter-star--on" : "filter-star"}
                  />
                ))}
              </span>
              <span className="filter-rating-label">&amp; up</span>
            </button>
          ))}
        </div>
      </section>

      <div className="filter-actions">
        <button type="button" className="filter-btn filter-btn--primary" onClick={apply}>
          Apply Filters
        </button>
        <button type="button" className="filter-btn filter-btn--secondary" onClick={clear}>
          Clear
        </button>
      </div>
    </aside>
  );
};

export default FilterComponent;
