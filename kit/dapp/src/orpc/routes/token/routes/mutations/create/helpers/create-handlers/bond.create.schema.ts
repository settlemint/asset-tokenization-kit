import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { timestamp } from "@/lib/zod/validators/timestamp";
import {
  TokenBaseSchema,
  createTokenMessagesSchema,
} from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create.schema";
import { z } from "zod";

export const BondSchema = z.object({
  cap: z.string().describe("The cap of the bond"),
  faceValue: z.string().describe("The face value of the bond"),
  maturityDate: timestamp()
    .transform((date) => date.getTime().toString())
    .describe("The maturity date of the bond"),
  underlyingAsset: ethereumAddress.describe("The underlying asset of the bond"),
});

/**
 * Bond token specific schema with additional required fields
 */
export const BondTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.bond),
  messages: createTokenMessagesSchema(AssetTypeEnum.bond).optional(),
}).extend(BondSchema.shape);
