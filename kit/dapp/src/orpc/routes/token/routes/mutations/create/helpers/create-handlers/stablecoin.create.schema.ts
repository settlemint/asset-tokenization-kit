import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { z } from "zod";

/**
 * Stablecoin token specific schema
 */
export const StablecoinTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.stablecoin),
  basePrice: bigDecimal().describe("The base price of the stablecoin"),
});
