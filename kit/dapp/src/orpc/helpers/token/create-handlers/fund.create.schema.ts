import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  TokenBaseSchema,
  createTokenMessagesSchema,
} from "@/orpc/helpers/token/token.base-create.schema";
import { z } from "zod/v4";

export const FundTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.fund),
  messages: createTokenMessagesSchema(AssetTypeEnum.fund).optional(),
  managementFeeBps: z.number().int().min(0).max(10000),
});

