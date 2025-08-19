import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { apiBigInt } from "@/lib/zod/validators/bigint";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { timestamp } from "@/lib/zod/validators/timestamp";
import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { z } from "zod";

export const BondSchema = z.object({
  cap: apiBigInt.describe("The cap of the bond"),
  faceValue: apiBigInt.describe("The face value of the bond"),
  maturityDate: timestamp()
    .transform((date) => date.getTime().toString())
    .describe("The maturity date of the bond"),
  denominationAsset: ethereumAddress.describe(
    "The denomination asset of the bond"
  ),
});

/**
 * Bond token specific schema with additional required fields
 */
export const BondTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.bond),
}).extend(BondSchema.shape);
