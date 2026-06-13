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
