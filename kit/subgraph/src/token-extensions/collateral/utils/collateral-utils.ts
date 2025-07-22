import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { IdentityClaim } from "../../../../generated/schema";
import { fetchIdentity } from "../../../identity/fetch/identity";
import { fetchIdentityClaimValue } from "../../../identity/fetch/identity-claim-value";
import { trackTokenCollateralStats } from "../../../stats/token-collateral-stats";
import { fetchTokenByIdentity } from "../../../token/fetch/token";
import { setBigNumber } from "../../../utils/bignumber";
import { fetchCollateral } from "../fetch/collateral";

export function isCollateralClaim(claim: IdentityClaim): boolean {
  return claim.name == "collateral";
}

export function updateCollateral(collateralClaim: IdentityClaim): void {
  const identityAddress = Address.fromBytes(collateralClaim.identity);

  const identity = fetchIdentity(identityAddress);
  const token = fetchTokenByIdentity(identity);
  if (!token) {
    log.warning(`No token found for identity {}`, [
      identityAddress.toHexString(),
    ]);
    return;
  }

  const tokenAddress = Address.fromBytes(token.id);
  const collateral = fetchCollateral(tokenAddress);
  collateral.identityClaim = collateralClaim.id;

  const amount = fetchIdentityClaimValue(collateralClaim, "amount");
  const expiryTimestamp = fetchIdentityClaimValue(
    collateralClaim,
    "expiryTimestamp"
  );
  collateral.expiryTimestamp = BigInt.fromString(expiryTimestamp.value);

  const amountValue = BigInt.fromString(amount.value);
  setBigNumber(collateral, "collateral", amountValue, token.decimals);

  collateral.save();

  // Update TokenCollateralStats
  trackTokenCollateralStats(token, collateral);
}
