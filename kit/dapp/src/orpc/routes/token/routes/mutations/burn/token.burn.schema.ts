import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { apiBigInt } from "@/lib/zod/validators/bigint";
import {
  MutationInputSchemaWithContract,
  MutationOutputSchema,
} from "@/orpc/routes/common/schemas/mutation.schema";
import { z } from "zod";

export const TokenBurnInputSchema = MutationInputSchemaWithContract.extend({
  addresses: z
    .union([
      // Single address - transform to array
      ethereumAddress.transform((addr) => [addr]),
      // Array of addresses
      z.array(ethereumAddress).min(1, "At least one address required").max(100),
    ])
    .describe("Address(es) to burn tokens from"),
  amounts: z
    .union([
      // Single amount - transform to array
      apiBigInt.transform((amt) => [amt]),
      // Array of amounts
      z.array(apiBigInt).min(1, "At least one amount required").max(100),
    ])
    .describe("Amount(s) of tokens to burn"),
}).refine(
  (data) => {
    // Ensure arrays have the same length after transformation
    return data.addresses.length === data.amounts.length;
  },
  {
    message: "Number of addresses must match number of amounts",
    path: ["amounts"],
  }
);

/**
 * Output schema for token burn operation
 */
export const TokenBurnOutputSchema = MutationOutputSchema;

// Type exports using Zod's type inference
export type TokenBurnInput = z.infer<typeof TokenBurnInputSchema>;
export type TokenBurnOutput = z.infer<typeof TokenBurnOutputSchema>;
