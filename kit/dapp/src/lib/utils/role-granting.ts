import type { User } from "@/lib/auth/types";
import { grantRoleFunction } from "@/lib/mutations/asset/access-control/grant-role/grant-role-function";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Hex } from "viem";
import type { VerificationType } from "./typebox/verification-type";

export interface AssetAdmin {
  wallet: Hex;
  roles: string[];
}

/**
 * Helper function to grant roles to multiple admins for an asset
 *
 * @param assetAdmins - Array of admin objects with their wallet addresses and roles
 * @param predictedAddress - The address of the asset contract
 * @param verificationCode - The verification code for authentication
 * @param verificationType - The type of verification (TOTP, backup code)
 * @param assetType - The type of asset (stablecoin, deposit, cryptocurrency, etc.)
 * @param user - The user executing the role grants
 * @returns Array of transaction hashes from the role grant operations
 */
export async function grantRolesToAdmins(
  assetAdmins: AssetAdmin[],
  predictedAddress: Hex,
  verificationCode: number,
  verificationType: VerificationType,
  assetType: AssetType,
  user: User
): Promise<string[]> {
  // Map each admin to their role grant operation
  const grantRolePromises = assetAdmins.map(async (admin) => {
    const roles = {
      DEFAULT_ADMIN_ROLE: admin.roles.includes("admin"),
      SUPPLY_MANAGEMENT_ROLE: admin.roles.includes("issuer"),
      USER_MANAGEMENT_ROLE: admin.roles.includes("user-manager"),
    };

    return grantRoleFunction({
      parsedInput: {
        address: predictedAddress,
        roles,
        userAddress: admin.wallet,
        verificationCode,
        verificationType,
        assettype: assetType,
      },
      ctx: { user },
    });
  });

  // Execute all role grants in parallel and collect transaction hashes
  const grantRoleResults = await Promise.all(grantRolePromises);
  return grantRoleResults.flatMap((result) => result);
}
