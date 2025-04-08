import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating update roles mutation inputs
 *
 * @property {string} address - The equity contract address
 * @property {Object} roles - Map of role names to boolean values indicating which roles to update
 * @property {string} userAddress - The address of the user whose roles will be updated
 * @property {string} pincode - The pincode for signing the transaction
 */
export const UpdateRolesSchema = () =>
  t.Object({
    address: t.EthereumAddress({
      description: "The contract address",
    }),
    roles: t.RoleMap({
      description:
        "Map of role names to boolean values indicating which roles to update",
    }),
    userAddress: t.EthereumAddress({
      description: "The address of the user whose roles will be updated",
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

export type UpdateRolesInput = StaticDecode<
  ReturnType<typeof UpdateRolesSchema>
>;
