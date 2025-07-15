import { apiBigInt } from "@/lib/zod/validators/bigint";
import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { z } from "zod";

export const TokenSetYieldScheduleMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    preparingYieldSchedule: z
      .string()
      .optional()
      .default("Preparing to update yield schedule..."),
    submittingYieldSchedule: z
      .string()
      .optional()
      .default("Submitting yield schedule update transaction..."),
    yieldScheduleSuccessful: z
      .string()
      .optional()
      .default("Yield schedule updated successfully"),
    yieldScheduleFailed: z
      .string()
      .optional()
      .default("Failed to update yield schedule"),
  });

export const TokenSetYieldScheduleInputSchema =
  MutationInputSchemaWithContract.extend({
    yieldRate: apiBigInt.describe("The yield rate in basis points (1% = 100)"),
    paymentInterval: apiBigInt.describe(
      "The payment interval in seconds (e.g., 86400 for daily)"
    ),
    startTime: apiBigInt.describe(
      "The start time for yield payments as Unix timestamp"
    ),
    endTime: apiBigInt.describe(
      "The end time for yield payments as Unix timestamp"
    ),
    messages: TokenSetYieldScheduleMessagesSchema.optional(),
  });

export type TokenSetYieldScheduleInput = z.infer<
  typeof TokenSetYieldScheduleInputSchema
>;
export type TokenSetYieldScheduleMessages = z.infer<
  typeof TokenSetYieldScheduleMessagesSchema
>;
