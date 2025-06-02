/**
 * Formats a raw token amount to a human-readable string with proper decimal placement
 * @param amount Raw token amount as bigint (e.g., from smart contract)
 * @param decimals Number of decimal places for the token
 * @returns Formatted string with decimal point in correct position
 *
 * @example
 * formatDecimals(1234567n, 4) // "123.4567"
 * formatDecimals(1000000000000000000n, 18) // "1"
 * formatDecimals(1500000n, 6) // "1.5"
 */
export function formatDecimals(amount: bigint, decimals: number): string {
  if (decimals < 0) {
    throw new Error("Decimals cannot be negative");
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
  const remainderStr = remainder.toString().padStart(decimals, "0");

  // Remove trailing zeros from decimal part
  const trimmedRemainder = remainderStr.replace(/0+$/, "");

  return `${quotient}.${trimmedRemainder}`;
}
