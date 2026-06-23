# Subscription Savings Chooser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat subscription widgets on the product page and cart with a shared two-card chooser that visually anchors the savings of subscribing vs buying once.

**Architecture:** One pure pricing util (`subscriptionPricing.js`) holds the savings math and interval-validity rule. One presentational component (`SubscriptionChooser`) renders the two selectable radio cards, the "Save N%" pill, the strikethrough→green→"You save Rs X" math, and a frequency dropdown that only appears when the subscribe card is active. Two thin adapters consume it: the product page (`SubscribeWidget`, merged into a single smart action button alongside Add to Cart) and the cart (`CartCheckOutPage`, replacing the `makeRecurring` checkbox).

**Tech Stack:** React (Vite), Vitest + React Testing Library, plain CSS modules-by-convention (co-located `.css`), existing `CurrencyContext`/`Price` helpers.

---

## Background / current state

- **Discount source:** flat percent. Frontend reads `import.meta.env.VITE_SUBSCRIPTION_DISCOUNT_PERCENT || 10`. Backend stores it as `discountPercent` (`SUBSCRIPTION_DISCOUNT_PERCENT || 10`) and applies it to the **order total** at billing — so `base × (1 − pct/100)` matches what is actually charged.
- **Product page** (`src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx`):
  - `displayEffective` (line ~449) is the sale-aware unit price (`displayOnSale ? displaySalePrice : displayPrice`).
  - `handleAddToCart` (line ~317) adds to cart; the standalone Add to Cart button is at line ~617, and `<SubscribeWidget .../>` directly below at line ~627.
  - `vStock` (line ~444) gates out-of-stock; `stockQty === 0` drives the "Out of Stock" label.
- **Product widget** (`src/Components/Subscriptions/SubscribeWidget.jsx`): collapsible button → flat panel. Calls `subscriptionsApi.create` directly (bypasses cart). 7-day minimum via `minOk`.
- **Cart** (`src/Pages/CartCheckoutPage/CartCheckOutPage.jsx`): whole-cart `makeRecurring` checkbox + interval row (lines ~368–393); on checkout creates the order then optionally one subscription for the whole cart. `subtotal = cartTotal` (line ~60).
- **Test convention:** Vitest + RTL, test files co-located (`Foo.test.jsx`). `vi.mock` factories must define fixtures inside the factory (hoisting). Run a single file with `npx vitest run <path>`.

---

## File Structure

- **Create** `src/utils/subscriptionPricing.js` — pure functions `computeSavings(basePrice, discountPercent)` and `isIntervalValid(unit, count)`. Single responsibility: the math + the rule. No React.
- **Create** `src/utils/subscriptionPricing.test.js` — unit tests for the util.
- **Create** `src/Components/Subscriptions/SubscriptionChooser.jsx` — presentational two-card chooser. Controlled via props, no API calls.
- **Create** `src/Components/Subscriptions/SubscriptionChooser.css` — card/pill/price styles.
- **Create** `src/Components/Subscriptions/SubscriptionChooser.test.jsx` — component tests.
- **Modify** `src/Components/Subscriptions/SubscribeWidget.jsx` — rewrite as adapter using the chooser + one smart action button.
- **Modify** `src/Components/Subscriptions/SubscribeWidget.css` — drop unused styles, keep container.
- **Modify** `src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx` — remove standalone Add to Cart button; pass `unitPrice`/`onAddToCart`/`outOfStock` into `SubscribeWidget`.
- **Modify** `src/Pages/CartCheckoutPage/CartCheckOutPage.jsx` — replace `makeRecurring` checkbox block with the chooser; gate Place Order on interval validity.
- **Modify** `backend/.claude/memory/STATUS.md` — record the shipped UI work.

---

## Component interface (locked)

`computeSavings(basePrice, discountPercent)` → `{ base, discounted, save }`, all integers (rounded). Guards non-numbers to 0.

`isIntervalValid(unit, count)` → boolean. `days = unit === 'week' ? count*7 : count`; valid when `days >= 7`.

`<SubscriptionChooser>` props:
- `basePrice` (number) — sale-aware amount the discount applies to (unit×qty on product, subtotal on cart).
- `discountPercent` (number).
- `mode` (`"onetime" | "subscribe"`) — controlled selected card.
- `onModeChange(mode)`.
- `intervalCount` (number), `onIntervalCountChange(value)`.
- `intervalUnit` (`"day" | "week"`), `onIntervalUnitChange(value)`.
- `formatAmount(n)` — formatter; default `(n) => \`Rs ${Math.round(n).toLocaleString()}\``.
- `oneTimeLabel` (string, default `"One-Time Purchase"`).

