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
