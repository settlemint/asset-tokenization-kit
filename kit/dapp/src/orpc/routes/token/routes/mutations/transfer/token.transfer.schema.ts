import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { bigDecimal } from "@atk/zod/validators/bigdecimal";
import { apiBigInt } from "@atk/zod/validators/bigint";
import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import { z } from "zod";

/**
 * Schema for unified token transfer operation (supports standard, transferFrom, and forced transfer)
 */
export const TokenTransferSchema = MutationInputSchemaWithContract.extend({
  recipients: z
    .union([
      // Single recipient - transform to array
      ethereumAddress.transform((addr) => [addr]),
      // Array of recipients
      z.array(ethereumAddress).min(1).max(100),
    ])
    .describe("Recipient address(es) for tokens"),
  amounts: z
    .union([
      // Single amount - transform to array
      apiBigInt.transform((amt) => [amt]),
      // Array of amounts
      z.array(apiBigInt).min(1).max(100),
    ])
    .describe("Amount(s) of tokens to transfer"),
  from: z
    .union([
      // Single from address - transform to array
      ethereumAddress.transform((addr) => [addr]),
      // Array of from addresses
      z.array(ethereumAddress).min(1).max(100),
    ])
    .optional()
    .describe(
      "Address(es) to transfer from (for transferFrom and forced transfer)"
    ),
  transferType: z
    .enum(["standard", "transferFrom", "forced"])
    .optional()
    .default("standard")
    .describe(
      "Type of transfer: standard (sender to recipient), transferFrom (using allowance), or forced (custodian)"
    ),
})
  .refine(
    (data) => {
      // Ensure arrays have the same length after transformation
      const recipientsLength = data.recipients.length;
      const amountsLength = data.amounts.length;
      const fromLength = data.from?.length ?? 0;

      // Standard transfer: recipients and amounts must match
      if (data.transferType === "standard") {
        return recipientsLength === amountsLength;
      }

      // transferFrom and forced: from, recipients, and amounts must all match
      // (all remaining cases since transferType is an enum with only 3 values)
      return fromLength === recipientsLength && fromLength === amountsLength;
    },
    {
      message:
        "Number of recipients, amounts, and from addresses must match based on transfer type",
      path: ["amounts"],
    }
  )
  .refine(
    (data) => {
      // For transferFrom and forced transfers, 'from' is required
      if (
        (data.transferType === "transferFrom" ||
          data.transferType === "forced") &&
        !data.from
      ) {
        return false;
      }
      return true;
    },
    {
      message: "tokens:validation.transfer.fromRequired",
      path: ["from"],
    }
  );

// Note: Old separate schemas removed since we consolidated into TokenTransferSchema

/**
 * Output schema for token transfer operation
 * Returns the ethereum hash and the updated token data
 */
export const TokenTransferOutputSchema = BaseMutationOutputSchema.extend({
  data: z
    .object({
      totalTransferred: bigDecimal().describe(
        "Total amount of tokens transferred"
      ),
      transferType: z
        .enum(["standard", "transferFrom", "forced"])
        .describe("Type of transfer performed"),
      recipients: z
        .array(ethereumAddress)
        .describe("Addresses tokens were transferred to"),
      amounts: z
        .array(bigDecimal())
        .describe("Amounts transferred to each address"),
      from: z
        .array(ethereumAddress)
        .optional()
        .describe("Source addresses for transferFrom/forced transfers"),
      tokenName: z.string().optional().describe("Name of the token"),
      tokenSymbol: z.string().optional().describe("Symbol of the token"),
    })
    .optional()
    .describe("Transfer operation details"),
});

export type TokenTransferInput = z.infer<typeof TokenTransferSchema>;
export type TokenTransferOutput = z.infer<typeof TokenTransferOutputSchema>;
