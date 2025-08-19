import { AssetTypeEnum } from "@atk/zod/validators/asset-types";
import { z } from "zod";
import { TokenBaseSchema } from "@/routes/token/routes/mutations/create/helpers/token.base-create.schema";

/**
 * Stablecoin token specific schema
 */
export const StablecoinTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.stablecoin),
});
