import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import type { z } from "zod";

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
  });

export type TokenSetYieldScheduleInput = z.infer<
  typeof TokenSetYieldScheduleInputSchema
>;
