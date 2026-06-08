# MUR Currency System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all product prices from USD to MUR, build a multi-currency display system with auto-detection and manual override, and update Stripe to charge in MUR.

**Architecture:** Prices stored in MUR in MongoDB (migrated via script). A `CurrencyContext` fetches live exchange rates (base MUR) from open.er-api.com, caches them 1hr in localStorage, and exposes a `formatPrice(murAmount)` function. A reusable `<Price />` component uses the context everywhere. Stripe PaymentIntents change from `currency: 'usd'` to `currency: 'mur'`.

**Tech Stack:** React Context API, open.er-api.com (free exchange rates), Intl.NumberFormat, Stripe (MUR), mongoose (migration script)

---

## File Map

### New files
| Path | Responsibility |
|---|---|
| `backend/scripts/migrate-prices-to-mur.js` | One-time script: multiply all product prices by live USD→MUR rate |
| `frontend/src/Services/api/exchangeRatesService.js` | Fetch rates from open.er-api.com, cache 1hr in localStorage |
| `frontend/src/context/CurrencyContext.jsx` | Stores selectedCurrency, rates, formatPrice(), auto-detects locale |
| `frontend/src/Components/HelperComponents/Price/Price.jsx` | Reusable price display — reads CurrencyContext |
| `frontend/src/Components/HelperComponents/CurrencySelector/CurrencySelector.jsx` | Navbar dropdown: flag + code, persists to localStorage |
| `frontend/src/Components/HelperComponents/CurrencySelector/CurrencySelector.css` | Selector styles |

### Modified files
| Path | Change |
|---|---|
| `backend/src/controllers/payment.controller.js` | Change `currency: 'USD'` → `currency: 'mur'`, amounts already in minor units |
| `frontend/src/main.jsx` | Wrap app with `<CurrencyProvider>` |
| `frontend/src/Components/NavigationBar/NavigationBar.jsx` | Add `<CurrencySelector />` |
| `frontend/src/Components/HelperComponents/ProductCard/ProductCardV2.jsx` | `$\{price}` → `<Price amount={price} />` |
| `frontend/src/Components/HelperComponents/CartItem/CartItem.jsx` | `$\{price}` → `<Price amount={price} />` |
| `frontend/src/Components/NavigationBar/CartModal.jsx` | Update subtotal display |
| `frontend/src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx` | Update price display |
| `frontend/src/Pages/CartCheckoutPage/CartCheckOutPage.jsx` | Show MUR amount + approximate in selected currency |
| `frontend/src/Pages/Payment/PaymentPage.jsx` | Show MUR total, note "charged in MUR" |
| `frontend/src/Pages/OrderConfirmed/OrderConfirmedPage.jsx` | Update order total display |
| `frontend/src/Pages/MyOrders/MyOrdersPage.jsx` | Update order history prices |
| `frontend/src/Pages/PetShopPage/PetShopPage.jsx` | Update product list prices |
| `frontend/src/Pages/Admin/Orders/AdminOrders.jsx` | Currency-aware order totals |

---

## Task 1: Migrate prices — USD → MUR in MongoDB

**Files:**
- Create: `backend/scripts/migrate-prices-to-mur.js`

- [ ] **Step 1: Create migration script**

```js
/**
 * migrate-prices-to-mur.js
 * One-time: fetch live USD→MUR rate and multiply all product prices.
 * Run: node scripts/migrate-prices-to-mur.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('❌ MONGODB_URI not set'); process.exit(1); }

function fetchRate() {
  return new Promise((resolve, reject) => {
    https.get('https://open.er-api.com/v6/latest/USD', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.result !== 'success') return reject(new Error('Rate fetch failed'));
        resolve(json.rates.MUR);
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.');

  const rate = await fetchRate();
  console.log(`💱 1 USD = ${rate} MUR`);

  const col = mongoose.connection.collection('products');
  const products = await col.find({}).toArray();

  let updated = 0;
  for (const p of products) {
    const murPrice = parseFloat((p.price * rate).toFixed(2));
    await col.updateOne({ _id: p._id }, { $set: { price: murPrice } });
    updated++;
  }

  console.log(`✅ Done. ${updated} products updated.`);
  console.log(`📋 Rate used: 1 USD = ${rate} MUR. Store this value for rollback.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
