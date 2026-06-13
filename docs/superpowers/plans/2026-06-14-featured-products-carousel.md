# Featured Products Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed 3-card grid in the HomePage "Featured Products" section with a responsive, autoplaying carousel that browses through all featured items per category tab.

**Architecture:** Reuse the existing embla-based `src/Components/ui/carousel.jsx` primitives. The `FeaturedProductSection` keeps its tabs, prefetch, and Framer Motion reveals; only the grid region becomes a `<Carousel>`. Position dots are driven by the embla `api` (via `setApi`); autoplay comes from the `embla-carousel-autoplay` plugin, gated on `prefers-reduced-motion`.

**Tech Stack:** React, Vite, Tailwind, embla-carousel-react (installed), embla-carousel-autoplay (new), Framer Motion, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-06-14-featured-products-carousel-design.md`

---

## File Structure

- **Create** `src/Pages/HomePage/HomePageSections/featuredAutoplay.js` — pure helpers: `prefersReducedMotion()` and `buildCarouselPlugins()`. Isolated so the reduced-motion decision is unit-testable without rendering embla.
- **Create** `src/Pages/HomePage/HomePageSections/featuredAutoplay.test.js` — tests for the helper.
- **Modify** `src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx` — replace the `fp-grid` block with the carousel + dots; bump the API limit from 3 to 100.
- **Create** `src/Pages/HomePage/HomePageSections/FeaturedProductSection.test.jsx` — tests for API limit, card rendering, and tab switching (carousel + autoplay mocked).
- **Modify** `src/Pages/HomePage/HomePageSections/FeaturedProductSection.css` — add `.fp-dots`, `.fp-dot`, carousel viewport padding for the side arrows.
- **Modify** `package.json` / `package-lock.json` — add `embla-carousel-autoplay`.

---

## Task 1: Add the autoplay dependency

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install the plugin**

Run (from `frontend/`):
```bash
npm install embla-carousel-autoplay@^8.3.0
```
Expected: adds `"embla-carousel-autoplay": "^8.3.0"` to `dependencies`, no peer-dependency errors (matches installed `embla-carousel-react@^8.3.0`).

- [ ] **Step 2: Verify it resolves**

Run:
```bash
node -e "require.resolve('embla-carousel-autoplay'); console.log('ok')"
```
Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add embla-carousel-autoplay dependency"
```

---

## Task 2: Autoplay helper (reduced-motion gate)

**Files:**
- Create: `src/Pages/HomePage/HomePageSections/featuredAutoplay.js`
- Test: `src/Pages/HomePage/HomePageSections/featuredAutoplay.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/Pages/HomePage/HomePageSections/featuredAutoplay.test.js`:
```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { buildCarouselPlugins, prefersReducedMotion } from "./featuredAutoplay";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubMatchMedia(matches) {
  vi.stubGlobal("matchMedia", (query) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

describe("featuredAutoplay", () => {
  it("reports reduced motion when the media query matches", () => {
    stubMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it("returns no plugins when the user prefers reduced motion", () => {
    stubMatchMedia(true);
    expect(buildCarouselPlugins()).toEqual([]);
  });

  it("returns one autoplay plugin when motion is allowed", () => {
    stubMatchMedia(false);
    const plugins = buildCarouselPlugins();
    expect(plugins).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/Pages/HomePage/HomePageSections/featuredAutoplay.test.js
```
Expected: FAIL — cannot resolve `./featuredAutoplay` (module not found).

- [ ] **Step 3: Write minimal implementation**

Create `src/Pages/HomePage/HomePageSections/featuredAutoplay.js`:
```js
import Autoplay from "embla-carousel-autoplay";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function buildCarouselPlugins() {
  if (prefersReducedMotion()) return [];
  return [
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/Pages/HomePage/HomePageSections/featuredAutoplay.test.js
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/Pages/HomePage/HomePageSections/featuredAutoplay.js src/Pages/HomePage/HomePageSections/featuredAutoplay.test.js
git commit -m "feat: add reduced-motion-aware carousel autoplay helper"
```

---

## Task 3: Rewrite FeaturedProductSection grid into a carousel

