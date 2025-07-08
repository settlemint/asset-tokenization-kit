import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import {
  TokenBaseSchema,
  createTokenMessagesSchema,
} from "@/orpc/helpers/token/token.base-create.schema";
import { z } from "zod/v4";

/**
 * Bond token specific schema with additional required fields
 */
export const BondTokenSchema = TokenBaseSchema.extend({
  type: z.literal(AssetTypeEnum.bond),
  messages: createTokenMessagesSchema(AssetTypeEnum.bond).optional(),
  cap: z.string().describe("The cap of the bond"),
  faceValue: z.string().describe("The face value of the bond"),
  maturityDate: z.string().describe("The maturity date of the bond"),
  underlyingAsset: ethereumAddress.describe("The underlying asset of the bond"),
});
