import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating grant role mutation inputs
 *
 * @property {string} address - The stablecoin contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to grant
 * @property {string} userAddress - The address of the user to grant roles to
 * @property {string} pincode - The pincode for signing the transaction
 */
export const GrantRoleSchema = () =>
  t.Object({
    address: t.EthereumAddress({
      description: "The contract address",
    }),
    roles: t.RoleMap({
      description:
        "Map of role names to boolean values indicating which roles to grant",
    }),
    userAddress: t.EthereumAddress({
      description: "The address of the user to grant roles to",
    }),
    verificationCode: t.VerificationCode({
      description:
        "The verification code (PIN, 2FA, or secret code) for signing the transaction",
    }),
    verificationType: t.VerificationType({
      description: "The type of verification",
    }),
    assettype: t.AssetType({
      description: "The type of asset",
    }),
  });

export type GrantRoleInput = StaticDecode<ReturnType<typeof GrantRoleSchema>>;
