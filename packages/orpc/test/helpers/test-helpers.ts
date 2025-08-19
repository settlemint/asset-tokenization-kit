/**
 * Test constants and helpers for ORPC tests
 */

export const TEST_CONSTANTS = {
  /**
   * Zero address constant
   */
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000" as const,

  /**
   * Maximum days for time-based queries
   */
  MAX_DAYS: 365,
} as const;
