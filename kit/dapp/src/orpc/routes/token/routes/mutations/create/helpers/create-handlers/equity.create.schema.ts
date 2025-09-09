import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { z } from "zod";

/**
 * Equity token specific schema with additional required fields
 */
export const EquityTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.equity),
  basePrice: bigDecimal().describe("The base price of the equity"),
});
