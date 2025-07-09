import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  TokenBaseSchema,
  createTokenMessagesSchema,
} from "@/orpc/helpers/token/token.base-create.schema";
import { z } from "zod/v4";

/**
 * Equity token specific schema with additional required fields
 */
export const EquityTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.equity),
  messages: createTokenMessagesSchema(AssetTypeEnum.equity).optional(),
});
