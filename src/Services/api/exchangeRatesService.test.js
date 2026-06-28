/**
 * Tests for exchangeRatesService.js
 * Covers: detectCurrency locale mapping, fetchRates caching, API fallback
 */
import { fetchRates, detectCurrency, FALLBACK_RATES } from '@/Services/api/exchangeRatesService';

const CACHE_KEY = 'vp_exchange_rates';

// ─────────────────────────────────────────────
// detectCurrency
// ─────────────────────────────────────────────
describe('detectCurrency', () => {
  const setLang = (lang) => {
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      get: () => lang,
    });
  };

  afterEach(() => {
    // Reset to jsdom default
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      get: () => 'en-US',
    });
  });

  it.each([
    ['en-MU', 'MUR'],
    ['en-US', 'USD'],
    ['en-GB', 'GBP'],
    ['en-AU', 'AUD'],
    ['hi-IN', 'INR'],
    ['en-ZA', 'ZAR'],
    ['fr-FR', 'EUR'],
    ['de-DE', 'EUR'],
    ['nl-NL', 'EUR'],
    ['it-IT', 'EUR'],
    ['es-ES', 'EUR'],
  ])('maps locale %s → currency %s', (locale, expected) => {
    setLang(locale);
    expect(detectCurrency()).toBe(expected);
  });

  it('returns MUR for an unknown region code', () => {
    setLang('en-XX');
    expect(detectCurrency()).toBe('MUR');
  });

  it('returns MUR when locale has no region (e.g. "en")', () => {
    setLang('en');
    expect(detectCurrency()).toBe('MUR');
  });
});

// ─────────────────────────────────────────────
// fetchRates
// ─────────────────────────────────────────────
describe('fetchRates', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns FALLBACK_RATES when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    const rates = await fetchRates();
    expect(rates).toEqual(FALLBACK_RATES);
  });

  it('returns FALLBACK_RATES when the API returns a non-ok HTTP status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const rates = await fetchRates();
    expect(rates).toEqual(FALLBACK_RATES);
  });

  it('returns FALLBACK_RATES when API result is not "success"', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'error', 'error-type': 'invalid-key' }),
      })
    );
    const rates = await fetchRates();
    expect(rates).toEqual(FALLBACK_RATES);
  });

  it('returns cached rates and skips the network when cache is fresh', async () => {
    const cachedRates = { MUR: 1, USD: 0.021 };
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ rates: cachedRates, fetchedAt: Date.now() })
    );
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const rates = await fetchRates();

    expect(rates).toEqual(cachedRates);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches fresh data when the cached entry is older than 1 hour', async () => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        rates: { MUR: 1, USD: 0.02 },
        fetchedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      })
    );
    const freshRates = { MUR: 1, USD: 0.022 };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'success', rates: freshRates }),
      })
    );

    const rates = await fetchRates();
    expect(rates).toEqual(freshRates);
  });

  it('writes fetched rates to localStorage with a fetchedAt timestamp', async () => {
    const freshRates = { MUR: 1, USD: 0.021 };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'success', rates: freshRates }),
      })
    );

    const before = Date.now();
    await fetchRates();
    const after = Date.now();

    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    expect(cached.rates).toEqual(freshRates);
    expect(cached.fetchedAt).toBeGreaterThanOrEqual(before);
    expect(cached.fetchedAt).toBeLessThanOrEqual(after);
  });

  it('falls back gracefully when localStorage contains corrupt JSON', async () => {
    localStorage.setItem(CACHE_KEY, 'not-valid-json');
    const freshRates = { MUR: 1, USD: 0.021 };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'success', rates: freshRates }),
      })
    );

    const rates = await fetchRates();
    expect(rates).toEqual(freshRates);
  });
});