The chooser is presentational: it renders the warning when `mode === 'subscribe' && !isIntervalValid(...)`, but parents independently gate submission with `isIntervalValid`.

---

### Task 1: Pricing util

**Files:**
- Create: `src/utils/subscriptionPricing.js`
- Test: `src/utils/subscriptionPricing.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/utils/subscriptionPricing.test.js
import { describe, it, expect } from "vitest";
import { computeSavings, isIntervalValid } from "./subscriptionPricing";

describe("computeSavings", () => {
  it("computes discounted price and savings", () => {
    expect(computeSavings(300, 10)).toEqual({ base: 300, discounted: 270, save: 30 });
  });
  it("rounds to whole rupees", () => {
    expect(computeSavings(299, 10)).toEqual({ base: 299, discounted: 269, save: 30 });
  });
  it("guards non-numeric input", () => {
    expect(computeSavings(undefined, 10)).toEqual({ base: 0, discounted: 0, save: 0 });
    expect(computeSavings(300, undefined)).toEqual({ base: 300, discounted: 300, save: 0 });
  });
});

describe("isIntervalValid", () => {
  it("requires at least 7 days", () => {
    expect(isIntervalValid("day", 7)).toBe(true);
    expect(isIntervalValid("day", 6)).toBe(false);
    expect(isIntervalValid("week", 1)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/subscriptionPricing.test.js`
Expected: FAIL — `Failed to resolve import "./subscriptionPricing"`.

- [ ] **Step 3: Write minimal implementation**

```js
// src/utils/subscriptionPricing.js
export function computeSavings(basePrice, discountPercent) {
  const base = Math.round(Number(basePrice) || 0);
  const pct = Number(discountPercent) || 0;
  const discounted = Math.round(base * (1 - pct / 100));
  return { base, discounted, save: base - discounted };
}

export function isIntervalValid(unit, count) {
  const n = Number(count) || 0;
  const days = unit === "week" ? n * 7 : n;
  return days >= 7;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/subscriptionPricing.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/subscriptionPricing.js src/utils/subscriptionPricing.test.js
git commit -m "feat(subscriptions): add pricing+interval util for savings chooser"
```

---

### Task 2: SubscriptionChooser component

**Files:**
- Create: `src/Components/Subscriptions/SubscriptionChooser.jsx`
- Create: `src/Components/Subscriptions/SubscriptionChooser.css`
- Test: `src/Components/Subscriptions/SubscriptionChooser.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/Components/Subscriptions/SubscriptionChooser.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SubscriptionChooser from "./SubscriptionChooser";

const baseProps = {
  basePrice: 300,
  discountPercent: 10,
  intervalCount: 2,
  intervalUnit: "week",
  onIntervalCountChange: vi.fn(),
  onIntervalUnitChange: vi.fn(),
};

describe("SubscriptionChooser", () => {
  it("hides the frequency dropdown until subscribe is selected", () => {
    render(<SubscriptionChooser {...baseProps} mode="onetime" onModeChange={vi.fn()} />);
    expect(screen.queryByLabelText(/delivery frequency/i)).not.toBeInTheDocument();
  });

  it("shows the frequency dropdown when subscribe is selected", () => {
    render(<SubscriptionChooser {...baseProps} mode="subscribe" onModeChange={vi.fn()} />);
    expect(screen.getByLabelText(/delivery frequency/i)).toBeInTheDocument();
  });

  it("renders the savings math and pill", () => {
    render(<SubscriptionChooser {...baseProps} mode="subscribe" onModeChange={vi.fn()} />);
    expect(screen.getByText("Save 10%")).toBeInTheDocument();
    expect(screen.getByText("Rs 270")).toBeInTheDocument();      // discounted
    expect(screen.getByText("Rs 300")).toBeInTheDocument();      // struck base
    expect(screen.getByText(/you save rs 30/i)).toBeInTheDocument();
  });

  it("calls onModeChange when a card is clicked", () => {
    const onModeChange = vi.fn();
    render(<SubscriptionChooser {...baseProps} mode="onetime" onModeChange={onModeChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /subscribe & save/i }));
    expect(onModeChange).toHaveBeenCalledWith("subscribe");
  });

  it("warns when the chosen interval is under 7 days", () => {
    render(
      <SubscriptionChooser {...baseProps} mode="subscribe" intervalUnit="day" intervalCount={3} onModeChange={vi.fn()} />
    );
    expect(screen.getByText(/minimum interval is 7 days/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/Components/Subscriptions/SubscriptionChooser.test.jsx`
