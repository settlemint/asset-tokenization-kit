import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/validators/bigint";
import type { z } from "zod";
import { isoCountryCodeNumeric } from "@atk/zod/validators/iso-country-code";

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
    countryCode: isoCountryCodeNumeric.describe(
      "ISO 3166-1 numeric country code for jurisdiction"
    ),
  });

export type TokenSetYieldScheduleInput = z.infer<
  typeof TokenSetYieldScheduleInputSchema
>;
