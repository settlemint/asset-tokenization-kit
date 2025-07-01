export function createNumberRange(values: number[] | undefined) {
  let a = 0;
  let b = 0;

  if (!values || values.length === 0) return [a, b];
  if (values.length === 1) {
    a = values[0] ?? 0;
  } else {
    a = values[0] ?? 0;
    b = values[1] ?? 0;
  }

  const [min, max] = a < b ? [a, b] : [b, a];

  return [min, max];
}