Expected: FAIL — `Failed to resolve import "./SubscriptionChooser"`.

- [ ] **Step 3: Write the component**

```jsx
// src/Components/Subscriptions/SubscriptionChooser.jsx
import { computeSavings, isIntervalValid } from "../../utils/subscriptionPricing";
import "./SubscriptionChooser.css";

const defaultFormat = (n) => `Rs ${Math.round(n).toLocaleString()}`;

const SubscriptionChooser = ({
  basePrice,
  discountPercent,
  mode,
  onModeChange,
  intervalCount,
  intervalUnit,
  onIntervalCountChange,
  onIntervalUnitChange,
  formatAmount = defaultFormat,
  oneTimeLabel = "One-Time Purchase",
}) => {
  const { base, discounted, save } = computeSavings(basePrice, discountPercent);
  const subscribeActive = mode === "subscribe";
  const intervalOk = isIntervalValid(intervalUnit, intervalCount);

  return (
    <div className="subchooser" role="radiogroup" aria-label="Purchase option">
      {/* One-time card */}
      <button
        type="button"
        role="radio"
        aria-checked={mode === "onetime"}
        className={`subchooser-card${mode === "onetime" ? " subchooser-card--active subchooser-card--onetime" : ""}`}
        onClick={() => onModeChange("onetime")}
      >
        <span className="subchooser-dot" aria-hidden="true" />
        <span className="subchooser-card-body">
          <span className="subchooser-card-title">{oneTimeLabel}</span>
          <span className="subchooser-price-onetime">{formatAmount(base)}</span>
        </span>
      </button>

      {/* Subscribe card */}
      <button
        type="button"
        role="radio"
        aria-checked={subscribeActive}
        className={`subchooser-card${subscribeActive ? " subchooser-card--active subchooser-card--subscribe" : ""}`}
        onClick={() => onModeChange("subscribe")}
      >
        <span className="subchooser-dot" aria-hidden="true" />
        <span className="subchooser-card-body">
          <span className="subchooser-card-titlerow">
            <span className="subchooser-card-title">Subscribe &amp; Save</span>
            <span className="subchooser-pill">Save {discountPercent}%</span>
          </span>
          <span className="subchooser-pricerow">
            <span className="subchooser-price-base">{formatAmount(base)}</span>
            <span className="subchooser-price-discounted">{formatAmount(discounted)}</span>
          </span>
          <span className="subchooser-save">(You save {formatAmount(save)}!)</span>
        </span>
      </button>

      {/* Conditional frequency dropdown */}
      {subscribeActive && (
        <div className="subchooser-freq">
          <label className="subchooser-freq-label" htmlFor="subchooser-freq-select">
            Delivery frequency
          </label>
          <div className="subchooser-freq-row">
            <span>Every</span>
            <input
              type="number"
              min="1"
              value={intervalCount}
              onChange={(e) => onIntervalCountChange(e.target.value)}
              className="subchooser-freq-count"
              aria-label="Interval count"
            />
            <select
              id="subchooser-freq-select"
              value={intervalUnit}
              onChange={(e) => onIntervalUnitChange(e.target.value)}
            >
              <option value="day">day(s)</option>
              <option value="week">week(s)</option>
            </select>
          </div>
          {!intervalOk && (
            <p className="subchooser-warn">Minimum interval is 7 days.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionChooser;
```

- [ ] **Step 4: Write the CSS**

