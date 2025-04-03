import { ROLES } from "@/lib/config/roles";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import { getAddress, type Address } from "viem";

export function isSupplyManager(
  currentUserWallet: Address | undefined,
  assetUsersDetails: Awaited<ReturnType<typeof getAssetUsersDetail>> | undefined
) {
  if (currentUserWallet && assetUsersDetails) {
    try {
      const normalizedUserAddress = getAddress(currentUserWallet);

      const userRoleInfo = assetUsersDetails.roles.find((role) => {
        try {
          return getAddress(role.id) === normalizedUserAddress;
        } catch {
          return false;
        }
      });

      const userRoles = userRoleInfo?.roles ?? [];

      return userRoles.includes(ROLES.SUPPLY_MANAGEMENT_ROLE.contractRole);
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
