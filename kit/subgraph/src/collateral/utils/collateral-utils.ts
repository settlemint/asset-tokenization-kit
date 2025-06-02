import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { IdentityClaim } from "../../../../generated/schema";
import { fetchIdentity } from "../../identity/fetch/identity";
import { setBigNumber } from "../../utils/bignumber";
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
  collateral.issuer = collateralClaim.issuer;

  if (collateralClaim.revoked) {
    setBigNumber(collateral, "amount", BigInt.zero(), token.decimals);
  } else {
    const values = collateralClaim.values.load();
    for (let i = 0; i < values.length; i++) {
      const claimValue = values[i];
      if (claimValue.key == "amount") {
        setBigNumber(
          collateral,
          "amount",
          BigInt.fromString(claimValue.value),
          token.decimals
        );
      } else if (claimValue.key == "expiryTimestamp") {
        collateral.expiryTimestamp = BigInt.fromString(claimValue.value);
      } else {
        log.warning(`Unknown claim value key: {}`, [claimValue.key]);
      }
    }
  }
  collateral.save();
}