```css
/* src/Components/Subscriptions/SubscriptionChooser.css */
.subchooser { display: flex; flex-direction: column; gap: 10px; margin: 14px 0; }

.subchooser-card {
  display: flex; align-items: flex-start; gap: 10px; width: 100%;
  text-align: left; cursor: pointer; background: #fff;
  border: 2px solid #e2e0da; border-radius: 12px; padding: 14px 16px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.subchooser-card--active.subchooser-card--onetime { border-color: #8a93a0; }
.subchooser-card--active.subchooser-card--subscribe {
  border-color: #1d9e75; box-shadow: 0 0 0 1px #1d9e75 inset;
}

.subchooser-dot {
  flex: 0 0 auto; width: 16px; height: 16px; margin-top: 3px;
  border: 2px solid #b9b6ad; border-radius: 50%;
}
.subchooser-card--active .subchooser-dot {
  border-color: #1d9e75; background:
    radial-gradient(circle, #1d9e75 0 5px, transparent 6px);
}
.subchooser-card--active.subchooser-card--onetime .subchooser-dot { border-color: #8a93a0; background:
  radial-gradient(circle, #8a93a0 0 5px, transparent 6px); }

.subchooser-card-body { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.subchooser-card-titlerow { display: flex; align-items: center; gap: 8px; }
.subchooser-card-title { font-weight: 700; color: #1f2a24; }
.subchooser-price-onetime { color: #4a544c; font-weight: 600; }

.subchooser-pill {
  background: #d8f3e6; color: #0f6b48; font-size: 12px; font-weight: 700;
  padding: 2px 10px; border-radius: 999px;
}

.subchooser-pricerow { display: flex; align-items: baseline; gap: 8px; }
.subchooser-price-base {
  color: #9aa0a6; font-size: 14px; text-decoration: line-through;
}
.subchooser-price-discounted {
  color: #1d9e75; font-size: 20px; font-weight: 800;
}
.subchooser-save { color: #0f6b48; font-size: 12px; font-weight: 600; }

.subchooser-freq {
  border: 1px solid #e8e4dc; border-radius: 10px; padding: 12px; background: #f8fbf9;
}
.subchooser-freq-label {
  display: block; font-size: 12px; font-weight: 600; color: #4a544c; margin-bottom: 6px;
}
.subchooser-freq-row { display: flex; align-items: center; gap: 8px; }
.subchooser-freq-count { width: 64px; padding: 6px 8px; border: 1px solid #d8d4cc; border-radius: 6px; }
.subchooser-freq-row select { padding: 6px 8px; border: 1px solid #d8d4cc; border-radius: 6px; }
.subchooser-warn { color: #c0392b; font-size: 12px; margin: 8px 0 0; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/Components/Subscriptions/SubscriptionChooser.test.jsx`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/Components/Subscriptions/SubscriptionChooser.jsx src/Components/Subscriptions/SubscriptionChooser.css src/Components/Subscriptions/SubscriptionChooser.test.jsx
git commit -m "feat(subscriptions): add SubscriptionChooser savings card component"
```

---

### Task 3: Rewrite SubscribeWidget as adapter + one smart button

**Files:**
- Modify: `src/Components/Subscriptions/SubscribeWidget.jsx` (full rewrite)
- Modify: `src/Components/Subscriptions/SubscribeWidget.css`

- [ ] **Step 1: Rewrite the widget**

Replace the entire contents of `src/Components/Subscriptions/SubscribeWidget.jsx` with:

```jsx
import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { FiRepeat } from "react-icons/fi";
import subscriptionsApi from "../../Services/api/subscriptionsApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import SubscriptionChooser from "./SubscriptionChooser";
import { isIntervalValid } from "../../utils/subscriptionPricing";
import "./SubscribeWidget.css";

const DISCOUNT = Number(import.meta.env.VITE_SUBSCRIPTION_DISCOUNT_PERCENT) || 10;

