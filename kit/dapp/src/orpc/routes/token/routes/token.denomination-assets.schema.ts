import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

export const DenominationAssetListSchema = z.array(
  TokenSchema.omit({
    collateral: true,
    yield: true,
    fund: true,
    bond: true,
    redeemable: true,
    capped: true,
    createdBy: true,
    extensions: true,
    implementsERC3643: true,
    implementsSMART: true,
    stats: true,
    identity: true,
    complianceModuleConfigs: true,
    accessControl: true,
    userPermissions: true,
  }).extend({
    tokenFactory: z.object({
      id: ethereumAddress.describe("Factory contract address"),
    }),
  })
);

export const DenominationAssetsResponseSchema = z.object({
  tokens: DenominationAssetListSchema,
});

export type DenominationAssetList = z.infer<typeof DenominationAssetListSchema>;
export type DenominationAssetsResponse = z.infer<
  typeof DenominationAssetsResponseSchema
>;
