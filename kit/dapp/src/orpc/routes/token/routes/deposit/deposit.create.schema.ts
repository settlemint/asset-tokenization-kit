/**
 * Schema for Deposit Token Creation Operations
 *
 * This schema defines the structure and validation for creating deposit tokens
 * through the deposit factory. It extends common schemas to provide consistent
 * transaction tracking and messaging capabilities.
 *
 * Deposit tokens represent deposit-backed financial instruments on the blockchain
 * with configurable properties like name, symbol, and decimal precision.
 */

import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { decimals } from "@/lib/zod/validators/decimals";
import { isin } from "@/lib/zod/validators/isin";
import { CreateSchema } from "@/orpc/routes/common/schemas/create.schema";
import { z } from "zod/v4";
import { TransactionTrackingMessagesSchema } from "../../../common/schemas/transaction-messages.schema";

/**
 * Combined messages schema for deposit creation
 * Extends common transaction tracking messages with deposit-specific messages
 */
export const DepositCreateMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    creatingDeposit: z.string().optional().default("Creating the deposit..."),
    depositCreated: z
      .string()
      .optional()
      .default("Deposit successfully created."),
    depositCreationFailed: z
      .string()
      .optional()
      .default("Failed to create the deposit."),
    // Messages used by useStreamingMutation hook
    initialLoading: z
      .string()
      .optional()
      .default("Preparing to create deposit..."),
    noResultError: z
      .string()
      .optional()
      .default("No transaction hash received from deposit creation."),
    defaultError: z
      .string()
      .optional()
      .default("Failed to create the deposit."),
  });

export const DepositTokenCreateSchema = CreateSchema.extend({
  type: z.literal(AssetTypeEnum.deposit),
  name: z.string().describe("The name of the deposit"),
  symbol: z.string().describe("The symbol of the deposit"),
  decimals: decimals(),
  isin: isin().optional(),
  /**
   * Optional custom messages for the operation
   * If not provided, default English messages will be used
   */
  messages: DepositCreateMessagesSchema.optional(),
});

/**
 * Output schema for streaming events during deposit creation
 */
export const DepositCreateOutputSchema = z.object({
  status: z.enum(["pending", "confirmed", "failed"]),
  message: z.string(),
  transactionHash: z.string().optional(),
  result: z.string().optional(), // For compatibility with useStreamingMutation hook
});

// Type exports using Zod's type inference
export type DepositCreateInput = z.infer<typeof DepositTokenCreateSchema>;
export type DepositCreateMessages = z.infer<typeof DepositCreateMessagesSchema>;
export type DepositCreateOutput = z.infer<typeof DepositCreateOutputSchema>;
