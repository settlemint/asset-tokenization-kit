import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import { basisPoints } from "@atk/zod/basis-points";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { fundCategory } from "@atk/zod/fund-categories";
import { fundClass } from "@atk/zod/fund-classes";
import { z } from "zod";

export const FundSchema = z.object({
  managementFeeBps: basisPoints().describe(
    "Management fee in basis points (0-10000)"
  ),
});

/**
 * Fund token specific schema with additional required fields
 */
export const FundTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.fund),
  basePrice: bigDecimal().describe("The base price of the fund"),
  class: fundClass().describe("The class of the fund"),
  category: fundCategory().describe("The category of the fund"),
}).extend(FundSchema.shape);
