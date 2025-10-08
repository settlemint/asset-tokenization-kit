/**
 * Schema for checking token address availability before deployment.
 * Validates whether a predicted address is available for use.
 */

import { PredictAddressInputSchema } from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Input schema for availability check.
 * Accepts either a direct address to check or parameters to predict and check address availability.
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
 * Output schema for availability check.
 * Returns whether the address is available for use.
 */
export const AvailableOutputSchema = z.object({
  isAvailable: z
    .boolean()
    .describe("Whether the address is available (not already deployed)"),
});

// Type exports
export type AvailableInput = z.infer<typeof AvailableInputSchema>;
export type AvailableOutput = z.infer<typeof AvailableOutputSchema>;
