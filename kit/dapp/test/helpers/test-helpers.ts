/**
 * @vitest-environment node
 */
import { isDnum, toNumber } from "dnum";
import { expect } from "vitest";

/**
 * Test constants for integration tests
 */
export const TEST_CONSTANTS = {
  INVALID_ADDRESS: "0xinvalid",
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
  MAX_DAYS: 365,
  MIN_DAYS: 1,
  DEFAULT_TIMEOUT: 30000,
} as const;

/**
 * Assert that a value is a valid Dnum and optionally check its numeric value
 */
export function expectDnum(
  value: unknown,
  options?: {
    min?: number;
    max?: number;
    exactly?: number;
  }
): void {
  expect(isDnum(value)).toBe(true);

  if (options && isDnum(value)) {
    const numericValue = toNumber(value);

    if (options.min !== undefined) {
      expect(numericValue).toBeGreaterThanOrEqual(options.min);
    }
    if (options.max !== undefined) {
      expect(numericValue).toBeLessThanOrEqual(options.max);
    }
    if (options.exactly !== undefined) {
      expect(numericValue).toBe(options.exactly);
    }
  }
}

/**
 * Assert that a Dnum represents a percentage (0-100)
 */
export function expectPercentage(value: unknown): void {
  expectDnum(value, { min: 0, max: 100 });
}

/**
 * Create a test function for invalid address handling
 */
export function createInvalidAddressTest(apiCall: Function) {
  return async () => {
    await expect(
      (apiCall as any)({ tokenAddress: TEST_CONSTANTS.INVALID_ADDRESS })
    ).rejects.toThrow();
  };
}

/**
 * Create test functions for days parameter validation
 */
export function createDaysParameterTests(
  apiCall: Function,
  tokenAddress: string
) {
  return {
    invalidDays: async () => {
      // Too small
      await expect(
        (apiCall as any)({ tokenAddress, days: 0 })
      ).rejects.toThrow();

      // Too large
      await expect(
        (apiCall as any)({ tokenAddress, days: 400 })
      ).rejects.toThrow();

      // Negative
      await expect(
        (apiCall as any)({ tokenAddress, days: -1 })
      ).rejects.toThrow();
    },
    validDays: async () => {
      await expect(
        (apiCall as any)({ tokenAddress, days: 30 })
      ).resolves.toBeDefined();
    },
  };
}

/**
 * Helper to wait for graph indexing
 */
export async function sleep(delayMs = 2000): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
