/**
 * Type-safe array element access that throws an error for invalid indices.
 *
 * Unlike native array access, this throws an explicit error instead of returning
 * undefined, following the "fail fast" principle to catch bugs early.
 *
 * @param elements - The array to access
 * @param index - The zero-based index of the element to retrieve
 * @returns The element at the specified index
 * @throws {Error} When the element at the given index doesn't exist
 */
export function getElementAtIndex<T>(elements: T[], index: number): T {
  if (index < 0 || index >= elements.length) {
    throw new Error(
      `Invalid index ${String(index)} for array of length ${String(elements.length)}`
    );
  }
  const element = elements[index];
  // This never happens, but we check for type safety
  if (element === undefined) {
    throw new Error(`Element at index ${String(index)} is undefined`);
  }
  return element;
}

/**
 * Compares two arrays to determine if they contain the same numeric values.
 *
 * Performs order-insensitive comparison - [1,2,3] and [3,2,1] are considered equal.
 * This is useful for comparing selections like country codes where order is irrelevant.
 *
 * @param first - First array of strings or numbers
 * @param second - Second array of strings or numbers
 * @returns true if both arrays contain the same numeric values (regardless of order)
 */
export function haveSameNumbers(
  first: (string | number)[],
  second: (string | number)[]
) {
  if (first.length !== second.length) return false;

  const firstNumbers = first.map(Number);
  const secondNumbers = new Set(second.map(Number));

  // Order-insensitive comparison: check if every element in first exists in second
  return firstNumbers.every((num) => secondNumbers.has(num));
}
