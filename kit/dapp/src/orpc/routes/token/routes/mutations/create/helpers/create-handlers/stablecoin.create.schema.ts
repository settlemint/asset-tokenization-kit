import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import { apiBigInt } from "@atk/zod/bigint";
import { z } from "zod";

/**
 * Stablecoin token specific schema
 */
export const StablecoinTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.stablecoin),
  basePrice: apiBigInt.describe("The base price of the stablecoin"),
});
