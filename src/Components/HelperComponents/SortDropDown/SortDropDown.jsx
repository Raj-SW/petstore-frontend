import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown, FaSort } from "react-icons/fa";
import "./SortDropDown.css";

const OPTIONS = [
  { key: "priceAsc",         label: "Price: Low to High" },
  { key: "priceDesc",        label: "Price: High to Low" },
  { key: "alphabeticalAsc",  label: "Alphabetical: A–Z" },
  { key: "alphabeticalDesc", label: "Alphabetical: Z–A" },
];

const SortDropDown = ({ onSort }) => {
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClickOut = (e) => {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, [open]);

  const pick = (opt) => {
    setSelected(opt);
    setOpen(false);
    onSort(opt.key);
  };

  return (
    <div className="sort-wrap" ref={wrapRef}>
      <button
        type="button"
        className="sort-btn"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <FaSort size={13} />
        <span>{selected ? selected.label : "Sort By"}</span>
        <FaChevronDown size={11} className={`sort-chev${open ? " open" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            className="sort-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            {OPTIONS.map((opt) => (
              <li
                key={opt.key}
                role="option"
                aria-selected={selected?.key === opt.key}
                className={`sort-item${selected?.key === opt.key ? " sort-item--active" : ""}`}
                tabIndex={0}
                onClick={() => pick(opt)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(opt); } }}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SortDropDown;
