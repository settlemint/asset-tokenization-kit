import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import {
  TokenBaseSchema,
  createTokenMessagesSchema,
} from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { z } from "zod/v4";

/**
 * Fund token specific schema with additional required fields
 */
export const FundTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.fund),
  messages: createTokenMessagesSchema(AssetTypeEnum.fund).optional(),
  managementFeeBps: z
    .number()
    .int()
    .min(0)
    .max(10000)
    .describe("Management fee in basis points (0-10000)"),
});
