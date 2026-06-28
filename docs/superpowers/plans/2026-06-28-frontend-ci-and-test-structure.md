# Frontend CI Pipelines & Test Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the frontend repo the same CI surface and test-pyramid structure the backend already has — unit / integration / e2e layers plus the 5 GitHub Actions workflows (ci, codeql, sonarcloud, labeler, ai-summary) — adapted from Jest/Supertest to Vitest/MSW/Playwright.

**Architecture:** Vitest "projects" express the pyramid: `unit` (co-located `src/**/*.test.{js,jsx}`, jsdom, no network) and `integration` (`tests/integration/**`, React Router + MSW-mocked API). Playwright owns `e2e` (`tests/e2e/**/*.spec.js`, real browser against the dev server). CI runs each layer as a separate job, merges partial coverage with `nyc` (identical to the backend's A2 merge), and posts one PR coverage+test comment. The other four workflows mirror the backend's, retargeted to frontend globs.

**Tech Stack:** Vite 5, React 18, Vitest 4.1.9 (+ @vitest/coverage-v8), MSW 2, Playwright 1, GitHub Actions, SonarCloud, CodeQL.

---

## Background: what the backend does (the target to mirror)

- **`tests/` layout:** `tests/helpers/` (shared setup/factories), `tests/integration/<domain>/`, `tests/e2e/` (README placeholder).
- **Jest projects:** `unit` = co-located `src/**/*.test.js`; `integration` = `tests/integration/**` with global Mongo setup/teardown.
- **Scripts:** `test`, `test:unit`, `test:integration`, `test:all`, `test:coverage`, `lint`, `lint:fix`.
- **Workflows:** `ci.yml` (unit → integration → report → reviewdog), `codeql.yml`, `sonarcloud.yml`, `labeler.yml` (+ `.github/labeler.yml` config), `ai-summary.yml`.
- **CI coverage strategy:** each test job runs `--coverage --coverageReporters=json`, uploads `coverage-final.json` as an artifact; the `report` job `nyc merge`s them into one whole-codebase report and posts a PR comment.

## Frontend differences (why it is not a literal copy)

| Backend | Frontend equivalent |
|---|---|
| Jest `projects` | Vitest `test.projects` (v4 API) |
| Supertest + in-memory Mongo (integration) | React Testing Library + React Router + **MSW** (integration) |
| `tests/e2e` reserved placeholder | **Playwright** set up for real (config + smoke spec) |
| `jest-junit` reporter | Vitest built-in `junit` reporter (no extra dep) |
| Sonar key `Raj-SW_petstore-backend` | new key `Raj-SW_petstore-frontend` |
| CodeQL `javascript` | `javascript-typescript`, frontend `paths-ignore` |

## Target file structure

```
.github/
  labeler.yml                      # path→label config
  workflows/
    ci.yml                         # unit → integration → e2e → report → reviewdog
    codeql.yml
    sonarcloud.yml
    labeler.yml
    ai-summary.yml
tests/
  helpers/
    setup.unit.js                  # jest-dom + IntersectionObserver polyfill (moved from src/test/setup.js)
    setup.integration.js           # the above + MSW server lifecycle
    server.js                      # MSW node server
    handlers.js                    # default MSW request handlers
    render.jsx                     # renderWithProviders (MemoryRouter + CurrencyProvider)
  integration/
    harness.test.jsx               # self-contained MSW+axios+RTL smoke (proves the wiring)
    README.md                      # how to add real page-level integration tests
  e2e/
    home.spec.js                   # Playwright smoke: app boots, hero renders
    README.md
vitest.config.js                   # NEW — projects: unit, integration + shared coverage
playwright.config.js               # NEW
sonar-project.properties           # NEW
```

**Cleanup performed along the way:**
- The 3 stray unit tests in `src/test/` are co-located next to their sources.
- `src/test/setup.js` moves to `tests/helpers/setup.unit.js`.
- `src/test/` is deleted.
- The inline `test` block is removed from `vite.config.js` (Vitest config moves to its own file).

---

## Phase 0 — Tooling & dependencies

### Task 0: Install MSW and Playwright

**Files:**
- Modify: `package.json` (devDependencies + scripts)
- Modify: `package-lock.json` (auto)

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm i -D msw @playwright/test
npx playwright install --with-deps chromium
```
Expected: `package.json` gains `msw` and `@playwright/test` under devDependencies; Chromium downloaded.

- [ ] **Step 2: Replace the `scripts` block in `package.json`**

Replace the existing `"scripts": { ... }` object with:
```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "debug": "vite --debug",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:integration": "vitest run --project integration",
    "test:e2e": "playwright test",
    "test:all": "npm run test:unit && npm run test:integration",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  },
