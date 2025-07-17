export function getElementAtIndex<T>(elements: T[], index: number): T {
  const element = elements[index];
  if (!element) {
    throw new Error(`Element at index ${index} not found`);
  }
  return element;
}
