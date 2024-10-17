export function shortHex(hex?: string, prefixLength = 6, suffixLength = 4) {
  if (!hex) {
    return null;
  }
  if (hex.length < prefixLength + suffixLength + 1) {
    return hex;
  }
  return `${hex.slice(0, prefixLength)}…${hex.slice(-suffixLength)}`;
}