```

- [ ] **Step 3: Verify scripts resolve**

Run: `npm run test:unit -- --help`
Expected: Vitest help text prints (confirms `--project` script wiring is valid). Project `unit` does not exist yet — that is fixed in Phase 1; `--help` short-circuits before project resolution.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(ci): add msw + playwright, restructure test scripts"
```

---

## Phase 1 — Vitest projects & test-pyramid scaffolding

### Task 1: Create the Vitest config with unit + integration projects

**Files:**
- Create: `vitest.config.js`
- Modify: `vite.config.js` (remove inline `test` block)

- [ ] **Step 1: Create `vitest.config.js`**

```js
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// The test pyramid as Vitest projects:
//   unit        co-located src/**/*.test.{js,jsx}. jsdom, no network, fast.
//   integration tests/integration/**. React Router + MSW-mocked API.
// e2e lives outside Vitest (Playwright, tests/e2e/**/*.spec.js).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    // Shared coverage config — applies across whichever projects run in a
    // single --coverage pass. json (coverage-final) is the mergeable raw data
    // for the CI nyc-merge; json-summary feeds the PR comment; lcov feeds Sonar.
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov", "json", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "tests/**",
        "**/*.test.{js,jsx}",
        "src/main.jsx",
        "src/**/*.config.js",
        "**/index.{js,jsx}",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./tests/helpers/setup.unit.js"],
          include: ["src/**/*.test.{js,jsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./tests/helpers/setup.integration.js"],
          include: ["tests/integration/**/*.test.{js,jsx}"],
        },
      },
    ],
  },
});
```

- [ ] **Step 2: Remove the inline `test` block from `vite.config.js`**

`vite.config.js` must end up as (app config only — Vitest now reads `vitest.config.js`):
```js
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

- [ ] **Step 3: Create the unit setup file (moved from `src/test/setup.js`)**

Create `tests/helpers/setup.unit.js`:
```js
import "@testing-library/jest-dom";

// jsdom doesn't implement IntersectionObserver (used by framer-motion whileInView).
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}
```

- [ ] **Step 4: Run the existing unit suite through the new config**

Run: `npm run test:unit`
Expected: all existing tests run under the `unit` project and pass (the suite was green before this change; setup moved, behaviour identical). If any test fails to find `src/test/setup.js`, that is expected — it is removed in Task 2; no test imports it directly.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.js vite.config.js tests/helpers/setup.unit.js
git commit -m "test(unit): move Vitest config to vitest.config.js with unit+integration projects"
```

### Task 2: Co-locate the stray unit tests and delete `src/test/`

**Files:**
- Move: `src/test/CurrencyContext.test.jsx` → `src/context/CurrencyContext.test.jsx`
- Move: `src/test/Price.test.jsx` → `src/Components/HelperComponents/Price/Price.test.jsx`
- Move: `src/test/exchangeRatesService.test.js` → `src/Services/api/exchangeRatesService.test.js`
- Delete: `src/test/setup.js`, then the now-empty `src/test/`

- [ ] **Step 1: Move the three test files (git mv preserves history)**

Run:
```bash
git mv src/test/CurrencyContext.test.jsx src/context/CurrencyContext.test.jsx
git mv src/test/Price.test.jsx src/Components/HelperComponents/Price/Price.test.jsx
git mv src/test/exchangeRatesService.test.js src/Services/api/exchangeRatesService.test.js
git rm src/test/setup.js
```
Expected: 4 staged changes. All three test files import their subject via the `@/` alias, so the move does not break imports.

- [ ] **Step 2: Verify the directory is empty and remove it**

Run: `ls src/test 2>/dev/null && rmdir src/test 2>/dev/null; echo done`
Expected: `done` (directory gone or already removed by git).

- [ ] **Step 3: Re-run the unit suite from the new locations**

