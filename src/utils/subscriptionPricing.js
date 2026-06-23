export function computeSavings(basePrice, discountPercent) {
  const base = Math.round(Number(basePrice) || 0);
  const pct = Number(discountPercent) || 0;
  const discounted = Math.round(base * (1 - pct / 100));
  return { base, discounted, save: base - discounted };
}

export function isIntervalValid(unit, count) {
  const n = Number(count) || 0;
  const days = unit === "week" ? n * 7 : n;
  return days >= 7;
}
