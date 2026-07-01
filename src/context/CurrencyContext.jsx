import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchRates, detectCurrency, detectCurrencyByIP, SUPPORTED_CURRENCIES } from '../Services/api/exchangeRatesService';

const CurrencyContext = createContext(null);

const LS_KEY = 'vp_selected_currency';

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem(LS_KEY) || detectCurrency();
  });
  const [rates, setRates] = useState({ MUR: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates().then(r => { setRates(r); setLoading(false); });
  }, []);

  // Auto-detect currency from the visitor's location (IP geo) — only when the
  // user hasn't explicitly chosen one. Does not persist, so an explicit pick
  // (which sets LS_KEY via setCurrency) always wins.
  useEffect(() => {
    if (localStorage.getItem(LS_KEY)) return undefined;
    let cancelled = false;
    detectCurrencyByIP().then((code) => {
      if (!cancelled && code && !localStorage.getItem(LS_KEY)) {
        setSelectedCurrency(code);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const setCurrency = useCallback((code) => {
    setSelectedCurrency(code);
    localStorage.setItem(LS_KEY, code);
  }, []);

  // Convert a MUR amount to the selected currency
  const convert = useCallback((murAmount) => {
    if (murAmount === null || murAmount === undefined || Number.isNaN(murAmount)) return 0;
    const rate = rates[selectedCurrency] ?? 1;
    return murAmount * rate;
  }, [rates, selectedCurrency]);

  // Format a MUR amount as a display string in the selected currency
  const formatPrice = useCallback((murAmount) => {
    if (murAmount === null || murAmount === undefined) return '—';
    const converted = convert(murAmount);
    const meta = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency);
    const symbol = meta?.label ?? selectedCurrency;

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: selectedCurrency === 'MUR' ? 0 : 2,
      maximumFractionDigits: selectedCurrency === 'MUR' ? 0 : 2,
    }).format(converted);

    return `${symbol} ${formatted}`;
  }, [convert, selectedCurrency]);

  const contextValue = useMemo(() => ({
    selectedCurrency,
    setCurrency,
    rates,
    loading,
    convert,
    formatPrice,
    currencies: SUPPORTED_CURRENCIES,
  }), [selectedCurrency, setCurrency, rates, loading, convert, formatPrice]);

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return ctx;
};