```

- [ ] **Step 2: Dry-run — check a few prices before running**

```bash
cd backend && node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const p = await mongoose.connection.collection('products')
    .find({}).limit(5).project({ name:1, price:1 }).toArray();
  console.table(p.map(x => ({ name: x.name, price_usd: x.price })));
  await mongoose.disconnect();
});
"
```

- [ ] **Step 3: Run the migration**

```bash
node scripts/migrate-prices-to-mur.js
```

Expected output:
```
🔌 Connecting to MongoDB…
✅ Connected.
💱 1 USD = 45.xx MUR
✅ Done. 35 products updated.
```

- [ ] **Step 4: Verify prices changed**

```bash
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const p = await mongoose.connection.collection('products')
    .find({}).limit(5).project({ name:1, price:1 }).toArray();
  console.table(p.map(x => ({ name: x.name, price_mur: x.price })));
  await mongoose.disconnect();
});
"
```

Expected: prices are now ~45x higher (e.g. 19.99 → ~899.55)

- [ ] **Step 5: Commit**

```bash
cd backend
git add scripts/migrate-prices-to-mur.js
git commit -m "feat: migrate product prices from USD to MUR"
```

---

## Task 2: Exchange rates service (frontend)

**Files:**
- Create: `frontend/src/Services/api/exchangeRatesService.js`

- [ ] **Step 1: Create the service**

```js
// exchangeRatesService.js
// Fetches exchange rates with MUR as base from open.er-api.com
// Caches in localStorage for 1 hour to avoid hammering the free API

const CACHE_KEY  = 'vp_exchange_rates';
const CACHE_TTL  = 60 * 60 * 1000; // 1 hour

// Fallback rates if the API is unavailable (approximate, June 2026)
const FALLBACK_RATES = {
  MUR: 1,
  USD: 0.0222,
  EUR: 0.0204,
  GBP: 0.0175,
  INR: 1.855,
  ZAR: 0.407,
  AUD: 0.0342,
  CAD: 0.0305,
  JPY: 3.32,
  CNY: 0.161,
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
    if (json.result !== 'success') throw new Error('API error');

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
  { code: 'MUR', label: 'Rs',  name: 'Mauritian Rupee',  flag: '🇲🇺' },
  { code: 'USD', label: '$',   name: 'US Dollar',        flag: '🇺🇸' },
  { code: 'EUR', label: '€',   name: 'Euro',             flag: '🇪🇺' },
  { code: 'GBP', label: '£',   name: 'British Pound',    flag: '🇬🇧' },
  { code: 'INR', label: '₹',   name: 'Indian Rupee',     flag: '🇮🇳' },
  { code: 'ZAR', label: 'R',   name: 'South African Rand', flag: '🇿🇦' },
  { code: 'AUD', label: 'A$',  name: 'Australian Dollar', flag: '🇦🇺' },
];

// Map browser locale → default currency code
export function detectCurrency() {
  try {
    const locale = navigator.language || 'en-MU';
    const region = locale.split('-')[1]?.toUpperCase();
    const map = {
      MU: 'MUR', US: 'USD', GB: 'GBP', AU: 'AUD',
      IN: 'INR', ZA: 'ZAR', FR: 'EUR', DE: 'EUR',
      IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
    };
    return map[region] ?? 'MUR'; // Default to MUR for unknown locales
  } catch {
    return 'MUR';
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd frontend
git add src/Services/api/exchangeRatesService.js
git commit -m "feat: add exchange rates service with MUR base and localStorage cache"
```

---

## Task 3: CurrencyContext

**Files:**
- Create: `frontend/src/context/CurrencyContext.jsx`

- [ ] **Step 1: Create context**

```jsx
// CurrencyContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchRates, detectCurrency, SUPPORTED_CURRENCIES } from '../Services/api/exchangeRatesService';

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

  const setCurrency = useCallback((code) => {
    setSelectedCurrency(code);
    localStorage.setItem(LS_KEY, code);
  }, []);

  // Convert a MUR amount to the selected currency
  const convert = useCallback((murAmount) => {
    if (!murAmount || isNaN(murAmount)) return 0;
    const rate = rates[selectedCurrency] ?? 1;
    return murAmount * rate;
  }, [rates, selectedCurrency]);

  // Format a MUR amount as a string in the selected currency
  const formatPrice = useCallback((murAmount) => {
    if (murAmount === null || murAmount === undefined) return '—';
    const converted = convert(murAmount);
    const meta = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency);
    const symbol = meta?.label ?? selectedCurrency;

    // Use Intl for proper number formatting
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: selectedCurrency === 'MUR' ? 0 : 2,
      maximumFractionDigits: selectedCurrency === 'MUR' ? 0 : 2,
    }).format(converted);

    return `${symbol} ${formatted}`;
  }, [convert, selectedCurrency]);

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setCurrency,
      rates,
      loading,
      convert,
      formatPrice,
      currencies: SUPPORTED_CURRENCIES,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
