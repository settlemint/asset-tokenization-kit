/**
 * Options for shortening a hexadecimal string
 */
interface ShortHexOptions {
  prefixLength?: number;
  suffixLength?: number;
}

/**
 * Shortens a hexadecimal string by keeping a prefix and suffix, replacing the middle with an ellipsis
 * @param hex - The hexadecimal string to shorten
 * @param options - Configuration options for shortening
 * @returns Shortened hex string or null if input is invalid
 * @example
 * shortHex('0x123456789abcdef', { prefixLength: 6 }) // '0x1234…cdef'
 */
export function shortHex(hex: string | null | undefined, options: ShortHexOptions = {}): string | null {
  if (!hex) {
    return null;
  }

  const { prefixLength = 6, suffixLength = 4 } = options;
  const minLength = prefixLength + suffixLength + 1;

  if (hex.length < minLength) {
    return hex;
  }

  return `${hex.slice(0, prefixLength)}…${hex.slice(-suffixLength)}`;
}
