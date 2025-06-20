import type { AssetUsers } from "@/lib/queries/asset/asset-users-schema";
import { getAddress, type Address } from "viem";

export function isSupplyManager(
  currentUserWallet: Address | undefined,
  assetUsersDetails: AssetUsers | undefined
) {
  if (currentUserWallet && assetUsersDetails) {
    try {
      const normalizedUserAddress = getAddress(currentUserWallet);

      return assetUsersDetails.supplyManagers.some((permission) => {
        try {
          return getAddress(permission.id) === normalizedUserAddress;
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error(
        "Error determining supply manager role from assetUsersDetails:",
        error
      );
      return false;
    }
  }
  return false;
}

export function isTokenAdmin(
  currentUserWallet: Address | undefined,
  assetUsersDetails: AssetUsers | undefined
) {
  if (currentUserWallet && assetUsersDetails) {
    try {
      const normalizedUserAddress = getAddress(currentUserWallet);

      return assetUsersDetails.admins.some((permission) => {
        try {
          return getAddress(permission.id) === normalizedUserAddress;
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error(
        "Error determining token admin role from assetUsersDetails:",
        error
      );
      return false;
    }
  }
  return false;
}
