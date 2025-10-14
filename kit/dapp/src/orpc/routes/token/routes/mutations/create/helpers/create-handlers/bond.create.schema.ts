import { TokenBaseSchema } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import { apiBigInt } from "@atk/zod/bigint";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

export const BondSchema = z.object({
  cap: apiBigInt.describe("The cap of the bond"),
  faceValue: apiBigInt.describe("The face value of the bond"),
  maturityDate: timestamp().describe("The maturity date of the bond"),
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