Run: `npm run test:unit`
Expected: same test count as before, all passing. The moved tests now resolve via the `unit` project's `src/**/*.test.{js,jsx}` glob.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test(unit): co-locate stray tests next to source, drop src/test"
```

---

## Phase 2 — Integration layer (MSW + React Router)

### Task 3: MSW server, handlers, and provider-aware render helper

**Files:**
- Create: `tests/helpers/handlers.js`
- Create: `tests/helpers/server.js`
- Create: `tests/helpers/setup.integration.js`
- Create: `tests/helpers/render.jsx`

- [ ] **Step 1: Create default MSW handlers**

Create `tests/helpers/handlers.js`:
```js
import { http, HttpResponse } from "msw";

// Default handlers shared by integration tests. Individual tests override these
// with server.use(...) for their specific scenario. jsdom's base URL is
// http://localhost/, so relative "/api/..." requests resolve against that host.
export const handlers = [
  http.get("/api/health", () => HttpResponse.json({ status: "ok" })),
];
```

- [ ] **Step 2: Create the MSW node server**

Create `tests/helpers/server.js`:
```js
import { setupServer } from "msw/node";
import { handlers } from "./handlers.js";

// Shared MSW server for the integration project. Lifecycle is wired in
// setup.integration.js (listen / resetHandlers / close).
export const server = setupServer(...handlers);
```

- [ ] **Step 3: Create the integration setup file**

Create `tests/helpers/setup.integration.js`:
```js
import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server.js";

// IntersectionObserver polyfill (framer-motion whileInView), same as unit.
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

// onUnhandledRequest: "error" surfaces any request a test forgot to mock,
// instead of letting it hang or hit a real network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- [ ] **Step 4: Create the provider-aware render helper**

Create `tests/helpers/render.jsx`:
```jsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CurrencyProvider } from "@/context/CurrencyContext";

// renderWithProviders mounts a subtree inside the providers a page needs:
// a MemoryRouter (so <Link>/useNavigate work) and the CurrencyProvider
// (so <Price> and currency-aware components render). Pass `route` to set the
// initial URL. Add more providers here as integration coverage grows.
export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CurrencyProvider>{ui}</CurrencyProvider>
    </MemoryRouter>,
  );
}

export * from "@testing-library/react";
```

> Note: `CurrencyProvider` is the named export of `src/context/CurrencyContext.jsx`. If execution reveals the provider export is named differently, adjust the import to the actual export name — do not invent a new provider.

- [ ] **Step 5: Commit**

```bash
git add tests/helpers/
git commit -m "test(integration): add MSW server, handlers, and renderWithProviders helper"
```

### Task 4: Integration harness self-test (proves MSW + axios + RTL wiring)

**Files:**
- Create: `tests/integration/harness.test.jsx`
- Test: itself

- [ ] **Step 1: Write the failing integration test**

Create `tests/integration/harness.test.jsx`:
```jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { http, HttpResponse } from "msw";
import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "../helpers/render.jsx";
import { server } from "../helpers/server.js";

// A minimal real-axios consumer. This is the integration analog of the
// backend's first Supertest smoke: it proves the MSW <-> axios <-> RTL
// pipeline is wired correctly before any page-level tests are written.
function DemoList() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    axios.get("/api/demo").then((res) => setItems(res.data.items));
  }, []);
  if (!items) return <p>Loading…</p>;
  return (
    <ul>
      {items.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}

describe("integration harness", () => {
  it("renders data fetched through MSW", async () => {
    server.use(
      http.get("/api/demo", () =>
        HttpResponse.json({ items: ["Rex", "Bella"] }),
      ),
    );

    renderWithProviders(<DemoList />);

    expect(await screen.findByText("Rex")).toBeInTheDocument();
    expect(screen.getByText("Bella")).toBeInTheDocument();
  });

  it("fails loudly on an unmocked request", async () => {
    // /api/health is in the default handlers, so this resolves; asserts the
    // default handler set is actually loaded.
    const res = await axios.get("/api/health");
    expect(res.data).toEqual({ status: "ok" });
  });
});
```

- [ ] **Step 2: Run it to verify it passes**

