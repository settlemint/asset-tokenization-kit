import { AssetTypeEnum } from "@atk/zod/validators/asset-types";
import { basisPoints } from "@atk/zod/validators/basis-points";
import { z } from "zod";
import { TokenBaseSchema } from "@/routes/token/routes/mutations/create/helpers/token.base-create.schema";

export const FundSchema = z.object({
  managementFeeBps: basisPoints().describe("Management fee in basis points (0-10000)"),
});

/**
 * Fund token specific schema with additional required fields
 */
export const FundTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.fund),
}).extend(FundSchema.shape);
