import Autoplay from "embla-carousel-autoplay";

export function prefersReducedMotion() {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.window.matchMedia === "function" &&
    globalThis.window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function buildCarouselPlugins() {
  if (prefersReducedMotion()) return [];
  return [
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
  ];
}