Run: `npm run test:integration`
Expected: PASS — 2 tests in the `integration` project. If MSW reports an unhandled `/api/demo` request, the `server.use` override is not taking effect; check `setupFiles` path in `vitest.config.js`.

- [ ] **Step 3: Write the integration README**

Create `tests/integration/README.md`:
```markdown
# Integration tests

Render real page/component subtrees through **React Router** with the API
**mocked by MSW** — the frontend analog of the backend's Supertest layer.

## Conventions

- File location: `tests/integration/<domain>/<thing>.test.jsx`
- Render with the shared helper: `renderWithProviders(ui, { route })`
  from `tests/helpers/render.jsx` (wraps MemoryRouter + CurrencyProvider).
- Mock endpoints with MSW. Add app-wide defaults to
  `tests/helpers/handlers.js`; override per-test with
  `server.use(http.get(...))`.
- Unhandled requests **fail the test** (`onUnhandledRequest: "error"`),
  so every network call a component makes must be mocked.

## Scope (what belongs here vs. unit)

- **Unit** (`src/**/*.test.jsx`): one component/util in isolation, deps mocked
  with `vi.mock`. No router, no network.
- **Integration** (here): a page subtree + router + MSW. Asserts that data
  fetching, rendering, and navigation work together.
- **E2E** (`tests/e2e/`): the real built app in a real browser (Playwright).

`harness.test.jsx` is the wiring smoke test — keep it as the canary that the
MSW/axios/RTL pipeline still works.
```

- [ ] **Step 4: Commit**

```bash
git add tests/integration/
git commit -m "test(integration): add MSW harness smoke test + conventions README"
```

---

## Phase 3 — E2E layer (Playwright)

### Task 5: Playwright config + smoke spec

**Files:**
- Create: `playwright.config.js`
- Create: `tests/e2e/home.spec.js`
- Create: `tests/e2e/README.md`
- Modify: `.gitignore` (Playwright artifacts)
- Modify: `eslint.config.js` (ignore Playwright output)

- [ ] **Step 1: Create the Playwright config**

Create `playwright.config.js`:
```js
import { defineConfig, devices } from "@playwright/test";

// E2E runs the real Vite build/dev server and drives it in a real browser.
// In CI we build + preview (production-like); locally `webServer` boots dev.
const PORT = 4173;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["junit", { outputFile: "reports/e2e-junit.xml" }], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Write the smoke spec**

Create `tests/e2e/home.spec.js`:
```js
import { test, expect } from "@playwright/test";

// Smoke: the production build boots and the homepage renders without a
// runtime crash. Asserts the document has a title and the page body has
// visible content — deliberately resilient to copy changes.
test("homepage boots and renders", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBeLessThan(400);

  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("body")).not.toBeEmpty();
});
```

- [ ] **Step 3: Replace the e2e README**

Overwrite `tests/e2e/README.md`:
```markdown
# E2E tests (Playwright)

Black-box tests that run the **real production build** in a real browser and
drive it as a user would.

## Run locally

```bash
npm run test:e2e            # builds, previews, runs chromium
npx playwright test --ui    # interactive UI mode
npx playwright show-report  # open the last HTML report
```

The `webServer` block in `playwright.config.js` builds the app and serves it
with `vite preview` on port 4173, so no manual server start is needed.

## Conventions

- File location: `tests/e2e/<flow>.spec.js`
- Keep specs resilient: assert on roles/test-ids and structural facts, not
  brittle exact copy.
- Network: e2e hits the app for real. For flows needing the backend, either
  point at a seeded staging API or stub at the network layer with
  `page.route(...)`.

## Planned coverage

Auth login → dashboard, petshop browse → filter, checkout happy path.
`home.spec.js` is the boot smoke — keep it green.
```

- [ ] **Step 4: Ignore Playwright artifacts**

Append to `.gitignore`:
```gitignore

# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
reports/
```

And add `reports`, `playwright-report`, `test-results` to the eslint `ignores` array in `eslint.config.js` — change the first config object from:
```js
  { ignores: ['dist'] },
```
to:
```js
  { ignores: ['dist', 'test-results', 'playwright-report', 'reports', 'coverage'] },
