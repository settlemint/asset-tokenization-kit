import { Address, log } from "@graphprotocol/graph-ts";
import { IdentityClaim } from "../../../../generated/schema";
import { fetchIdentity } from "../../../identity/fetch/identity";
import { fetchCollateral } from "../fetch/collateral";
import { fetchToken } from "../../../token/fetch/token";
import { updateTokenCollateralStats } from "../../../stats/utils/token-collateral-stats";

export function isCollateralClaim(claim: IdentityClaim): boolean {
  return claim.name == "collateral";
}

export function updateCollateral(collateralClaim: IdentityClaim): void {
  const identityAddress = Address.fromBytes(collateralClaim.identity);

  const identity = fetchIdentity(identityAddress);
  if (!identity.token) {
    log.warning(`No token found for identity {}`, [
      identityAddress.toHexString(),
    ]);
    return;
  }

  const collateral = fetchCollateral(Address.fromBytes(identity.token!));
  collateral.identityClaim = collateralClaim.id;

  collateral.save();

  // Update TokenCollateralStats
  const token = fetchToken(Address.fromBytes(identity.token!));
  updateTokenCollateralStats(token);
}
