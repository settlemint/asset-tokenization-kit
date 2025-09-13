import { ORPCError } from "@orpc/server";

/**
 * Validates that all arrays have the same length for batch operations
 * @param arrays - Object mapping array names to their arrays
 * @param operation - The operation name for error messages
 * @throws ORPCError if arrays have mismatched lengths
 */
export function validateArrayLengths(
  arrays: Record<string, unknown[]>,
  operation: string
): void {
  const entries = Object.entries(arrays);
  if (entries.length < 2) return;

  const firstEntry = entries[0];
  if (!firstEntry) return;

  const [firstName, firstArray] = firstEntry;
  const expectedLength = firstArray.length;

  for (const [name, array] of entries.slice(1)) {
    if (array.length !== expectedLength) {
      throw new ORPCError("BAD_REQUEST", {
        message: `Array length mismatch in ${operation}`,
        data: {
          error: `${firstName} has ${String(expectedLength)} elements but ${name} has ${String(array.length)} elements`,
          expected: expectedLength,
          actual: array.length,
          operation,
        },
      });
    }
  }
}

/**
 * Validates that arrays are not empty
 * @param arrays - Object mapping array names to their arrays
 * @param operation - The operation name for error messages
 * @throws ORPCError if any array is empty
 */
export function validateNonEmptyArrays(
  arrays: Record<string, unknown[]>,
  operation: string
): void {
  for (const [name, array] of Object.entries(arrays)) {
    if (array.length === 0) {
      throw new ORPCError("BAD_REQUEST", {
        message: `Empty array in ${operation}`,
        data: {
          error: `${name} must contain at least one element`,
          operation,
        },
      });
    }
  }
}

/**
 * Validates batch operation arrays
 * @param arrays - Object mapping array names to their arrays
 * @param operation - The operation name for error messages
 * @param maxLength - Maximum allowed array length (default: 100)
 * @throws ORPCError if validation fails
 */
export function validateBatchArrays(
  arrays: Record<string, unknown[]>,
  operation: string,
  maxLength = 100
): void {
  // Check for empty arrays
  validateNonEmptyArrays(arrays, operation);

  // Check that all arrays have the same length
  validateArrayLengths(arrays, operation);

  // Check maximum length
  const firstArray = Object.values(arrays)[0];
  if (firstArray && firstArray.length > maxLength) {
    throw new ORPCError("BAD_REQUEST", {
      message: `Too many elements in ${operation}`,
      data: {
        error: `Maximum ${String(maxLength)} elements allowed, but ${String(firstArray.length)} provided`,
        operation,
      },
    });
  }
}
