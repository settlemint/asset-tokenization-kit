import { TokenBaseSchema } from "../token.base-create.schema";
import { AssetTypeEnum } from "@atk/zod/validators/asset-types";
import { z } from "zod";

/**
 * Equity token specific schema with additional required fields
 */
export const EquityTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.equity),
});
