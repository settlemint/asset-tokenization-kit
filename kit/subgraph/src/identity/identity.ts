import { BigDecimal, Bytes } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";
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
    const token = identity.token ? Token.load(identity.token!) : null;
    // Get old price before updating claim (should be 0 for new claims)
    const oldPrice = getTokenBasePrice(token);

    updateBasePrice(identityClaim);

    // Update system stats for price change
    if (token) {
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
    const token = identity.token ? Token.load(identity.token!) : null;
    // Get old price before updating claim
    const oldPrice = token ? getTokenBasePrice(token) : BigDecimal.zero();

    updateBasePrice(identityClaim);

    // Update system stats for price change
    if (token) {
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
    const token = identity.token ? Token.load(identity.token!) : null;
    // Get old price before updating claim (should be 0 for new claims)
    const oldPrice = getTokenBasePrice(token);

    updateBasePrice(identityClaim);

    // Update system stats for price change (price goes to 0 when claim removed)
    if (token && oldPrice.gt(BigDecimal.zero())) {
      updateSystemStatsForPriceChange(
        token,
        oldPrice,
        BigDecimal.zero(), // Price becomes 0 when claim is removed
        event.block.timestamp
      );
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
