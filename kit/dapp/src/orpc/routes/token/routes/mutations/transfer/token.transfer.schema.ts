import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { amount } from "@/lib/zod/validators/amount";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

/**
 * Schema for unified token transfer operation (supports standard, transferFrom, and forced transfer)
 */
export const TokenTransferSchema = z
  .object({
    contract: ethereumAddress.describe("Token contract address"),
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
        amount().transform((amt) => [amt]),
        // Array of amounts
        z.array(amount()).min(1).max(100),
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
    verification: UserVerificationSchema.describe("Verification credentials"),
    messages: z
      .object({
        preparingTransfer: z
          .string()
          .default("Preparing token transfer...")
          .describe("Message shown when preparing the transfer"),
        submittingTransfer: z
          .string()
          .default("Submitting transfer transaction...")
          .describe("Message shown when submitting the transaction"),
        waitingForMining: z
          .string()
          .default("Waiting for transaction to be mined...")
          .describe("Message shown while waiting for mining"),
        transferComplete: z
          .string()
          .default("Token transfer completed successfully")
          .describe("Message shown when transfer is complete"),
        transferFailed: z
          .string()
          .default("Failed to transfer tokens")
          .describe("Message shown when transfer fails"),
        defaultError: z
          .string()
          .default("An unexpected error occurred during transfer")
          .describe("Default error message"),
      })
      .optional()
      .describe("Custom messages for transfer operation"),
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
      message:
        "From address(es) required for transferFrom and forced transfers",
      path: ["from"],
    }
  );

// Note: Old separate schemas removed since we consolidated into TokenTransferSchema

/**
 * Schema for transfer messages (shared structure)
 */
export const TokenTransferMessagesSchema = z.object({
  preparingTransfer: z.string().default("Preparing transfer..."),
  submittingTransfer: z.string().default("Submitting transfer transaction..."),
  waitingForMining: z
    .string()
    .default("Waiting for transaction to be mined..."),
  transferComplete: z.string().default("Transfer completed successfully"),
  transferFailed: z.string().default("Failed to transfer tokens"),
  waitingForIndexing: z
    .string()
    .default("Transaction confirmed. Waiting for indexing..."),
  transactionIndexed: z.string().default("Transaction successfully indexed."),
  indexingTimeout: z
    .string()
    .default(
      "Indexing is taking longer than expected. Data will be available soon."
    ),
  streamTimeout: z
    .string()
    .default("Transaction tracking timed out. Please check the status later."),
  transactionDropped: z
    .string()
    .default("Transaction was dropped from the network. Please try again."),
  defaultError: z.string().default("An unexpected error occurred"),
});

export type TokenTransferInput = z.infer<typeof TokenTransferSchema>;
export type TokenTransferMessages = z.infer<typeof TokenTransferMessagesSchema>;
