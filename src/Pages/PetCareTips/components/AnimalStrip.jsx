import { ANIMAL_TYPES, ALL_ANIMALS_OPTION } from "../tipTheme";

const AnimalStrip = ({ selected, onSelect }) => {
  const options = [ALL_ANIMALS_OPTION, ...ANIMAL_TYPES];
  return (
    <div className="pct-animal-strip" role="tablist" aria-label="Filter by animal">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = selected === opt.value;
        return (
          <button
            key={opt.value || "all"}
            role="tab"
            aria-selected={active}
            className={`pct-animal-pill ${active ? "active" : ""}`}
            onClick={() => onSelect(opt.value)}
          >
            <Icon size={15} aria-hidden="true" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AnimalStrip;
