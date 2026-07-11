/** Shared, tasteful scroll-reveal presets (200–300ms fade-up). */
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const staggerParent = {
  initial: {},
  whileInView: {},
  viewport: { once: true, amount: 0.2 },
  variants: { whileInView: { transition: { staggerChildren: 0.07 } } },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