```

- [ ] **Step 2: Wrap app with CurrencyProvider in `main.jsx`**

Read the current `frontend/src/main.jsx`, find the outermost provider wrapper, and add `<CurrencyProvider>` inside (or outside) `<AuthProvider>`:

```jsx
import { CurrencyProvider } from './context/CurrencyContext';

// Inside ReactDOM.createRoot(...).render(...)
<CurrencyProvider>
  {/* existing providers */}
</CurrencyProvider>
```

- [ ] **Step 3: Commit**

```bash
git add src/context/CurrencyContext.jsx src/main.jsx
git commit -m "feat: add CurrencyContext with MUR base, auto-detect, formatPrice"
```

---

## Task 4: Price component

**Files:**
- Create: `frontend/src/Components/HelperComponents/Price/Price.jsx`

- [ ] **Step 1: Create Price component**

```jsx
// Price.jsx
// Reusable price display component. Always receives amounts in MUR.
// Converts and formats using CurrencyContext.
//
// Usage:
//   <Price amount={product.price} />
//   <Price amount={total} className="text-xl font-bold" />
//   <Price amount={price} showMur />   ← shows both: "$ 45.00  (Rs 2,025)"

import { useCurrency } from '../../../context/CurrencyContext';

const Price = ({ amount, className = '', showMur = false }) => {
  const { formatPrice, selectedCurrency } = useCurrency();

  if (amount === null || amount === undefined) return <span className={className}>—</span>;

  return (
    <span className={className}>
      {formatPrice(amount)}
      {showMur && selectedCurrency !== 'MUR' && (
        <span style={{ fontSize: '0.8em', opacity: 0.6, marginLeft: '0.4rem' }}>
          (Rs {Math.round(amount).toLocaleString()})
        </span>
      )}
    </span>
  );
};

export default Price;
```

- [ ] **Step 2: Commit**

```bash
git add src/Components/HelperComponents/Price/Price.jsx
git commit -m "feat: add reusable Price component (MUR-based, currency-aware)"
```

---

## Task 5: CurrencySelector component

**Files:**
- Create: `frontend/src/Components/HelperComponents/CurrencySelector/CurrencySelector.jsx`
- Create: `frontend/src/Components/HelperComponents/CurrencySelector/CurrencySelector.css`

- [ ] **Step 1: Create CSS**

```css
/* CurrencySelector.css */
.currency-selector {
  position: relative;
}

.currency-trigger {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  color: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.currency-trigger:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.4);
}

.currency-trigger-flag { font-size: 1rem; }
.currency-trigger-code { font-size: 0.8rem; }
.currency-trigger-chevron {
  font-size: 0.65rem;
  opacity: 0.7;
  transition: transform 0.2s;
}
.currency-trigger-chevron.open { transform: rotate(180deg); }

.currency-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  overflow: hidden;
  z-index: 1000;
  min-width: 190px;
}

.currency-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.6rem 0.875rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1a2e1a;
  transition: background 0.12s;
  text-align: left;
}