const SubscribeWidget = ({
  product,
  quantity = 1,
  variantId = null,
  unitPrice = 0,
  onAddToCart,
  outOfStock = false,
}) => {
  const [mode, setMode] = useState("onetime");
  const [unit, setUnit] = useState("week");
  const [count, setCount] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const intervalOk = isIntervalValid(unit, count);

  const subscribe = async () => {
    if (!user) {
      addToast("Please log in to subscribe", "error");
      return;
    }
    if (!intervalOk) {
      addToast("Minimum interval is 7 days", "error");
      return;
    }
    const addr = {
      street: user.address || "-", city: "-", state: "-", country: "-", zipCode: "-",
    };
    try {
      setSubmitting(true);
      await subscriptionsApi.create({
        items: [{ product: product._id || product.id, variantId: variantId || null, quantity }],
        shippingAddress: addr,
        paymentMethod: "stripe",
        intervalUnit: unit,
        intervalCount: Number(count),
        source: "product",
      });
      addToast("Subscribed! Manage it under My Subscriptions.", "success");
      setMode("onetime");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to subscribe", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const subscribeMode = mode === "subscribe";
  const buttonDisabled = subscribeMode
    ? submitting || !intervalOk
    : outOfStock;

  const handleClick = () => {
    if (subscribeMode) subscribe();
    else onAddToCart?.();
  };

  return (
    <div className="sw-box">
      <SubscriptionChooser
        basePrice={(Number(unitPrice) || 0) * quantity}
        discountPercent={DISCOUNT}
        mode={mode}
        onModeChange={setMode}
        intervalCount={count}
        intervalUnit={unit}
        onIntervalCountChange={setCount}
        onIntervalUnitChange={setUnit}
      />
      <button
        type="button"
        className="sw-smartbtn"
        disabled={buttonDisabled}
        onClick={handleClick}
      >
        {subscribeMode ? (
          <>
            <FiRepeat /> {submitting ? "Subscribing…" : `Subscribe & Save ${DISCOUNT}%`}
          </>
        ) : (
          <>
            <FaShoppingCart /> {outOfStock ? "Out of Stock" : "Add to Cart"}
          </>
        )}
      </button>
    </div>
  );
};

export default SubscribeWidget;
```

- [ ] **Step 2: Replace the widget CSS**

Replace the entire contents of `src/Components/Subscriptions/SubscribeWidget.css` with:

```css
.sw-box { margin: 14px 0; }
.sw-smartbtn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; background: #1d9e75; color: #fff; border: none; border-radius: 10px;
  padding: 12px 18px; font-weight: 700; font-size: 15px; cursor: pointer;
}
.sw-smartbtn:disabled { opacity: 0.6; cursor: not-allowed; }
```

- [ ] **Step 3: Verify it builds (no test for the wrapper yet — covered by Task 5 integration build)**

Run: `npx vitest run src/Components/Subscriptions/SubscriptionChooser.test.jsx src/utils/subscriptionPricing.test.js`
Expected: PASS (still green — no regressions in the shared units).

- [ ] **Step 4: Commit**

```bash
git add src/Components/Subscriptions/SubscribeWidget.jsx src/Components/Subscriptions/SubscribeWidget.css
git commit -m "feat(subscriptions): rewrite SubscribeWidget as chooser + one smart button"
```

---

### Task 4: Wire the product page (remove standalone Add to Cart, feed the widget)

**Files:**
- Modify: `src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx` (lines ~617–631)

- [ ] **Step 1: Replace the Add to Cart button + SubscribeWidget block**

Find this block (around line 617):

```jsx
              <button
                type="button"
                className="ip-btn ip-btn--primary ip-btn--cart"
                onClick={handleAddToCart}
                disabled={vStock === 0}
              >
                <FaShoppingCart size={15} />
                {stockQty === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <SubscribeWidget
                product={product}
                quantity={quantity}
                variantId={hasVariants ? selectedVariant?._id : null}
              />
```

Replace it with:

```jsx
              <SubscribeWidget
                product={product}
                quantity={quantity}
                variantId={hasVariants ? selectedVariant?._id : null}
                unitPrice={displayEffective}
                onAddToCart={handleAddToCart}
                outOfStock={vStock === 0}
              />
```

- [ ] **Step 2: Confirm `FaShoppingCart` is still used elsewhere or remove the now-dead import**

Run: `npx vitest run --silent 2>&1 | head -1` is not the check here. Instead grep:
Run: `grep -n "FaShoppingCart" src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx`
Expected: no remaining references. If none remain, remove `FaShoppingCart` from the `react-icons/fa` import line at the top of the file. If other references remain, leave the import as is.

- [ ] **Step 3: Build to verify the page compiles**

Run: `npm run build`
Expected: build completes with no errors referencing `IndividualProductItemPage` or `SubscribeWidget`.

- [ ] **Step 4: Commit**

```bash
git add src/Pages/IndividualProductItemPage/IndividualProductItemPage.jsx
git commit -m "feat(subscriptions): product page uses one smart add-to-cart/subscribe button"
```

---

### Task 5: Wire the cart (replace makeRecurring checkbox with the chooser)

**Files:**
- Modify: `src/Pages/CartCheckoutPage/CartCheckOutPage.jsx` (lines ~48–50, ~64–92, ~368–393)

- [ ] **Step 1: Add the import**

At the top of the file, alongside the other component imports, add:

```jsx
import SubscriptionChooser from "../../Components/Subscriptions/SubscriptionChooser";
import { isIntervalValid } from "../../utils/subscriptionPricing";
```

Add the discount constant near the top of the module (after imports):

```jsx
const SUB_DISCOUNT = Number(import.meta.env.VITE_SUBSCRIPTION_DISCOUNT_PERCENT) || 10;
```

- [ ] **Step 2: Replace the `makeRecurring` checkbox block**

Find this block (around line 368):

```jsx
                <div className="cart-recurring">
                  <label className="cart-recurring-toggle">
                    <input
                      type="checkbox"
                      checked={makeRecurring}
                      onChange={(e) => setMakeRecurring(e.target.checked)}
                    />
                    <span>Make this a recurring order &amp; save</span>
                  </label>
                  {makeRecurring && (
                    <div className="cart-recurring-row">
                      <span>Every</span>
                      <input
                        type="number"
                        min="1"
                        value={recurCount}
                        onChange={(e) => setRecurCount(e.target.value)}
                        className="cart-recurring-count"
                      />
                      <select value={recurUnit} onChange={(e) => setRecurUnit(e.target.value)}>
                        <option value="day">day(s)</option>
                        <option value="week">week(s)</option>
                      </select>
                    </div>
                  )}
                </div>
```

Replace it with:

```jsx
                <div className="cart-recurring">
                  <SubscriptionChooser
                    basePrice={subtotal}
                    discountPercent={SUB_DISCOUNT}
                    mode={makeRecurring ? "subscribe" : "onetime"}
                    onModeChange={(m) => setMakeRecurring(m === "subscribe")}
                    intervalCount={recurCount}
                    intervalUnit={recurUnit}
                    onIntervalCountChange={setRecurCount}
                    onIntervalUnitChange={setRecurUnit}
                  />
                </div>
```

- [ ] **Step 3: Gate Place Order on interval validity**

In `handlePlaceOrder` (around line 64), immediately after `setPlacing(true);` add the guard:

```jsx
      if (makeRecurring && !isIntervalValid(recurUnit, recurCount)) {
        addToast("Minimum subscription interval is 7 days", "error");
        setPlacing(false);
        return;
      }
```

- [ ] **Step 4: Build to verify the cart compiles**

Run: `npm run build`
Expected: build completes with no errors referencing `CartCheckOutPage`.

- [ ] **Step 5: Run the full frontend test suite (no regressions)**

Run: `npx vitest run`
Expected: all suites pass, including `MySubscriptions.test.jsx`, the new util test, and the new chooser test.

- [ ] **Step 6: Commit**

```bash
git add src/Pages/CartCheckoutPage/CartCheckOutPage.jsx
git commit -m "feat(subscriptions): cart uses SubscriptionChooser for recurring order choice"
```

---

### Task 6: Update shared status memory

**Files:**
- Modify: `../backend/.claude/memory/STATUS.md` (Notes section)

- [ ] **Step 1: Add a note under the Notes section**

In `backend/.claude/memory/STATUS.md`, add a bullet under `## Notes`:

```markdown
- **Subscription savings chooser (2026-06-24)** — Product page + cart now use a shared `SubscriptionChooser` component (two radio cards, "Save N%" pill, strikethrough→green savings math, conditional frequency dropdown). Product page merged Add to Cart + Subscribe into one smart button. Savings math + 7-day rule live in `frontend/src/utils/subscriptionPricing.js`.
```

- [ ] **Step 2: Commit**

```bash
cd ../backend
git add .claude/memory/STATUS.md
git commit -m "chore(memory): note subscription savings chooser shipped"
cd ../frontend
```

---

## Self-Review Notes

- **Spec coverage:** Two selectable radio cards (Task 2 cards) ✓; active border colors gray/green (`.subchooser-card--active--onetime/--subscribe`) ✓; conditional frequency dropdown (Task 2 `subscribeActive` gate) ✓; original price strikethrough greyed (`.subchooser-price-base`) ✓; discounted larger/green/bold (`.subchooser-price-discounted`) ✓; "You save Rs X" auto-computed (`computeSavings`, Task 1) ✓; "Save N%" pill green-bg/dark-green-text (`.subchooser-pill`) ✓; both surfaces wired (Tasks 4–5) ✓.
- **No placeholders:** all steps contain full code or exact commands.
- **Type consistency:** `mode` is `"onetime"|"subscribe"` everywhere; `computeSavings`/`isIntervalValid` signatures identical across Tasks 1–5; `SubscriptionChooser` prop names identical in component (Task 2) and both consumers (Tasks 3, 5).
- **Note on cart `subtotal`:** base is whole-cart subtotal (sale-aware totals already reflected in `cartTotal`); discount displayed there matches the backend's order-total discount.
```
