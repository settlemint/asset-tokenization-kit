import { Identity } from "../../../generated/schema";
import { deriveEntityType } from "./supported-interfaces";

export function updateIdentityEntityType(
  identity: Identity,
  contractName: string | null
): boolean {
  if (!identity.isContract) {
    if (identity.entityType != "wallet") {
      identity.entityType = "wallet";
      return true;
    }
    return false;
  }

  const nextType = deriveEntityType(contractName, "contract");
  if (identity.entityType != nextType) {
    identity.entityType = nextType;
    return true;
  }

  return false;
}