```

- [ ] **Step 5: Run the smoke spec**

Run: `npm run test:e2e`
Expected: 1 passed (chromium). First run builds the app (slower). If the build fails, fix the build before proceeding — e2e depends on a working production build.

- [ ] **Step 6: Confirm Vitest ignores e2e specs**

Run: `npm run test`
Expected: only `unit` + `integration` projects run; `tests/e2e/*.spec.js` is NOT picked up (Vitest `include` globs don't match `.spec.js` under `tests/e2e`). Confirms the two runners don't collide.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.js tests/e2e/ .gitignore eslint.config.js
git commit -m "test(e2e): add Playwright config + homepage smoke spec"
```

---

## Phase 4 — CI workflows (mirror the backend's 5)

### Task 6: Main CI pipeline (`ci.yml`)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# Cancel superseded runs on the same ref (e.g. rapid pushes to a PR branch).
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  unit:
    name: Unit tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage --coverage.reporter=json --reporter=junit --outputFile=reports/junit-unit.xml

      - name: Upload unit coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: cov-unit
          path: coverage/coverage-final.json
          if-no-files-found: error

      - name: Upload unit junit
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: junit-unit
          path: reports/junit-unit.xml
          if-no-files-found: error

  integration:
    name: Integration tests
    needs: unit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci

      - name: Run integration tests
        run: npm run test:integration -- --coverage --coverage.reporter=json --reporter=junit --outputFile=reports/junit-integration.xml

      - name: Upload integration coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: cov-integration
          path: coverage/coverage-final.json
          if-no-files-found: error

      - name: Upload integration junit
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: junit-integration
          path: reports/junit-integration.xml
          if-no-files-found: error

  e2e:
    name: E2E tests
    needs: unit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run e2e tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          if-no-files-found: ignore

  report:
    name: Coverage & test report
    needs: [unit, integration]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write   # post the coverage/test PR comment
      checks: write          # publish the test-results check
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci

      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: _artifacts

      # Merge the two partial coverage runs into one whole-codebase report.
      - name: Merge coverage
        run: |
          mkdir -p _merge .nyc_output coverage
          cp _artifacts/cov-unit/coverage-final.json _merge/unit.json
          cp _artifacts/cov-integration/coverage-final.json _merge/integration.json
          npx nyc merge _merge .nyc_output/out.json
          npx nyc report --reporter=lcov --reporter=json-summary --reporter=text-summary --report-dir=coverage

      - name: Merge test results
        run: |
          mkdir -p reports
          npx jrm reports/merged.xml "_artifacts/junit-unit/junit-unit.xml" "_artifacts/junit-integration/junit-integration.xml"

      - name: PR comment — coverage & tests
        uses: MishaKav/jest-coverage-comment@main
        with:
          title: Coverage & Test Results
          coverage-summary-path: coverage/coverage-summary.json
          junitxml-path: reports/merged.xml

      - name: Publish test report
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: Tests
          path: reports/merged.xml
          reporter: jest-junit
          fail-on-error: false

      - name: Job summary
        if: always()
        run: |
          node -e "
            const t = require('./coverage/coverage-summary.json').total;
            const row = (k) => '| ' + k + ' | ' + t[k].pct + '% (' + t[k].covered + '/' + t[k].total + ') |';
            const out = [
              '## Coverage (whole codebase)', '',
              '| Metric | Coverage |', '|---|---|',
              row('lines'), row('statements'), row('functions'), row('branches'), ''
            ].join('\n');
            require('fs').appendFileSync(process.env.GITHUB_STEP_SUMMARY, out);
          "

  reviewdog:
    name: ESLint suggestions
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      checks: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci

      # Inline suggestions on changed lines only, so pre-existing lint noise
      # doesn't flood the PR. Never blocks the build (fail_level: none).
      - uses: reviewdog/action-eslint@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          reporter: github-pr-review
          eslint_flags: ". --ext .js,.jsx"
          filter_mode: diff_context
          fail_level: none
          level: warning
```

- [ ] **Step 2: Validate the YAML parses**

Run: `node -e "require('js-yaml')" 2>/dev/null && npx js-yaml .github/workflows/ci.yml > /dev/null && echo "valid" || echo "install js-yaml or eyeball it"`
Expected: `valid` (or eyeball indentation if js-yaml isn't available — no need to add it as a dep).

- [ ] **Step 3: Sanity-check the Vitest CLI flags locally**

Run: `npm run test:unit -- --coverage --coverage.reporter=json --reporter=junit --outputFile=reports/junit-unit.xml`
Expected: PASS; `coverage/coverage-final.json` and `reports/junit-unit.xml` both exist afterward. This confirms the exact flags the CI job uses. Then delete the local `reports/` and `coverage/` (gitignored anyway).

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add unit/integration/e2e + coverage-merge pipeline"
```

### Task 7: CodeQL, SonarCloud, Labeler, AI Summary

**Files:**
- Create: `.github/workflows/codeql.yml`
- Create: `.github/workflows/sonarcloud.yml`
- Create: `.github/workflows/labeler.yml`
- Create: `.github/labeler.yml`
- Create: `.github/workflows/ai-summary.yml`
- Create: `sonar-project.properties`

- [ ] **Step 1: Create `.github/workflows/codeql.yml`**

```yaml
name: CodeQL

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Weekly full scan (Mondays 03:00 UTC) to catch newly-published query rules.
    - cron: '0 3 * * 1'

concurrency:
  group: codeql-${{ github.ref }}
  cancel-in-progress: true

jobs:
  analyze:
    name: Analyze (JavaScript)
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    strategy:
      fail-fast: false
      matrix:
        language: ['javascript-typescript']
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: security-and-quality
          config: |
            paths-ignore:
              - node_modules
              - dist
              - coverage
              - tests
              - test-results
              - playwright-report
              - '**/*.test.js'
              - '**/*.test.jsx'

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: '/language:${{ matrix.language }}'
```

- [ ] **Step 2: Create `sonar-project.properties`**

```properties
sonar.projectKey=Raj-SW_petstore-frontend
sonar.organization=raj-sw
sonar.sources=src
sonar.tests=tests,src
sonar.test.inclusions=**/*.test.js,**/*.test.jsx
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/*.test.js,**/*.test.jsx,tests/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

