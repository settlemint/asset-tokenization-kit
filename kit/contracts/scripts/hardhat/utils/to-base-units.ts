/**
 * Parses a decimal string into a bigint with the specified number of decimals.
 * This is a utility function for `toBaseUnits`.
 *
 * @param amount - The amount as a decimal string (e.g., "1.5", "0.123")
 * @param decimals - Number of decimal places for the token
 * @returns The amount as a bigint scaled by `decimals`.
 * @throws Error if the decimal string has more precision than allowed.
 */
export function parseDecimalString(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');

  if (fraction.length > decimals) {
    throw new Error(
      `Decimal string has more precision (${fraction.length}) than allowed decimals (${decimals})`
    );
  }

  // Pad fraction with zeros if needed
  const paddedFraction = fraction.padEnd(decimals, '0');
  const combinedString = whole + paddedFraction;

  return BigInt(combinedString);
}

/**
 * Converts a number representation of a token amount to its bigint representation in base units.
 * For higher precision, it's recommended to use the string overload to avoid floating-point inaccuracies.
 *
 * @param amount - The amount as a number (e.g., 1.5).
 * @param decimals - The number of decimal places for the token.
 * @returns The amount in base units as a bigint.
 */
export function toBaseUnits(
  amount: string | number | bigint,
  decimals: number
): bigint {
  if (typeof amount === 'bigint') {
    return amount * 10n ** BigInt(decimals);
  }

  if (typeof amount === 'string') {
    // Use the dedicated string parsing function
    return parseDecimalString(amount, decimals);
  }

  if (typeof amount === 'number') {
    // Convert number to string first to handle decimals properly
    // Note: This may have precision issues for very large or very precise numbers
    return parseDecimalString(amount.toString(), decimals);
  }

  throw new Error(`Unsupported amount type: ${typeof amount}`);
}
