import { MutationInputSchemaWithContract } from "@/orpc/routes/common/schemas/mutation.schema";
import { apiBigInt } from "@atk/zod/bigint";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

export const TokenUpdateCollateralInputSchema =
  MutationInputSchemaWithContract.extend({
    amount: apiBigInt.describe(
      "The new collateral amount that will back the token"
    ),
    expiryTimestamp: timestamp().describe(
      "The expiry timestamp of the collateral"
    ),
  });

export type TokenUpdateCollateralInput = z.infer<
  typeof TokenUpdateCollateralInputSchema
>;
