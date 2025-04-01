import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating revoke role mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to revoke
 * @property {string} userAddress - The address of the user to revoke roles from
 * @property {string} pincode - The pincode for signing the transaction
 */
export const RevokeRoleSchema = () =>
  t.Object({
    address: t.EthereumAddress({
      description: "The contract address",
    }),
    roles: t.RoleMap({
      description:
        "Map of role names to boolean values indicating which roles to revoke",
    }),
    userAddress: t.EthereumAddress({
      description: "The address of the user to revoke roles from",
    }),
    verificationCode: t.Union([t.TwoFactorCode(), t.Pincode()], {
      description: "The two factor code or pincode for signing the transaction",
    }),
    verificationType: t.VerificationType({
      description: "The type of verification",
    }),
    assettype: t.AssetType({
      description: "The type of asset",
    }),
  });

export type RevokeRoleInput = StaticDecode<ReturnType<typeof RevokeRoleSchema>>;
