import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import { apiBigInt } from "@atk/zod/bigint";
import { z } from "zod";

/**
 * Equity token specific schema with additional required fields
 */
export const EquityTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.equity),
  basePrice: apiBigInt.describe("The base price of the equity"),
});
