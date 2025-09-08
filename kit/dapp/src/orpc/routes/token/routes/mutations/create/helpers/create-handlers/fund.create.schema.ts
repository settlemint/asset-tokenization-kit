import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import { basisPoints } from "@atk/zod/basis-points";
import { apiBigInt } from "@atk/zod/bigint";
import { z } from "zod";

export const FundSchema = z.object({
  managementFeeBps: basisPoints().describe(
    "Management fee in basis points (0-10000)"
  ),
});

/**
 * Fund token specific schema with additional required fields
 */
export const FundTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.fund),
  basePrice: apiBigInt.describe("The base price of the fund"),
}).extend(FundSchema.shape);
