import { BigDecimal, Bytes } from "@graphprotocol/graph-ts";
import { Identity, Token } from "../../generated/schema";
import {
  Approved,
  ClaimAdded,
  ClaimChanged,
  ClaimRemoved,
  Executed,
  ExecutionFailed,
  ExecutionRequested,
  KeyAdded,
  KeyRemoved,
} from "../../generated/templates/Identity/Identity";
import { fetchEvent } from "../event/fetch/event";
import {
  getTokenBasePrice,
  updateSystemStatsForPriceChange,
} from "../stats/system-stats";
import {
  isCollateralClaim,
  updateCollateral,
} from "../token-extensions/collateral/utils/collateral-utils";
import { updateBasePrice } from "../token/utils/token-utils";
import { fetchIdentity } from "./fetch/identity";
import { fetchIdentityClaim } from "./fetch/identity-claim";
import { decodeClaimValues } from "./utils/decode-claim";
import { isBasePriceClaim } from "./utils/is-claim";

/**
 * Get the current base price for a token before claim update
 */
function getOldBasePriceForToken(
  identity: Identity,
  claimId: Bytes
): BigDecimal {
  // Check if this identity is associated with a token
  if (!identity.token) {
    return BigDecimal.zero();
  }

  const token = Token.load(identity.token!);
  if (
    !token ||
    !token.basePriceClaim ||
    !token.basePriceClaim!.equals(claimId)
  ) {
    return BigDecimal.zero();
  }

  // Get current price before update
  return getTokenBasePrice(token);
}

export function handleApproved(event: Approved): void {
  fetchEvent(event, "Approved");
}

export function handleClaimAdded(event: ClaimAdded): void {
  fetchEvent(event, "ClaimAdded");
  const identity = fetchIdentity(event.address);
  const identityClaim = fetchIdentityClaim(identity, event.params.claimId);
  if (identityClaim.deployedInTransaction.equals(Bytes.empty())) {
    identityClaim.deployedInTransaction = event.transaction.hash;
  }
  identityClaim.issuer = fetchIdentity(event.params.issuer).id;
  identityClaim.uri = event.params.uri;
  identityClaim.save();

  // Decode claim data and create IdentityClaimValue entities
  decodeClaimValues(identityClaim, event.params.topic, event.params.data);

  if (isCollateralClaim(identityClaim)) {
    updateCollateral(identityClaim);
  }
  if (isBasePriceClaim(identityClaim)) {
    updateBasePrice(identityClaim);

    // Update system stats for price change
    if (identity.token) {
      const token = Token.load(identity.token!);
      if (token) {
        // Get old price before updating claim (should be 0 for new claims)
        const oldPrice = getOldBasePriceForToken(
          identity,
          event.params.claimId
        );
        const newPrice = getTokenBasePrice(token);
        updateSystemStatsForPriceChange(
          token,
          oldPrice,
          newPrice,
          event.block.timestamp
        );
      }
    }
  }
}

export function handleClaimChanged(event: ClaimChanged): void {
  fetchEvent(event, "ClaimChanged");
  const identity = fetchIdentity(event.address);
  const identityClaim = fetchIdentityClaim(identity, event.params.claimId);
  identityClaim.issuer = fetchIdentity(event.params.issuer).id;
  identityClaim.uri = event.params.uri;
  identityClaim.save();

  // Decode claim data and create IdentityClaimValue entities
  decodeClaimValues(identityClaim, event.params.topic, event.params.data);

  if (isCollateralClaim(identityClaim)) {
    updateCollateral(identityClaim);
  }
  if (isBasePriceClaim(identityClaim)) {
    updateBasePrice(identityClaim);

    // Update system stats for price change
    if (identity.token) {
      const token = Token.load(identity.token!);
      if (token) {
        // Get old price before updating claim
        const oldPrice = getOldBasePriceForToken(
          identity,
          event.params.claimId
        );
        const newPrice = getTokenBasePrice(token);
        updateSystemStatsForPriceChange(
          token,
          oldPrice,
          newPrice,
          event.block.timestamp
        );
      }
    }
  }
}

export function handleClaimRemoved(event: ClaimRemoved): void {
  fetchEvent(event, "ClaimRemoved");
  const identity = fetchIdentity(event.address);
  const identityClaim = fetchIdentityClaim(identity, event.params.claimId);
  identityClaim.revoked = true;
  identityClaim.save();

  if (isCollateralClaim(identityClaim)) {
    updateCollateral(identityClaim);
  }
  if (isBasePriceClaim(identityClaim)) {
    updateBasePrice(identityClaim);

    // Update system stats for price change (price goes to 0 when claim removed)
    if (identity.token) {
      const token = Token.load(identity.token!);
      if (token) {
        // Get old price before removing claim
        const oldPrice = getOldBasePriceForToken(
          identity,
          event.params.claimId
        );
        if (oldPrice.gt(BigDecimal.zero())) {
          updateSystemStatsForPriceChange(
            token,
            oldPrice,
            BigDecimal.zero(), // Price becomes 0 when claim is removed
            event.block.timestamp
          );
        }
      }
    }
  }
}

export function handleExecuted(event: Executed): void {
  fetchEvent(event, "Executed");
}

export function handleExecutionFailed(event: ExecutionFailed): void {
  fetchEvent(event, "ExecutionFailed");
}

export function handleExecutionRequested(event: ExecutionRequested): void {
  fetchEvent(event, "ExecutionRequested");
}

export function handleKeyAdded(event: KeyAdded): void {
  fetchEvent(event, "KeyAdded");
}

export function handleKeyRemoved(event: KeyRemoved): void {
  fetchEvent(event, "KeyRemoved");
}