.currency-option:hover { background: #f7f9f7; }
.currency-option.active {
  background: rgba(0,28,16,0.06);
  font-weight: 700;
}

.currency-option-flag { font-size: 1.1rem; }
.currency-option-code { font-weight: 700; min-width: 36px; }
.currency-option-name { color: #6b7b6b; font-size: 0.8rem; }
.currency-option-check { margin-left: auto; color: #d99a2b; font-size: 0.75rem; }
```

- [ ] **Step 2: Create component**

```jsx
// CurrencySelector.jsx
import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../../context/CurrencyContext';
import './CurrencySelector.css';

const CurrencySelector = () => {
  const { selectedCurrency, setCurrency, currencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
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
      >
        <span className="currency-trigger-flag">{current.flag}</span>
        <span className="currency-trigger-code">{current.code}</span>
        <span className={`currency-trigger-chevron ${open ? 'open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="currency-dropdown" role="listbox">
          {currencies.map(c => (
            <button
              key={c.code}
              role="option"
              aria-selected={c.code === selectedCurrency}
              className={`currency-option ${c.code === selectedCurrency ? 'active' : ''}`}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
            >
              <span className="currency-option-flag">{c.flag}</span>
              <span className="currency-option-code">{c.code}</span>
              <span className="currency-option-name">{c.name}</span>
              {c.code === selectedCurrency && <span className="currency-option-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
```

- [ ] **Step 3: Add CurrencySelector to NavigationBar**

In `frontend/src/Components/NavigationBar/NavigationBar.jsx`, import and render `<CurrencySelector />` next to the cart icon:

```jsx
import CurrencySelector from '../HelperComponents/CurrencySelector/CurrencySelector';

// In the navbar right-side actions area, add:
<CurrencySelector />
```

- [ ] **Step 4: Commit**

```bash
git add src/Components/HelperComponents/CurrencySelector/
git add src/Components/NavigationBar/NavigationBar.jsx
git commit -m "feat: add CurrencySelector dropdown to navbar"
```

---

## Task 6: Replace hardcoded prices in product display components

**Files:**
- Modify: `src/Components/HelperComponents/ProductCard/ProductCardV2.jsx`
- Modify: `src/Components/HelperComponents/CartItem/CartItem.jsx`
- Modify: `src/Components/NavigationBar/CartModal.jsx`
- Modify: `src/Pages/PetShopPage/PetShopPage.jsx`
- Modify: `src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx`

For each file:

- [ ] **Step 1: ProductCardV2.jsx**

Find: `<span className="pcv2-price">${price}</span>`
Replace with:
```jsx
import Price from '../Price/Price';
// ...
<Price amount={price} className="pcv2-price" />
```

- [ ] **Step 2: CartItem.jsx**

Find:
```jsx
<p className="cart-item-unit">${item.price.toFixed(2)} each</p>
// and
${(item.price * item.quantity).toFixed(2)}
```
Replace with:
```jsx
import Price from '../Price/Price';
// ...
<p className="cart-item-unit"><Price amount={item.price} /> each</p>
// and
<Price amount={item.price * item.quantity} />
```

- [ ] **Step 3: CartModal.jsx**

Find any `$` + price pattern. Replace with `<Price amount={...} />`.
Import Price at top: `import Price from '../HelperComponents/Price/Price';`

- [ ] **Step 4: IndividualProductItemPage.jsx**

Find: `<p className="ip-price">${parseFloat(product.price).toFixed(2)}</p>`
Replace with:
```jsx
import Price from '@/Components/HelperComponents/Price/Price';
// ...
<Price amount={product.price} className="ip-price" />
```

- [ ] **Step 5: PetShopPage.jsx**

Find any hardcoded `$` + price in the product listing. Replace with `<Price amount={...} />`.

- [ ] **Step 6: Commit**

```bash
git add src/Components/HelperComponents/ProductCard/ProductCardV2.jsx
git add src/Components/HelperComponents/CartItem/CartItem.jsx
git add src/Components/NavigationBar/CartModal.jsx
git add src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx
git add src/Pages/PetShopPage/PetShopPage.jsx
git commit -m "feat: replace hardcoded $ prices with <Price /> component"
```

---

## Task 7: Replace prices in checkout and order pages

**Files:**
- Modify: `src/Pages/CartCheckoutPage/CartCheckOutPage.jsx`
- Modify: `src/Pages/Payment/PaymentPage.jsx`
- Modify: `src/Pages/OrderConfirmed/OrderConfirmedPage.jsx`
- Modify: `src/Pages/MyOrders/MyOrdersPage.jsx`
- Modify: `src/Pages/Admin/Orders/AdminOrders.jsx`

- [ ] **Step 1: CartCheckOutPage.jsx**

Replace all `$` + price/total patterns with `<Price amount={...} />`.
For the payment summary, add a note for non-MUR users:

```jsx
import Price from '@/Components/HelperComponents/Price/Price';
import { useCurrency } from '@/context/CurrencyContext';

// In component:
const { selectedCurrency } = useCurrency();

// In JSX summary section:
<Price amount={total} className="checkout-total" showMur={selectedCurrency !== 'MUR'} />
{selectedCurrency !== 'MUR' && (
  <p className="checkout-currency-note">
    You will be charged Rs {Math.round(total).toLocaleString()} MUR via Stripe
  </p>
)}
```

- [ ] **Step 2: PaymentPage.jsx**

Same pattern — replace `$` prices with `<Price />`, add the MUR charge note near the submit button.

- [ ] **Step 3: OrderConfirmedPage.jsx and MyOrdersPage.jsx**

Replace all `$` + amount patterns with `<Price amount={...} />`.

- [ ] **Step 4: AdminOrders.jsx**

Admin always sees MUR (no conversion needed in admin panel):
```jsx
// For admin, just format as MUR directly
Rs {amount.toLocaleString()}
```

- [ ] **Step 5: Commit**

```bash
git add src/Pages/CartCheckoutPage/CartCheckOutPage.jsx
git add src/Pages/Payment/PaymentPage.jsx
git add src/Pages/OrderConfirmed/OrderConfirmedPage.jsx
git add src/Pages/MyOrders/MyOrdersPage.jsx
git add src/Pages/Admin/Orders/AdminOrders.jsx
git commit -m "feat: update checkout and order pages to use Price component + MUR charge note"
```

---

## Task 8: Update Stripe to charge in MUR

**Files:**
- Modify: `backend/src/controllers/payment.controller.js`

- [ ] **Step 1: Read the current payment controller**

Look for every `currency: 'USD'` and `currency: 'usd'` occurrence.

- [ ] **Step 2: Change currency to MUR**

```js
// Before:
currency: 'USD',
// After:
currency: 'mur',
```

Note: MUR in Stripe is a standard two-decimal currency.
Amount sent to Stripe = `Math.round(totalInMUR * 100)` (same as USD cents pattern).

- [ ] **Step 3: Verify amount calculation**

Find where the amount is calculated for the PaymentIntent. It should already be `price * 100`. Since prices are now in MUR, this is correct — `Math.round(9000 * 100) = 900000` = Rs 9,000 in Stripe.

- [ ] **Step 4: Update transaction model currency default (if applicable)**

In `backend/src/models/transaction.model.js`, find any `currency: { default: 'USD' }` and change to `'MUR'`.

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/controllers/payment.controller.js
git add src/models/transaction.model.js
git commit -m "feat: switch Stripe payments from USD to MUR"
```

---

## Task 9: Update FeaturedProductSection (homepage prices)

**Files:**
- Modify: `frontend/src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx`

- [ ] **Step 1: Add Price component to product cards on homepage**

The `ProductCardV2` component already handles this after Task 6. Verify the homepage renders prices correctly by checking FeaturedProductSection passes `price={product.price}` to `ProductCard`.

No changes needed if ProductCardV2 was already updated — verify only.

---

## Self-Review Checklist

- [x] **Migration script** — Task 1 ✅
- [x] **Exchange rates with fallback** — Task 2 ✅
- [x] **CurrencyContext with auto-detect** — Task 3 ✅
- [x] **formatPrice function** — Task 3 ✅
- [x] **Persists to localStorage** — Task 3 (setCurrency saves to LS) ✅
- [x] **Price component** — Task 4 ✅
- [x] **CurrencySelector in navbar** — Task 5 ✅
- [x] **All product card prices** — Task 6 ✅
- [x] **Cart prices** — Task 6 ✅
- [x] **Checkout MUR note for foreign users** — Task 7 ✅
- [x] **Stripe charges in MUR** — Task 8 ✅
- [x] **Admin panel admin-only MUR** — Task 7 step 4 ✅
- [x] **Homepage featured products** — Task 9 ✅
