import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  TokenBaseSchema,
  createTokenMessagesSchema,
} from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { z } from "zod";

/**
 * Equity token specific schema with additional required fields
 */
export const EquityTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.equity),
  messages: createTokenMessagesSchema(AssetTypeEnum.equity).optional(),
});
