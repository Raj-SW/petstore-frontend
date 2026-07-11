import { useState, useRef, useEffect, useId } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import "./CreatableTagSelect.css";

/**
 * CreatableTagSelect — multi-value tag input with dropdown suggestions.
 *
 * Props:
 *   value       string[]    Selected values (controlled)
 *   onChange    fn          (string[]) => void
 *   options     string[]    Existing suggestions shown in dropdown
 *   placeholder string      Placeholder when empty
 *   label       string      Field label
 *   required    bool        Shows asterisk next to label
 *   hint        string      Small helper text below the control
 */
const CreatableTagSelect = ({
  value = [],
  onChange,
  options = [],
  placeholder = "Select or create…",
  label,
  required,
  hint,
}) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const listRef = useRef(null);
  const uid = useId();

  const inputTrimmed = input.trim();

  // Options not already selected, filtered by current input
  const filtered = options
    .filter((o) => !value.some((v) => v.toLowerCase() === o.toLowerCase()))
    .filter((o) => !input || o.toLowerCase().includes(input.toLowerCase()));

  // Offer "Create" when input doesn't match any existing option or selected value
  const showCreate =
    inputTrimmed.length > 0 &&
    !options.some((o) => o.toLowerCase() === inputTrimmed.toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === inputTrimmed.toLowerCase());

  const dropdownItems = [...filtered, ...(showCreate ? ["__create__"] : [])];

  const commit = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (val) => {
    onChange(value.filter((v) => v !== val));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, dropdownItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
      case ",":
        e.preventDefault();
        if (dropdownItems.length > 0) {
          const item = dropdownItems[highlighted];
          commit(item === "__create__" ? inputTrimmed : item);
        } else if (inputTrimmed) {
          commit(inputTrimmed);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
      case "Backspace":
        if (!input && value.length > 0) remove(value[value.length - 1]);
        break;
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset highlight whenever the list content changes
  useEffect(() => { setHighlighted(0); }, [input, open]);

  // Keep highlighted item visible in scrollable dropdown
  useEffect(() => {
    listRef.current?.children[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const listId = `cts-list-${uid}`;

  return (
    <div className="cts-wrapper" ref={wrapRef}>
      {label && (
        <span className="admin-label">
          {label}{required && <span className="admin-required"> *</span>}
        </span>
      )}

      <div
        className={`cts-control${open ? " cts-control--open" : ""}`}
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        {value.map((v) => (
          <span key={v} className="cts-tag">
            {v}
            <button
              type="button"
              className="cts-tag-remove"
              onClick={(e) => { e.stopPropagation(); remove(v); }}
              aria-label={`Remove ${v}`}
            >
              <FiX size={10} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          className="cts-input"
          value={input}
          placeholder={value.length === 0 ? placeholder : "Add more…"}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
        />

        <FiChevronDown
          size={16}
          className={`cts-chevron${open ? " cts-chevron--open" : ""}`}
        />
      </div>

      {open && dropdownItems.length > 0 && (
        <ul id={listId} ref={listRef} className="cts-dropdown" role="listbox">
          {dropdownItems.map((item, i) => (
            <li
              key={item}
              role="option"
              aria-selected={i === highlighted}
              className={[
                "cts-option",
                i === highlighted ? "cts-option--hl" : "",
                item === "__create__" ? "cts-option--create" : "",
              ].join(" ")}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(item === "__create__" ? inputTrimmed : item);
              }}
            >
              {item === "__create__" ? (
                <><span className="cts-create-kw">Create</span> "{inputTrimmed}"</>
              ) : item}
            </li>
          ))}
        </ul>
      )}

      {hint && <p className="cts-hint">{hint}</p>}
    </div>
  );
};

export default CreatableTagSelect;
