import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  TokenBaseSchema,
  createTokenMessagesSchema,
} from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { z } from "zod";

/**
 * Stablecoin token specific schema
 */
export const StablecoinTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.stablecoin),
  messages: createTokenMessagesSchema(AssetTypeEnum.stablecoin).optional(),
});
