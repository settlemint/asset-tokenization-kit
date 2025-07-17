import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
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
import { updateAccountStatsForPriceChange } from "../stats/account-stats";
import {
  getTokenBasePrice,
  updateSystemStatsForPriceChange,
} from "../stats/system-stats";
import {
  isCollateralClaim,
  updateCollateral,
} from "../token-extensions/collateral/utils/collateral-utils";
import { fetchTokenByIdentity } from "../token/fetch/token";
import { updateBasePrice } from "../token/utils/token-utils";
import { fetchIdentity } from "./fetch/identity";
import { fetchIdentityClaim } from "./fetch/identity-claim";
import { decodeClaimValues } from "./utils/decode-claim";
import { isBasePriceClaim } from "./utils/is-claim";

/**
 * Update account stats for all holders of a token when its base price changes
 */
function updateAccountStatsForAllTokenHolders(
  token: Token | null,
  oldPrice: BigDecimal,
  newPrice: BigDecimal
): void {
  if (!token) {
    return;
  }

  // Load all token balances for this token
  const balances = token.balances.load();

  for (let i = 0; i < balances.length; i++) {
    const balance = balances[i];
    if (balance.valueExact.gt(BigInt.zero())) {
      // Update account stats for this holder
      updateAccountStatsForPriceChange(
        Address.fromBytes(balance.account),
        balance,
        oldPrice,
        newPrice
      );
    }
  }
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
    const token = fetchTokenByIdentity(identity);
    if (token) {
      const newPrice = getTokenBasePrice(identityClaim.id);
      updateSystemStatsForPriceChange(token, BigDecimal.zero(), newPrice);

      // Update account stats for all token holders
      updateAccountStatsForAllTokenHolders(token, BigDecimal.zero(), newPrice);
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

  // Get old price before updating claim
  const oldPrice = isBasePriceClaim(identityClaim)
    ? getTokenBasePrice(identityClaim.id)
    : BigDecimal.zero();

  // Decode claim data and create IdentityClaimValue entities
  decodeClaimValues(identityClaim, event.params.topic, event.params.data);

  if (isCollateralClaim(identityClaim)) {
    updateCollateral(identityClaim);
  }
  if (isBasePriceClaim(identityClaim)) {
    updateBasePrice(identityClaim);

    const token = fetchTokenByIdentity(identity);
    // Update system stats for price change
    if (token) {
      const newPrice = getTokenBasePrice(identityClaim.id);
      updateSystemStatsForPriceChange(token, oldPrice, newPrice);

      // Update account stats for all token holders
      updateAccountStatsForAllTokenHolders(token, oldPrice, newPrice);
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
    const token = fetchTokenByIdentity(identity);
    // Get old price before updating claim (should be 0 for new claims)
    const oldPrice = token
      ? getTokenBasePrice(token.basePriceClaim)
      : BigDecimal.zero();

    updateBasePrice(identityClaim);

    // Update system stats for price change (price goes to 0 when claim removed)
    if (token && oldPrice.notEqual(BigDecimal.zero())) {
      updateSystemStatsForPriceChange(
        token,
        oldPrice,
        BigDecimal.zero() // Price becomes 0 when claim is removed
      );

      // Update account stats for all token holders
      updateAccountStatsForAllTokenHolders(
        token,
        oldPrice,
        BigDecimal.zero() // Price becomes 0 when claim is removed
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
