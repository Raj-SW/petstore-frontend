import { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import ProductService from "../../Services/localServices/ProductService";
import "./FilterComponent.css";

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const ChipGroup = ({ title, items, selected, onToggle, format = titleCase }) => {
  if (!items || items.length === 0) return null;
  return (
    <section className="filter-section">
      <h4 className="filter-label">{title}</h4>
      <div className="filter-chip-row">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-chip${selected.includes(item) ? " filter-chip--active" : ""}`}
            onClick={() => onToggle(item)}
          >
            {format(item)}
          </button>
        ))}
      </div>
    </section>
  );
};

const FilterComponent = ({ onApplyFilters }) => {
  const [options, setOptions] = useState({ categories: [], colors: [], genders: [] });
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [genders, setGenders] = useState([]);

  // Options come from real product data so labels always match stored values.
  useEffect(() => {
    let active = true;
    ProductService.fetchFilterOptions().then((o) => {
      if (active) setOptions(o);
    });
    return () => { active = false; };
  }, []);

  const toggle = (setter, list, value) =>
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const apply = () => {
    onApplyFilters({
      minPrice: minPrice ? Number(minPrice) : 0,
      maxPrice: maxPrice ? Number(maxPrice) : Infinity,
      categories,
      colors,
      genders,
    });
  };

  const clear = () => {
    setMinPrice("");
    setMaxPrice("");
    setCategories([]);
    setColors([]);
    setGenders([]);
    onApplyFilters({ minPrice: 0, maxPrice: Infinity, categories: [], colors: [], genders: [] });
  };

  return (
    <aside className="filter-card">
      <div className="filter-card-header">
        <FaFilter size={14} />
        <h3 className="filter-card-title">Filter Products</h3>
      </div>

      <ChipGroup
        title="Category"
        items={options.categories}
        selected={categories}
        onToggle={(v) => toggle(setCategories, categories, v)}
      />

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

      <ChipGroup
        title="Color"
        items={options.colors}
        selected={colors}
        onToggle={(v) => toggle(setColors, colors, v)}
      />

      <ChipGroup
        title="Gender"
        items={options.genders}
        selected={genders}
        onToggle={(v) => toggle(setGenders, genders, v)}
        format={(s) => s}
      />

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
