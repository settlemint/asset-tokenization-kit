import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { amount } from "@/lib/zod/validators/amount";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

/**
 * Schema for token transfer operation (supports both single and batch)
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
      return data.recipients.length === data.amounts.length;
    },
    {
      message: "Number of recipients must match number of amounts",
      path: ["amounts"],
    }
  );

/**
 * Schema for transferFrom operation (using allowance) - supports both single and batch
 */
export const TokenTransferFromSchema = z
  .object({
    contract: ethereumAddress.describe("Token contract address"),
    from: z
      .union([
        // Single from address - transform to array
        ethereumAddress.transform((addr) => [addr]),
        // Array of from addresses
        z.array(ethereumAddress).min(1).max(100),
      ])
      .describe("Address(es) to transfer from"),
    recipients: z
      .union([
        // Single recipient - transform to array
        ethereumAddress.transform((addr) => [addr]),
        // Array of recipients
        z.array(ethereumAddress).min(1).max(100),
      ])
      .describe("Recipient address(es)"),
    amounts: z
      .union([
        // Single amount - transform to array
        amount().transform((amt) => [amt]),
        // Array of amounts
        z.array(amount()).min(1).max(100),
      ])
      .describe("Amount(s) of tokens to transfer"),
    verification: UserVerificationSchema.describe("Verification credentials"),
    messages: z
      .object({
        preparingTransfer: z
          .string()
          .default("Preparing transferFrom operation...")
          .describe("Message shown when preparing the transfer"),
        submittingTransfer: z
          .string()
          .default("Submitting transferFrom transaction...")
          .describe("Message shown when submitting the transaction"),
        waitingForMining: z
          .string()
          .default("Waiting for transaction to be mined...")
          .describe("Message shown while waiting for mining"),
        transferComplete: z
          .string()
          .default("TransferFrom completed successfully")
          .describe("Message shown when transfer is complete"),
        transferFailed: z
          .string()
          .default("Failed to transfer tokens")
          .describe("Message shown when transfer fails"),
        defaultError: z
          .string()
          .default("An unexpected error occurred during transferFrom")
          .describe("Default error message"),
      })
      .optional()
      .describe("Custom messages for transferFrom operation"),
  })
  .refine(
    (data) => {
      // Ensure arrays have the same length after transformation
      return (
        data.from.length === data.recipients.length &&
        data.from.length === data.amounts.length
      );
    },
    {
      message:
        "Number of from addresses, recipients, and amounts must all match",
      path: ["amounts"],
    }
  );

/**
 * Schema for forced transfer operation (custodian only) - supports both single and batch
 */
export const TokenForcedTransferSchema = z
  .object({
    contract: ethereumAddress.describe("Token contract address"),
    from: z
      .union([
        // Single from address - transform to array
        ethereumAddress.transform((addr) => [addr]),
        // Array of from addresses
        z.array(ethereumAddress).min(1).max(100),
      ])
      .describe("Address(es) to transfer from"),
    recipients: z
      .union([
        // Single recipient - transform to array
        ethereumAddress.transform((addr) => [addr]),
        // Array of recipients
        z.array(ethereumAddress).min(1).max(100),
      ])
      .describe("Recipient address(es)"),
    amounts: z
      .union([
        // Single amount - transform to array
        amount().transform((amt) => [amt]),
        // Array of amounts
        z.array(amount()).min(1).max(100),
      ])
      .describe("Amount(s) of tokens to transfer"),
    verification: UserVerificationSchema.describe("Verification credentials"),
    messages: z
      .object({
        preparingTransfer: z
          .string()
          .default("Preparing forced transfer...")
          .describe("Message shown when preparing the transfer"),
        submittingTransfer: z
          .string()
          .default("Submitting forced transfer transaction...")
          .describe("Message shown when submitting the transaction"),
        waitingForMining: z
          .string()
          .default("Waiting for transaction to be mined...")
          .describe("Message shown while waiting for mining"),
        transferComplete: z
          .string()
          .default("Forced transfer completed successfully")
          .describe("Message shown when transfer is complete"),
        transferFailed: z
          .string()
          .default("Failed to force transfer tokens")
          .describe("Message shown when transfer fails"),
        defaultError: z
          .string()
          .default("An unexpected error occurred during forced transfer")
          .describe("Default error message"),
      })
      .optional()
      .describe("Custom messages for forced transfer operation"),
  })
  .refine(
    (data) => {
      // Ensure arrays have the same length after transformation
      return (
        data.from.length === data.recipients.length &&
        data.from.length === data.amounts.length
      );
    },
    {
      message:
        "Number of from addresses, recipients, and amounts must all match",
      path: ["amounts"],
    }
  );

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
export type TokenTransferFromInput = z.infer<typeof TokenTransferFromSchema>;
export type TokenForcedTransferInput = z.infer<
  typeof TokenForcedTransferSchema
>;
export type TokenTransferMessages = z.infer<typeof TokenTransferMessagesSchema>;
