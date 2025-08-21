import type { OrpcClient } from "./orpc-client";

type FixedYieldScheduleCreateInput = Parameters<
  OrpcClient["fixedYieldSchedule"]["create"]
>[0];

/**
 * Test utility function for creating fixed yield schedules.
 *
 * This function provides a convenient way to create fixed yield schedule
 * contracts in tests, similar to the createToken utility. It handles the
 * deployment of yield schedule contracts that can be used in various test
 * scenarios.
 *
 * @param orpcClient - The ORPC client instance to use for API calls
 * @param input - The fixed yield schedule creation parameters
 * @returns Promise<{address: string}> - The deployed yield schedule contract address
 * @throws Error - If the yield schedule deployment fails
 *
 * @example
 * ```typescript
 * const yieldSchedule = await createFixedYieldSchedule(adminClient, {
 *   yieldRate: "500", // 5% in basis points
 *   paymentInterval: "86400", // Daily payments
 *   startTime: startTimestamp,
 *   endTime: endTimestamp,
 *   token: tokenAddress,
 *   countryCode: 840, // USA
 *   walletVerification: {
 *     secretVerificationCode: DEFAULT_PINCODE,
 *     verificationType: "PINCODE"
 *   }
 * });
 *
 * console.log(yieldSchedule.address); // "0xabc123..."
 * ```
 */
export async function createFixedYieldSchedule(
  orpcClient: OrpcClient,
  input: FixedYieldScheduleCreateInput
) {
  return await orpcClient.fixedYieldSchedule.create(input);
}
