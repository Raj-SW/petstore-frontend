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
  INR: 1.755,
  ZAR: 0.3856,
  AUD: 0.0324,
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

// Supported currencies shown in the selector.
// `country` is the ISO 3166-1 alpha-2 code used by flagcdn.com for flag images.
export const SUPPORTED_CURRENCIES = [
  { code: 'MUR', label: 'Rs',  name: 'Mauritian Rupee',    country: 'mu' },
  { code: 'USD', label: '$',   name: 'US Dollar',          country: 'us' },
  { code: 'EUR', label: '€',   name: 'Euro',               country: 'eu' },
  { code: 'GBP', label: '£',   name: 'British Pound',      country: 'gb' },
  { code: 'INR', label: '₹',   name: 'Indian Rupee',       country: 'in' },
  { code: 'ZAR', label: 'R',   name: 'South African Rand', country: 'za' },
  { code: 'AUD', label: 'A$',  name: 'Australian Dollar',  country: 'au' },
];

// Map ISO 3166-1 alpha-2 country code → a supported currency code
const COUNTRY_CURRENCY = {
  MU: 'MUR', US: 'USD', GB: 'GBP', AU: 'AUD', IN: 'INR', ZA: 'ZAR',
  FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
  PT: 'EUR', AT: 'EUR', FI: 'EUR', IE: 'EUR', GR: 'EUR', LU: 'EUR',
};

// Resolve the visitor's currency from IP geolocation (free, no API key).
// Returns a supported currency code, or null on failure / unsupported region.
export async function detectCurrencyByIP() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error(`geo HTTP ${res.status}`);
    const json = await res.json();
    const cc = (json.country_code || json.country || '').toUpperCase();
    const code = COUNTRY_CURRENCY[cc];
    if (code && SUPPORTED_CURRENCIES.some((c) => c.code === code)) return code;
    return null;
  } catch {
    return null;
  }
}

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