**Files:**
- Modify: `src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx`
- Test: `src/Pages/HomePage/HomePageSections/FeaturedProductSection.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/Pages/HomePage/HomePageSections/FeaturedProductSection.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Carousel mocked to lightweight passthroughs — embla needs real layout/ResizeObserver
vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }) => <div>{children}</div>,
  CarouselItem: ({ children }) => <div>{children}</div>,
  CarouselPrevious: () => <button type="button">prev</button>,
  CarouselNext: () => <button type="button">next</button>,
}));

// Autoplay plugin construction is not exercised here
vi.mock("./featuredAutoplay", () => ({ buildCarouselPlugins: () => [] }));

vi.mock("@/Services/api/productsApi", () => ({
  default: { getFeaturedByCategory: vi.fn() },
}));

import productsApi from "@/Services/api/productsApi";
import FeaturedProductSection from "./FeaturedProductSection";

const make = (name) => [{ _id: name, name, price: 100, images: [{ url: "" }] }];

beforeEach(() => {
  vi.clearAllMocks();
  productsApi.getFeaturedByCategory.mockImplementation((key) =>
    Promise.resolve(make(`${key}-product`))
  );
});

describe("FeaturedProductSection carousel", () => {
  it("requests up to 100 featured items per category", async () => {
    render(<FeaturedProductSection />, { wrapper: MemoryRouter });
    await waitFor(() => {
      expect(productsApi.getFeaturedByCategory).toHaveBeenCalledWith("general", 100);
      expect(productsApi.getFeaturedByCategory).toHaveBeenCalledWith("dogs", 100);
      expect(productsApi.getFeaturedByCategory).toHaveBeenCalledWith("cats", 100);
      expect(productsApi.getFeaturedByCategory).toHaveBeenCalledWith("fish", 100);
    });
  });

  it("renders the active category's products inside the carousel", async () => {
    render(<FeaturedProductSection />, { wrapper: MemoryRouter });
    const carousel = await screen.findByTestId("carousel");
    expect(await within(carousel).findByText("general-product")).toBeInTheDocument();
  });

  it("switches the carousel contents when another tab is clicked", async () => {
    render(<FeaturedProductSection />, { wrapper: MemoryRouter });
    await screen.findByTestId("carousel");
    fireEvent.click(screen.getByRole("button", { name: "Dogs" }));
    const carousel = await screen.findByTestId("carousel");
    expect(await within(carousel).findByText("dogs-product")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/Pages/HomePage/HomePageSections/FeaturedProductSection.test.jsx
```
Expected: FAIL — `getFeaturedByCategory` called with `3` not `100`, and no element with `data-testid="carousel"` (component still renders the grid).

- [ ] **Step 3: Rewrite the component**

