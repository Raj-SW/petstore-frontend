/**
 * Tests for CurrencyContext.jsx
 * Covers: default currency, setCurrency persistence, convert(), formatPrice()
 *
 * fetchRates is mocked so tests never hit the network.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CurrencyProvider, useCurrency } from '@/context/CurrencyContext';

// ── mock fetchRates; keep detectCurrency + SUPPORTED_CURRENCIES real ──
vi.mock('@/Services/api/exchangeRatesService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchRates: vi.fn().mockResolvedValue({
      MUR: 1,
      USD: 0.02104,
      EUR: 0.01937,
      GBP: 0.01657,
      INR: 1.755,
      ZAR: 0.3856,
      AUD: 0.0324,
    }),
  };
});

const LS_KEY = 'vp_selected_currency';

beforeEach(() => {
  localStorage.clear();
  // Force MUR as default so tests don't depend on navigator.language
  localStorage.setItem(LS_KEY, 'MUR');
});

afterEach(() => {
  vi.clearAllMocks();
});

/** Renders children inside a real CurrencyProvider. */
function renderWithProvider(ui) {
  return render(<CurrencyProvider>{ui}</CurrencyProvider>);
}

// ─────────────────────────────────────────────
// selectedCurrency & setCurrency
// ─────────────────────────────────────────────
describe('selectedCurrency / setCurrency', () => {
  it('reads initial currency from localStorage', async () => {
    localStorage.setItem(LS_KEY, 'GBP');
    const Consumer = () => {
      const { selectedCurrency } = useCurrency();
      return <span data-testid="cur">{selectedCurrency}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('cur').textContent).toBe('GBP')
    );
  });

  it('setCurrency updates the displayed currency', async () => {
    const Consumer = () => {
      const { selectedCurrency, setCurrency } = useCurrency();
      return (
        <>
          <span data-testid="cur">{selectedCurrency}</span>
          <button onClick={() => setCurrency('EUR')}>switch</button>
        </>
      );
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('cur').textContent).toBe('MUR')
    );

    fireEvent.click(screen.getByText('switch'));
    expect(screen.getByTestId('cur').textContent).toBe('EUR');
  });

  it('setCurrency persists the new currency to localStorage', async () => {
    const Consumer = () => {
      const { setCurrency } = useCurrency();
      return <button onClick={() => setCurrency('INR')}>set</button>;
    };
    renderWithProvider(<Consumer />);
    fireEvent.click(screen.getByText('set'));
    expect(localStorage.getItem(LS_KEY)).toBe('INR');
  });
});

// ─────────────────────────────────────────────
// convert()
// ─────────────────────────────────────────────
describe('convert()', () => {
  it('returns the same amount for MUR (rate = 1)', async () => {
    const Consumer = () => {
      const { convert, loading } = useCurrency();
      if (loading) return <span>…</span>;
      return <span data-testid="r">{convert(1000)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('r').textContent).toBe('1000')
    );
  });

  it('converts MUR → USD using the mocked rate', async () => {
    localStorage.setItem(LS_KEY, 'USD');
    const Consumer = () => {
      const { convert, loading } = useCurrency();
      if (loading) return <span>…</span>;
      // 1000 × 0.02104 = 21.04
      return <span data-testid="r">{convert(1000).toFixed(4)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('r').textContent).toBe('21.0400')
    );
  });

  it('converts MUR → EUR using the mocked rate', async () => {
    localStorage.setItem(LS_KEY, 'EUR');
    const Consumer = () => {
      const { convert, loading } = useCurrency();
      if (loading) return <span>…</span>;
      // 5000 × 0.01937 = 96.85
      return <span data-testid="r">{convert(5000).toFixed(2)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('r').textContent).toBe('96.85')
    );
  });

  it('returns 0 for null input', async () => {
    const Consumer = () => {
      const { convert, loading } = useCurrency();
      if (loading) return <span>…</span>;
      return <span data-testid="r">{convert(null)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('r').textContent).toBe('0')
    );
  });

  it('returns 0 for undefined input', async () => {
    const Consumer = () => {
      const { convert, loading } = useCurrency();
      if (loading) return <span>…</span>;
      return <span data-testid="r">{convert(undefined)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('r').textContent).toBe('0')
    );
  });

  it('returns 0 for NaN input', async () => {
    const Consumer = () => {
      const { convert, loading } = useCurrency();
      if (loading) return <span>…</span>;
      return <span data-testid="r">{convert(NaN)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('r').textContent).toBe('0')
    );
  });
});

// ─────────────────────────────────────────────
// formatPrice()
// ─────────────────────────────────────────────
describe('formatPrice()', () => {
  it('formats MUR with 0 decimals and "Rs" symbol', async () => {
    const Consumer = () => {
      const { formatPrice, loading } = useCurrency();
      if (loading) return null;
      return <span data-testid="p">{formatPrice(2500)}</span>;
    };
    renderWithProvider(<Consumer />);
    // Rs + space + 2,500 (en-US grouping, 0 decimals)
    await waitFor(() =>
      expect(screen.getByTestId('p').textContent).toBe('Rs 2,500')
    );
  });

  it('formats USD with 2 decimals and "$" symbol', async () => {
    localStorage.setItem(LS_KEY, 'USD');
    const Consumer = () => {
      const { formatPrice, loading } = useCurrency();
      if (loading) return null;
      // 1000 × 0.02104 = 21.04
      return <span data-testid="p">{formatPrice(1000)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('p').textContent).toBe('$ 21.04')
    );
  });

  it('formats GBP with 2 decimals and "£" symbol', async () => {
    localStorage.setItem(LS_KEY, 'GBP');
    const Consumer = () => {
      const { formatPrice, loading } = useCurrency();
      if (loading) return null;
      // 10000 × 0.01657 = 165.70
      return <span data-testid="p">{formatPrice(10000)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('p').textContent).toBe('£ 165.70')
    );
  });

  it('returns "—" for null amount', async () => {
    const Consumer = () => {
      const { formatPrice, loading } = useCurrency();
      if (loading) return null;
      return <span data-testid="p">{formatPrice(null)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('p').textContent).toBe('—')
    );
  });

  it('returns "—" for undefined amount', async () => {
    const Consumer = () => {
      const { formatPrice, loading } = useCurrency();
      if (loading) return null;
      return <span data-testid="p">{formatPrice(undefined)}</span>;
    };
    renderWithProvider(<Consumer />);
    await waitFor(() =>
      expect(screen.getByTestId('p').textContent).toBe('—')
    );
  });
});

// ─────────────────────────────────────────────
// useCurrency outside provider
// ─────────────────────────────────────────────
describe('useCurrency outside <CurrencyProvider>', () => {
  it('throws a descriptive error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Rogue = () => {
      useCurrency();
      return null;
    };
    expect(() => render(<Rogue />)).toThrow(
      'useCurrency must be used inside <CurrencyProvider>'
    );
    consoleSpy.mockRestore();
  });
});
