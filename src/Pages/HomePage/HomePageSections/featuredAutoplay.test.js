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
