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
