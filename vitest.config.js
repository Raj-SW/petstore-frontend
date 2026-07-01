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
    // Default (5000ms) is tight for userEvent.type()-heavy interaction tests
    // once vitest's fork pool runs many worker processes truly concurrently
    // (real CPU contention, not a bug) — observed one such test occasionally
    // timing out under full-suite parallel load despite passing in ~1.5s
    // when run in isolation. Some headroom avoids flaky failures without
    // masking genuine hangs.
    testTimeout: 10000,
    // Shared coverage config — applies across whichever projects run in a
    // single --coverage pass. json (coverage-final) is the mergeable raw data
    // for the CI nyc-merge; json-summary feeds the PR comment; lcov feeds Sonar.
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov", "json", "json-summary"],
      reportsDirectory: "./coverage",
      // Emit the coverage report even when tests fail, so CI's coverage-artifact
      // upload doesn't ALSO fail (which would mask the real test failure).
      reportOnFailure: true,
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
