import { AssetTypeEnum } from "@atk/zod/validators/asset-types";
import { z } from "zod";
import { TokenBaseSchema } from "@/routes/token/routes/mutations/create/helpers/token.base-create.schema";

/**
 * Equity token specific schema with additional required fields
 */
export const EquityTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.equity),
});
