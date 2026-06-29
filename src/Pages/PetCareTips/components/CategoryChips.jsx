import { CATEGORIES, capitalize } from "../tipTheme";

const CategoryChips = ({ selected, onSelect }) => (
  <div className="pct-chip-row" role="tablist" aria-label="Filter by category">
    <button
      role="tab"
      aria-selected={!selected}
      className={`pct-chip ${selected ? "" : "on"}`}
      onClick={() => onSelect("")}
    >
      All categories
    </button>
    {CATEGORIES.map((cat) => (
      <button
        key={cat}
        role="tab"
        aria-selected={selected === cat}
        className={`pct-chip ${selected === cat ? "on" : ""}`}
        onClick={() => onSelect(cat)}
      >
        {capitalize(cat)}
      </button>
    ))}
  </div>
);

export default CategoryChips;
