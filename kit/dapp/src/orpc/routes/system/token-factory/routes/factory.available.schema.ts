/**
 * Factory Available Address Schema
 *
 * This schema provides an interface for checking whether a predicted token address
 * is available (not already in use) before deployment. It combines address prediction
 * with availability validation in a single endpoint.
 *
 * @example
 * ```typescript
 * // Check if deposit token address is available
 * const result = await orpc.system.factory.available.query({
 *   type: "deposit",
 *   name: "USD Deposit Token",
 *   symbol: "USDD",
 *   decimals: 2,
 *   initialModulePairs: []
 * });
 *
 * if (result.isAvailable) {
 *   // Proceed with deployment
 *   console.log(`Address ${result.predictedAddress} is available`);
 * } else {
 *   // Show error to user
 *   console.error(`Address ${result.predictedAddress} is already in use`);
 * }
 * ```
 */

import { PredictAddressInputSchema } from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Input schema for availability check - reuses prediction input schema
 * Since availability checking requires the same parameters as prediction,
 * we reuse the existing schema for consistency and to avoid duplication.
 */
export const AvailableInputSchema = z.union([
  z.object({
    parameters: PredictAddressInputSchema,
  }),
  z.object({
    address: ethereumAddress.describe("The address to check"),
  }),
]);

/**
 * Output schema for availability check
 * Returns both the predicted address and whether it's available for use.
 */
export const AvailableOutputSchema = z.object({
  isAvailable: z
    .boolean()
    .describe("Whether the address is available (not already deployed)"),
});

// Type exports using Zod's type inference
export type AvailableInput = z.infer<typeof AvailableInputSchema>;
export type AvailableOutput = z.infer<typeof AvailableOutputSchema>;
