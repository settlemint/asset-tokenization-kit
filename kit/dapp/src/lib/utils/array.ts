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
  const element = elements[index];
  if (!element) {
    throw new Error(
      `Element at index ${index} not found in array (length: ${elements.length})`
    );
  }
  return element;
}
