import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Schema for token transfers initiated by the holder (standard) or via allowance (transferFrom).
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
      "Address(es) to transfer from when using allowance-based transfers"
    ),
  transferType: z
    .enum(["standard", "transferFrom"])
    .optional()
    .default("standard")
    .describe(
      "Type of transfer: standard (sender to recipient) or transferFrom (using allowance)"
    ),
}).superRefine((data, ctx) => {
  const recipientsLength = data.recipients.length;
  const amountsLength = data.amounts.length;

  if (data.transferType === "standard") {
    if (recipientsLength !== amountsLength) {
      ctx.addIssue({
        code: "custom",
        path: ["amounts"],
        message: "Recipients and amounts must have the same length",
      });
    }

    if (data.from && data.from.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["from"],
        message: "From addresses are not allowed for standard transfers",
      });
    }
    return;
  }

  if (!data.from || data.from.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["from"],
      message: "tokens:validation.transfer.fromRequired",
    });
    return;
  }

  if (
    data.from.length !== recipientsLength ||
    data.from.length !== amountsLength
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["amounts"],
      message:
        "Number of from addresses, recipients, and amounts must match for transferFrom",
    });
  }
});

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
        .enum(["standard", "transferFrom"])
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
        .describe("Source addresses for transferFrom operations"),
      tokenName: z.string().optional().describe("Name of the token"),
      tokenSymbol: z.string().optional().describe("Symbol of the token"),
    })
    .optional()
    .describe("Transfer operation details"),
});

export type TokenTransferInput = z.infer<typeof TokenTransferSchema>;
export type TokenTransferOutput = z.infer<typeof TokenTransferOutputSchema>;
