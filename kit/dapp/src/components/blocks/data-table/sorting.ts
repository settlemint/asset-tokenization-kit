import type { Row } from '@tanstack/react-table';

/**
 * Creates a sorting function for string-based numeric values.
 * Useful for sorting blockchain/web3 data where numbers are often represented as strings.
 *
 * @param key - The key of the numeric string value to sort by
 * @returns A sorting function compatible with TanStack Table
 */
export function numericSortingFn<T>(key: keyof T & string) {
  return (rowA: Row<T>, rowB: Row<T>) => {
    const a = Number.parseFloat(String(rowA.original[key]));
    const b = Number.parseFloat(String(rowB.original[key]));
    return a < b ? -1 : a > b ? 1 : 0;
  };
}