Replace the entire contents of `src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx` with:
```jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import ProductCard from "../../../Components/HelperComponents/ProductCard/ProductCardV2";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { buildCarouselPlugins } from "./featuredAutoplay";
import productsApi from "@/Services/api/productsApi";
import "./FeaturedProductSection.css";

// Keys must exactly match the category values stored in the DB
const TABS = [
  { key: "general", label: "General" },
  { key: "dogs",    label: "Dogs" },
  { key: "cats",    label: "Cats" },
  { key: "fish",    label: "Fish" },
];

// "Load all" — featured sets are admin-curated and small; the /products
// endpoint defaults to limit=10 and has no hard cap, so a generous limit
// returns every featured item for any realistic catalog.
const FEATURED_LIMIT = 100;

const FeaturedProductSection = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [products, setProducts] = useState({ cats: [], dogs: [], fish: [], general: [] });
  const [loading, setLoading] = useState(true);

  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, amount: 0.3 });

  const plugins = useMemo(() => buildCarouselPlugins(), []);

  // Embla api + dot state (re-bound each time the carousel re-mounts per tab)
  const [emblaApi, setEmblaApi] = useState(null);
  const [snaps, setSnaps] = useState([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    const onReInit = () => {
      setSnaps(emblaApi.scrollSnapList());
      onSelect();
    };
    onReInit();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi]);

  useEffect(() => {
    let resolved = 0;
    TABS.forEach(({ key }) => {
      productsApi
        .getFeaturedByCategory(key, FEATURED_LIMIT)
        .then((data) => {
          setProducts((prev) => ({ ...prev, [key]: data }));
        })
        .catch((err) => console.error(`Error fetching featured ${key}:`, err))
        .finally(() => {
          resolved++;
          if (resolved === TABS.length) setLoading(false);
        });
    });
  }, []);

  const currentProducts = products[activeTab];

  return (
    <section className="fp-section">
      {/* Header */}
      <motion.div
        ref={headerRef}
        className="fp-header"
        initial={{ opacity: 0, y: -20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className="fp-title">Featured Products</h2>
        <a href="/petshop" className="fp-view-more-btn">View More &rsaquo;</a>
      </motion.div>

      {/* Category tabs — sliding pill */}
      <motion.div
        className="fp-tabs-wrapper"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="fp-tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`fp-tab${activeTab === key ? " fp-tab-active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {activeTab === key && (
                <motion.span
                  className="fp-tab-bg"
                  layoutId="fp-tab-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="fp-tab-label">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Product carousel */}
      <div className="fp-grid-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="fp-carousel-shell"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="fp-skeleton-row">
                {Array(3).fill(null).map((_, i) => (
                  <div key={i} className="fp-skeleton" />
                ))}
              </div>
            ) : currentProducts.length === 0 ? (
              <p className="fp-empty">No products available right now.</p>
            ) : (
              <Carousel
                className="fp-carousel"
                opts={{ align: "start" }}
                plugins={plugins}
                setApi={setEmblaApi}
              >
                <CarouselContent>
                  {currentProducts.map((product) => (
                    <CarouselItem
                      key={product._id || product.id}
                      className="basis-[83%] sm:basis-1/2 lg:basis-1/3"
                    >
                      <ProductCard
                        id={product._id || product.id}
                        imageUrl={product.images?.[0]?.url || product.images?.[0] || product.imageUrl}
                        title={product.name || product.title}
                        price={product.price}
                        description={product.description}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="fp-arrow fp-arrow-prev" />
                <CarouselNext className="fp-arrow fp-arrow-next" />
              </Carousel>
            )}
          </motion.div>
        </AnimatePresence>

        {!loading && currentProducts.length > 0 && snaps.length > 1 && (
          <div className="fp-dots">
            {snaps.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`fp-dot${i === selected ? " fp-dot-active" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductSection;
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/Pages/HomePage/HomePageSections/FeaturedProductSection.test.jsx
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/Pages/HomePage/HomePageSections/FeaturedProductSection.jsx src/Pages/HomePage/HomePageSections/FeaturedProductSection.test.jsx
git commit -m "feat: turn featured products grid into a carousel"
```

---

## Task 4: Carousel + dots styling

**Files:**
- Modify: `src/Pages/HomePage/HomePageSections/FeaturedProductSection.css`

- [ ] **Step 1: Append carousel styles**

Append to `src/Pages/HomePage/HomePageSections/FeaturedProductSection.css`:
```css
/* Carousel viewport — horizontal padding so the side arrows aren't clipped */
.fp-carousel {
  position: relative;
  padding: 0 2.75rem;
}

/* Pin the default ui/carousel arrows to the padded edges of the section */
.fp-arrow.fp-arrow-prev { left: 0; }
.fp-arrow.fp-arrow-next { right: 0; }

/* Skeleton row mirrors a 3-up layout while loading */
.fp-skeleton-row {
  display: flex;
  gap: 1rem;
  padding: 0 2.75rem;
}
.fp-skeleton-row .fp-skeleton {
  flex: 1 1 0;
  height: 320px;
}

/* Position dots */
.fp-dots {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 1rem;
}
.fp-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 9999px;
  background: #d6ccbf;
  cursor: pointer;
  transition: width 0.25s ease, background 0.25s ease;
}
.fp-dot-active {
  width: 20px;
  background: #b45309;
}

@media (max-width: 640px) {
  .fp-carousel { padding: 0 0.5rem; }
  .fp-arrow { display: none; } /* mobile: drag + dots only */
  .fp-skeleton-row { padding: 0 0.5rem; }
}
```

- [ ] **Step 2: Verify the build compiles**

Run:
```bash
npm run build
```
Expected: build succeeds (`✓ built in …`), zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/Pages/HomePage/HomePageSections/FeaturedProductSection.css
git commit -m "style: carousel arrows, dots and loading skeleton for featured section"
```

---

## Task 5: Full test run + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full frontend test suite**

Run:
```bash
npm test
```
Expected: all suites pass, including the two new files.

- [ ] **Step 2: Manual browser check**

Run:
```bash
npm run dev
```
Then in the browser on the HomePage Featured section, confirm:
- Desktop: 3 cards visible, side arrows page through, dots reflect position, autoplay advances ~every 5s and pauses on hover.
- Resize to mobile width: ~1.2 cards (peek of next), arrows hidden, drag + dots work.
- A category with ≤3 featured items shows disabled/absent arrows and a single dot (looks like the old static row).
- Tab switch crossfades and resets the carousel to the first item.

- [ ] **Step 3: Final commit (if any manual tweaks were needed)**

```bash
git add -A
git commit -m "chore: featured carousel manual-verification tweaks"
```

---

## Self-Review

- **Spec coverage:** Option-A layout (Task 3 markup + Task 4 arrows/dots) ✓; responsive 3/2/1.2 (`basis-[83%] sm:basis-1/2 lg:basis-1/3`) ✓; autoplay + pause-on-hover + reduced-motion gate (Task 1 dep, Task 2 helper, Task 3 `plugins`) ✓; load-all via `FEATURED_LIMIT = 100` (Task 3) ✓; reuse `ui/carousel.jsx` (Task 3) ✓; fallback logic untouched (component still calls `getFeaturedByCategory`, which keeps its internal fallback) ✓; ≤cards-per-view edge case (arrows auto-disable via embla `canScroll*`, dots hidden when `snaps.length <= 1`) ✓; loading skeletons + empty state ✓; tests per spec (Tasks 2 & 3) ✓.
- **Placeholder scan:** none — every code/command step is concrete.
- **Type/name consistency:** `buildCarouselPlugins` (Task 2 → used Task 3); `FEATURED_LIMIT = 100` matches the test's expected `100`; `setEmblaApi`/`emblaApi`/`snaps`/`selected` consistent within Task 3; mocked module path `@/components/ui/carousel` matches the component import.
- **Note:** the component test mocks `@/components/ui/carousel` and `./featuredAutoplay` because embla requires real layout/ResizeObserver that jsdom lacks; embla's own behavior (snapping, autoplay timing) is verified manually in Task 5, not in jsdom.