- [ ] **Step 3: Create `.github/workflows/sonarcloud.yml`**

```yaml
name: SonarCloud

on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]

jobs:
  sonarcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      # A single coverage run over unit+integration auto-merges into
      # coverage/lcov.info (the path sonar-project.properties points at).
      - name: Generate coverage
        run: npm run test:coverage

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_CUBE_TOKEN }}
```

- [ ] **Step 4: Create `.github/labeler.yml` (path→label config)**

```yaml
# Auto-label PRs by the files they touch (actions/labeler@v5 syntax).
tests:
  - changed-files:
      - any-glob-to-any-file: ['tests/**', 'src/**/*.test.js', 'src/**/*.test.jsx']

ci:
  - changed-files:
      - any-glob-to-any-file: ['.github/**']

documentation:
  - changed-files:
      - any-glob-to-any-file: ['**/*.md', 'docs/**']

dependencies:
  - changed-files:
      - any-glob-to-any-file: ['package.json', 'package-lock.json']

frontend:
  - changed-files:
      - any-glob-to-any-file: ['src/**']
```

- [ ] **Step 5: Create `.github/workflows/labeler.yml`**

```yaml
name: Labeler

on: [pull_request_target]

jobs:
  label:
    name: Auto-label PR
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          sync-labels: true
```

- [ ] **Step 6: Create `.github/workflows/ai-summary.yml`**

```yaml
name: AI PR Summary

on:
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: ai-summary-${{ github.ref }}
  cancel-in-progress: true

jobs:
  summarize:
    name: Summarize PR
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      models: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Collect diff
        run: |
          BASE="origin/${{ github.base_ref }}"
          {
            echo "Summarize the following pull request for reviewers."
            echo
            echo "## Changed files"
            git diff --stat "$BASE"...HEAD
            echo
            echo "## Patch (truncated)"
            git diff "$BASE"...HEAD -- '*.js' '*.jsx' '*.md' '*.yml' '*.json'
          } > pr.txt
          head -c 28000 pr.txt > prompt.txt

      - name: Generate summary
        id: ai
        uses: actions/ai-inference@v1
        with:
          model: gpt-4o-mini
          system-prompt: >-
            You are a senior engineer writing a PR summary for reviewers.
            Respond in concise GitHub-flavoured markdown with: a one-line TL;DR,
            then 'Key changes' as bullet points grouped by area, then a short
            'Risks / things to check' list. Be specific; do not invent changes
            not present in the diff.
          prompt-file: prompt.txt

      - name: Post summary comment
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          header: ai-pr-summary
          message: |
            ## 🤖 AI PR Summary
            ${{ steps.ai.outputs.response }}

            <sub>Generated by GitHub Models · updates on each push</sub>
```

