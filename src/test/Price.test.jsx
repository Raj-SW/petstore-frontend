/**
 * Tests for the Price component.
 * useCurrency is mocked so tests don't need a real CurrencyProvider.
 */
import { render, screen } from '@testing-library/react';
import Price from '@/Components/HelperComponents/Price/Price';

// Mock the whole context module — factory runs BEFORE any import
vi.mock('@/context/CurrencyContext', () => ({
  useCurrency: vi.fn(),
}));

// Import the mock AFTER vi.mock so we can control the return value per test
import { useCurrency } from '@/context/CurrencyContext';

/** Convenience: set up useCurrency to return a MUR context. */
function mockMUR() {
  useCurrency.mockReturnValue({
    selectedCurrency: 'MUR',
    formatPrice: (amount) => `Rs ${Math.round(amount).toLocaleString('en-US')}`,
  });
}

/** Convenience: set up useCurrency to return a USD context. */
function mockUSD() {
  useCurrency.mockReturnValue({
    selectedCurrency: 'USD',
    formatPrice: (amount) => `$ ${(amount * 0.02104).toFixed(2)}`,
  });
}

beforeEach(() => {
  mockMUR();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// Null / undefined guard
// ─────────────────────────────────────────────
describe('null / undefined amount', () => {
  it('renders "—" for null', () => {
    render(<Price amount={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders "—" for undefined', () => {
    render(<Price amount={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Normal rendering
// ─────────────────────────────────────────────
describe('normal price rendering', () => {
  it('displays the formatted price returned by formatPrice', () => {
    render(<Price amount={2500} />);
    expect(screen.getByText('Rs 2,500')).toBeInTheDocument();
  });

  it('passes className to the outer <span>', () => {
    const { container } = render(<Price amount={1000} className="ip-price" />);
    expect(container.firstChild).toHaveClass('ip-price');
  });

  it('renders a <span> as the root element', () => {
    const { container } = render(<Price amount={500} />);
    expect(container.firstChild.tagName).toBe('SPAN');
  });
});

// ─────────────────────────────────────────────
// showMur prop
// ─────────────────────────────────────────────
describe('showMur prop', () => {
  it('does NOT show secondary MUR amount when showMur is false (foreign currency)', () => {
    mockUSD();
    render(<Price amount={1000} showMur={false} />);
    expect(screen.queryByText(/\(Rs/)).not.toBeInTheDocument();
  });

  it('shows secondary MUR amount when showMur=true and a foreign currency is selected', () => {
    mockUSD();
    render(<Price amount={1000} showMur={true} />);
    // Secondary span renders: "(Rs 1,000)"
    expect(screen.getByText(/\(Rs/)).toBeInTheDocument();
  });

  it('secondary MUR text contains the rounded amount', () => {
    mockUSD();
    render(<Price amount={4750} showMur={true} />);
    // Math.round(4750) = 4750, toLocaleString() → "4,750"
    expect(screen.getByText(/Rs 4,750/)).toBeInTheDocument();
  });

  it('does NOT show secondary MUR amount when showMur=true but MUR is already selected', () => {
    // MUR selected — condition: showMur && selectedCurrency !== 'MUR' → false
    render(<Price amount={1000} showMur={true} />);
    expect(screen.queryByText(/\(Rs/)).not.toBeInTheDocument();
  });

  it('showMur defaults to false (no secondary text without explicit prop)', () => {
    mockUSD();
    render(<Price amount={1000} />);
    expect(screen.queryByText(/\(Rs/)).not.toBeInTheDocument();
  });
});
