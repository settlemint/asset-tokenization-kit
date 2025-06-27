/**
 * Formats a bigint base unit amount to a human-readable string representation.
 * @param amount The amount in base units (as a bigint).
 * @param decimals The number of decimal places for the token.
 * @returns A string representing the formatted amount.
 *
 * @example
 * formatBaseUnits(1234567n, 4) // "123.4567"
 * formatBaseUnits(1000000000000000000n, 18) // "1"
 * formatBaseUnits(1500000n, 6) // "1.5"
 */
export function formatBaseUnits(amount: bigint, decimals: number): string {
  if (decimals < 0) {
    throw new Error('Decimals cannot be negative');
  }

  if (decimals === 0) {
    return amount.toString();
  }

  const divisor = BigInt(10 ** decimals);
  const quotient = amount / divisor;
  const remainder = amount % divisor;

  if (remainder === 0n) {
    return quotient.toString();
  }

  // Pad remainder with leading zeros if necessary
  const remainderStr = remainder.toString().padStart(decimals, '0');

  // Remove trailing zeros from decimal part
  const trimmedRemainder = remainderStr.replace(/0+$/, '');

  return `${quotient}.${trimmedRemainder}`;
}
