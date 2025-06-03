/**
 * Parses a decimal string into a bigint with the specified number of decimals
 * @param amount - The amount as a decimal string (e.g., "1.5", "0.123")
 * @param decimals - Number of decimal places for the token
 * @returns The amount as bigint with decimals applied
 * @throws Error if the decimal string has more precision than allowed
 */
export function parseDecimalString(amount: string, decimals: number): bigint {
  const [whole, fraction = ""] = amount.split(".");

  if (fraction.length > decimals) {
    throw new Error(
      `Decimal string has more precision (${fraction.length}) than allowed decimals (${decimals})`
    );
  }

  // Pad fraction with zeros if needed
  const paddedFraction = fraction.padEnd(decimals, "0");
  const combinedString = whole + paddedFraction;

  return BigInt(combinedString);
}

/**
 * Converts a decimal number amount to its bigint representation with the specified decimals
 * Note: For high precision amounts, prefer using string input to avoid floating point precision issues
 * @param amount - The amount as a number (e.g., 1.5)
 * @param decimals - Number of decimal places for the token
 * @returns The amount as bigint with decimals applied
 */
export function toDecimals(amount: number, decimals: number): bigint;

/**
 * Converts a bigint amount (already in base units) to its representation with the specified decimals
 * @param amount - The amount as bigint (e.g., 1500000000000000000n)
 * @param decimals - Number of decimal places for the token
 * @returns The amount as bigint with decimals applied
 */
export function toDecimals(amount: bigint, decimals: number): bigint;

export function toDecimals(
  amount: string | number | bigint,
  decimals: number
): bigint {
  if (typeof amount === "bigint") {
    // If already bigint, multiply by 10^decimals (existing behavior)
    return amount * 10n ** BigInt(decimals);
  }

  if (typeof amount === "string") {
    // Use the dedicated string parsing function
    return parseDecimalString(amount, decimals);
  }

  if (typeof amount === "number") {
    // Convert number to string first to handle decimals properly
    // Note: This may have precision issues for very large or very precise numbers
    return parseDecimalString(amount.toString(), decimals);
  }

  throw new Error(`Unsupported amount type: ${typeof amount}`);
}
