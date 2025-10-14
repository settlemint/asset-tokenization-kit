import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

export const TokenMintInputSchema = MutationInputSchemaWithContract.extend({
  recipients: z
    .union([
      // Single recipient - transform to array
      ethereumAddress.transform((addr) => [addr]),
      // Array of recipients
      z
        .array(ethereumAddress)
        .min(1, "tokens:validation.mint.recipientRequired")
        .max(100),
    ])
    .describe("Recipient address(es) for minted tokens"),
  amounts: z
    .union([
      // Single amount - transform to array
      apiBigInt.transform((amt) => [amt]),
      // Array of amounts
      z
        .array(apiBigInt)
        .min(1, "tokens:validation.mint.amountRequired")
        .max(100),
    ])
    .describe("Amount(s) of tokens to mint"),
}).refine(
  (data) => {
    // Ensure arrays have the same length after transformation
    return data.recipients.length === data.amounts.length;
  },
  {
    message: "Number of recipients must match number of amounts",
    path: ["amounts"],
  }
);

/**
 * Output schema for token mint operation
 * Returns transaction hash and mint details
 */
export const TokenMintOutputSchema = BaseMutationOutputSchema.extend({
  data: z
    .object({
      totalMinted: bigDecimal().describe("Total amount of tokens minted"),
      recipients: z
        .array(ethereumAddress)
        .describe("Addresses tokens were minted to"),
      amounts: z.array(bigDecimal()).describe("Amounts minted to each address"),
      tokenName: z.string().optional().describe("Name of the token"),
      tokenSymbol: z.string().optional().describe("Symbol of the token"),
      newTotalSupply: bigDecimal()
        .optional()
        .describe("New total supply after mint"),
    })
    .optional()
    .describe("Mint operation details"),
});

// Type exports using Zod's type inference
export type TokenMintInput = z.infer<typeof TokenMintInputSchema>;
export type TokenMintOutput = z.infer<typeof TokenMintOutputSchema>;
