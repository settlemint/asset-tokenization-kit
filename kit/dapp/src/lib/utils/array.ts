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
      `Invalid index ${index} for array of length ${elements.length}`
    );
  }
  const element = elements[index];
  // This never happens, but we check for type safety
  if (element === undefined) {
    throw new Error(`Element at index ${index} is undefined`);
  }
  return element;
}
