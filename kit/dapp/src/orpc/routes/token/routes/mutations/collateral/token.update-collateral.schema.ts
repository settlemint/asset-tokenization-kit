import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import { z } from "zod";

export const TokenUpdateCollateralInputSchema =
  MutationInputSchemaWithContract.extend({
    amount: apiBigInt.describe(
      "The new collateral amount that will back the token"
    ),
    expiryDays: z
      .number()
      .min(1, "Expiry must be at least 1 day")
      .max(365, "Expiry cannot exceed 365 days")
      .describe("Number of days until the collateral claim expires"),
  });

export type TokenUpdateCollateralInput = z.infer<
  typeof TokenUpdateCollateralInputSchema
>;
