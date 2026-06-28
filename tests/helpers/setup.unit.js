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

// Negative-path tests render a hook outside its provider and assert the throw.
// React's dev error handling re-dispatches the *caught* error as a window
// 'error' event, which jsdom then echoes to stderr — making a passing test look
// like a failure in CI logs. Swallow ONLY those expected provider-guard
// messages (preventDefault tells jsdom it was handled); everything else is
// reported normally.
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (/must be used (within|inside)/.test(event?.error?.message || "")) {
      event.preventDefault();
    }
  });
}
