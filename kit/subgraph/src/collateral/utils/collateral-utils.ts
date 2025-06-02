import { Address, log } from "@graphprotocol/graph-ts";
import { IdentityClaim } from "../../../generated/schema";
import { fetchIdentity } from "../../identity/fetch/identity";
import { fetchCollateral } from "../fetch/collateral";

export function isCollateralClaim(claim: IdentityClaim): boolean {
  return claim.name == "collateral";
}

export function updateCollateral(collateralClaim: IdentityClaim): void {
  const identityAddress = Address.fromBytes(collateralClaim.identity);

  const identity = fetchIdentity(identityAddress);
  const tokens = identity.token.load();
  if (!tokens || tokens.length === 0) {
    log.warning(`No tokens found for identity {}`, [
      identityAddress.toHexString(),
    ]);
    return;
  }

  const token = tokens[0];
  const collateral = fetchCollateral(Address.fromBytes(token.id));
  collateral.identityClaim = collateralClaim.id;

  collateral.save();
}
