// exchangeRatesService.js
// Fetches exchange rates with MUR as base from open.er-api.com
// Caches in localStorage for 1 hour to avoid hammering the free API

const CACHE_KEY = 'vp_exchange_rates';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

// Fallback rates if the API is unavailable (approximate, June 2026, base MUR)
export const FALLBACK_RATES = {
  MUR: 1,
  USD: 0.02104,
  EUR: 0.01937,
  GBP: 0.01657,
  INR: 1.7550,
  ZAR: 0.3856,
  AUD: 0.03240,
  CAD: 0.02891,
  JPY: 3.147,
  CNY: 0.1527,
};

export async function fetchRates() {
  // Return cached rates if still fresh
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { rates, fetchedAt } = JSON.parse(cached);
      if (Date.now() - fetchedAt < CACHE_TTL) return rates;
    }
  } catch { /* corrupt cache — refetch */ }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/MUR');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.result !== 'success') throw new Error('API error: ' + json['error-type']);

    const rates = json.rates;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, fetchedAt: Date.now() }));
    return rates;
  } catch (err) {
    console.warn('Exchange rate fetch failed, using fallback rates:', err.message);
    return FALLBACK_RATES;
  }
}

// Supported currencies shown in the selector
export const SUPPORTED_CURRENCIES = [
  { code: 'MUR', label: 'Rs',  name: 'Mauritian Rupee',    flag: '🇲🇺' },
  { code: 'USD', label: '$',   name: 'US Dollar',          flag: '🇺🇸' },
  { code: 'EUR', label: '€',   name: 'Euro',               flag: '🇪🇺' },
  { code: 'GBP', label: '£',   name: 'British Pound',      flag: '🇬🇧' },
  { code: 'INR', label: '₹',   name: 'Indian Rupee',       flag: '🇮🇳' },
  { code: 'ZAR', label: 'R',   name: 'South African Rand', flag: '🇿🇦' },
  { code: 'AUD', label: 'A$',  name: 'Australian Dollar',  flag: '🇦🇺' },
];

// Map browser locale region → default currency code
export function detectCurrency() {
  try {
    const locale = navigator.language || 'en-MU';
    const region = locale.split('-')[1]?.toUpperCase();
    const map = {
      MU: 'MUR',
      US: 'USD',
      GB: 'GBP',
      AU: 'AUD',
      IN: 'INR',
      ZA: 'ZAR',
      FR: 'EUR', DE: 'EUR', IT: 'EUR',
      ES: 'EUR', NL: 'EUR', BE: 'EUR',
      PT: 'EUR', AT: 'EUR', FI: 'EUR',
    };
    return map[region] ?? 'MUR'; // Default to MUR for unknown locales
  } catch {
    return 'MUR';
  }
}