- [ ] **Step 7: Eyeball-validate all new YAML**

Run: `for f in .github/workflows/*.yml; do echo "== $f =="; npx js-yaml "$f" > /dev/null && echo ok || echo "PARSE ERROR"; done`
Expected: `ok` for each (or visually confirm indentation if js-yaml unavailable).

- [ ] **Step 8: Commit**

```bash
git add .github/ sonar-project.properties
git commit -m "ci: add codeql, sonarcloud, labeler, and ai-summary workflows"
```

---

## Phase 5 — Docs & verification

### Task 8: Update STATUS.md and run the full local gate

**Files:**
- Modify: `.claude/memory/STATUS.md`

- [ ] **Step 1: Update the "Test setup" section of `.claude/memory/STATUS.md`**

Replace the existing `## Test setup` section with:
```markdown
## Test setup

- **Pyramid (Vitest projects + Playwright):**
  - `unit` — co-located `src/**/*.test.{js,jsx}`, jsdom, deps mocked. `npm run test:unit`
  - `integration` — `tests/integration/**`, React Router + MSW. `npm run test:integration`
  - `e2e` — `tests/e2e/**/*.spec.js`, Playwright vs. the production build. `npm run test:e2e`
- **Config:** `vitest.config.js` (unit+integration projects, shared coverage), `playwright.config.js`.
- **Helpers:** `tests/helpers/` — `render.jsx` (renderWithProviders), `server.js` + `handlers.js` (MSW), setup files.
- **Mock pattern (unit):** `vi.mock(...)` is hoisted — define fixtures **inside** the factory.
- **CI:** `.github/workflows/` — `ci.yml` (unit→integration→e2e→report→reviewdog), `codeql.yml`, `sonarcloud.yml`, `labeler.yml`, `ai-summary.yml`.

Run before every commit: `npm run test:all && npm run build`
```

- [ ] **Step 2: Run the full local gate**

Run: `npm run test:all && npm run build`
Expected: unit + integration projects pass, production build succeeds.

- [ ] **Step 3: Run the e2e smoke once more**

Run: `npm run test:e2e`
Expected: 1 passed.

- [ ] **Step 4: Commit**

```bash
git add .claude/memory/STATUS.md
git commit -m "docs(status): document Vitest pyramid + CI pipeline"
```

---

## Post-merge configuration (manual, outside this plan)

These require repo/account access and cannot be done from the working tree:

1. **SonarCloud:** create project `Raj-SW_petstore-frontend` under org `raj-sw`; add repo secret `SONAR_CUBE_TOKEN` (same name the backend uses).
2. **GitHub Models (AI summary):** no secret needed — `models: read` permission is built in; confirm the org has GitHub Models enabled.
3. **Labels:** ensure the labels `tests`, `ci`, `documentation`, `dependencies`, `frontend` exist (labeler with `sync-labels: true` needs them present).
4. **Branch protection:** optionally require the `Unit tests`, `Integration tests`, and `E2E tests` checks on `main`.

---

## Self-Review

- **Spec coverage:** CI pipelines mirrored (5 workflows ✅), unit structured (projects + co-location ✅), integration structured (MSW harness + README ✅), e2e structured (Playwright + smoke ✅), cleanup (src/test removed, config split ✅). All four asks covered.
- **Placeholder scan:** every code/config step contains full file contents; no TBD/TODO. The one conditional note (CurrencyProvider export name) is a verification guard, not a placeholder — the import is written concretely against the known `src/context/CurrencyContext.jsx`.
- **Type/name consistency:** `renderWithProviders` defined in Task 3, used in Task 4 ✅. Project names `unit`/`integration` consistent across `vitest.config.js`, scripts, and CI ✅. Coverage artifact names (`cov-unit`, `cov-integration`) and junit names match between producing jobs and the `report` job ✅. Sonar key matches `sonar-project.properties` ✅.
