// Pure helpers for the admin option-matrix editor.
// A "combination" is one purchasable variant row: { optionValues, key, price, quantity, images }.

export const comboKey = (optionValues, options) =>
  options.map((o) => optionValues[o.name]).join(" ");

export function generateCombinations(options) {
  const axes = (options || []).filter((o) => o.name && o.values?.length);
  if (axes.length === 0 || axes.length !== (options || []).length) return [];
  let combos = [{}];
  for (const axis of axes) {
    combos = combos.flatMap((c) => axis.values.map((v) => ({ ...c, [axis.name]: v })));
  }
  return combos.map((optionValues) => ({ optionValues, key: comboKey(optionValues, axes) }));
}

export function mergeCombinations(options, existingVariants, removedKeys) {
  const byKey = new Map(
    (existingVariants || [])
      .filter((v) => v.optionValues)
      .map((v) => [v.key ?? comboKey(v.optionValues, options), v]),
  );
  return generateCombinations(options)
    .filter(({ key }) => !removedKeys.has(key))
    .map(({ optionValues, key }) => {
      const prev = byKey.get(key);
      return prev
        ? { ...prev, optionValues, key }
        : { optionValues, key, price: "", quantity: "", images: [] };
    });
}
