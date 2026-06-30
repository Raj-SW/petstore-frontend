import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../../context/CurrencyContext';
import './CurrencySelector.css';

const CurrencySelector = () => {
  const { selectedCurrency, setCurrency, currencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = currencies.find(c => c.code === selectedCurrency) ?? currencies[0];

  return (
    <div className="currency-selector" ref={ref}>
      <button
        className="currency-trigger"
        onClick={() => setOpen(o => !o)}
        aria-label="Select currency"
        aria-expanded={open}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="currency-flag-circle">
          <img
            src={`https://flagcdn.com/w40/${current.country}.png`}
            alt={current.name}
            className="currency-flag-img"
          />
        </span>
        <span className="currency-trigger-code">{current.code}</span>
      </button>

      {open && (
        <ul className="currency-dropdown" aria-label="Currency options">
          {currencies.map(c => (
            <li key={c.code}>
              <button
                type="button"
                aria-selected={c.code === selectedCurrency}
                className={`currency-option ${c.code === selectedCurrency ? 'active' : ''}`}
                onClick={() => { setCurrency(c.code); setOpen(false); }}
              >
                <span className="currency-option-flag-wrap">
                  <img
                    src={`https://flagcdn.com/w40/${c.country}.png`}
                    alt={c.name}
                    className="currency-option-flag-img"
                  />
                </span>
                <span className="currency-option-code">{c.code}</span>
                <span className="currency-option-name">{c.name}</span>
                {c.code === selectedCurrency && (
                  <span className="currency-option-check">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CurrencySelector;
