import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { bigDecimal } from "@atk/zod/validators/bigdecimal";
import { apiBigInt } from "@atk/zod/validators/bigint";
import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import { z } from "zod";

export const TokenBurnInputSchema = MutationInputSchemaWithContract.extend({
  addresses: z
    .union([
      // Single address - transform to array
      ethereumAddress.transform((addr) => [addr]),
      // Array of addresses
      z
        .array(ethereumAddress)
        .min(1, "tokens:validation.burn.addressRequired")
        .max(100),
    ])
    .describe("Address(es) to burn tokens from"),
  amounts: z
    .union([
      // Single amount - transform to array
      apiBigInt.transform((amt) => [amt]),
      // Array of amounts
      z
        .array(apiBigInt)
        .min(1, "tokens:validation.burn.amountRequired")
        .max(100),
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
 * Returns transaction hash and burn details
 */
export const TokenBurnOutputSchema = BaseMutationOutputSchema.extend({
  data: z
    .object({
      totalBurned: bigDecimal().describe("Total amount of tokens burned"),
      addresses: z
        .array(ethereumAddress)
        .describe("Addresses tokens were burned from"),
      amounts: z
        .array(bigDecimal())
        .describe("Amounts burned from each address"),
      tokenName: z.string().optional().describe("Name of the token"),
      tokenSymbol: z.string().optional().describe("Symbol of the token"),
      newTotalSupply: bigDecimal()
        .optional()
        .describe("New total supply after burn"),
    })
    .optional()
    .describe("Burn operation details"),
});

// Type exports using Zod's type inference
export type TokenBurnInput = z.infer<typeof TokenBurnInputSchema>;
export type TokenBurnOutput = z.infer<typeof TokenBurnOutputSchema>;
