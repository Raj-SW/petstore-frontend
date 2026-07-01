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
    // Cap worker forks so coverage-instrumented runs (~100 files, heavy
    // framer-motion/jsdom mocks per file) don't exhaust CI runner memory.
    // (Vitest 4 flattened poolOptions.forks.* into top-level options.)
    pool: "forks",
    maxWorkers: 2,
    // jsdom + coverage instrumentation accumulate native heap across test
    // files within the same forked worker (observed: heap climbs to V8's
    // ~4GB default old-space ceiling -> "JavaScript heap out of memory" /
    // "Worker exited unexpectedly", even with maxWorkers capped). Passing
    // --expose-gc lets Vitest force a GC pass between test files in each
    // worker, which is the documented mitigation for this class of leak.
    execArgv: ["--expose-gc"],
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
