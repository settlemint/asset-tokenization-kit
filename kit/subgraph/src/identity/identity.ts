import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  crypto,
  log,
  store,
} from "@graphprotocol/graph-ts";
import { Identity, Token, TopicScheme } from "../../generated/schema";
import {
  Approved,
  ClaimAdded,
  ClaimChanged,
  ClaimRemoved,
  ClaimRevoked,
  Executed,
  ExecutionFailed,
  ExecutionRequested,
  KeyAdded,
  KeyRemoved,
} from "../../generated/templates/Identity/ClaimIssuer";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentityFactory } from "../identity-factory/fetch/identity-factory";
import { updateAccountStatsForPriceChange } from "../stats/account-stats";
import {
  incrementClaimsIssued as incrementRegistryClaimsIssued,
  incrementClaimsRemoved as incrementRegistryClaimsRemoved,
  incrementClaimsRevoked as incrementRegistryClaimsRevoked,
} from "../stats/claims-stats";
import { updateSystemStatsForPriceChange } from "../stats/system-stats";
import { updateTokenTypeStatsForPriceChange } from "../stats/token-type-stats";
import {
  incrementClaimsIssued,
  incrementClaimsRemoved,
  incrementClaimsRevoked,
} from "../stats/topic-scheme-claims";
import { fetchSystem } from "../system/fetch/system";
import {
  isCollateralClaim,
  updateCollateral,
} from "../token-extensions/collateral/utils/collateral-utils";
import { fetchToken, fetchTokenByIdentity } from "../token/fetch/token";
import { getTokenBasePrice, updateBasePrice } from "../token/utils/token-utils";
import { fetchTopicScheme } from "../topic-scheme-registry/fetch/topic-scheme";
import { fetchIdentity } from "./fetch/identity";
import { fetchIdentityClaim } from "./fetch/identity-claim";
import { fetchIdentityKey } from "./fetch/identity-key";
import { decodeClaimValues } from "./utils/decode-claim";
import { updateIdentityEntityType } from "./utils/identity-classification";
import {
  getIdentityKeyPurpose,
  getIdentityKeyType,
} from "./utils/identity-key-utils";
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

  // Ignore bonds as there value is tracked by its denomination asset
  if (token.bond) {
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
        token,
        balance,
        oldPrice,
        newPrice
      );
    }
  }

  // Check if the token is a denomination asset for a bond
  // If so, we need to update the account stats for all holders of the bond
  const bonds = token.denominationAssetForBond.load();
  for (let i = 0; i < bonds.length; i++) {
    const bond = bonds[i];
    const bondToken = fetchToken(Address.fromBytes(bond.id));
    const bondBalances = bondToken.balances.load();
    for (let i = 0; i < bondBalances.length; i++) {
      const bondBalance = bondBalances[i];
      if (bondBalance.valueExact.gt(BigInt.zero())) {
        // Update account stats for this holder
        updateAccountStatsForPriceChange(
          Address.fromBytes(bondBalance.account),
          bondToken,
          bondBalance,
          oldPrice.times(bond.faceValue),
          newPrice.times(bond.faceValue)
        );
      }
    }
  }
}

export function handleApproved(event: Approved): void {
  fetchEvent(event, "Approved");
}

export function handleClaimAdded(event: ClaimAdded): void {
  fetchEvent(event, "ClaimAdded");
  const identity = fetchIdentity(event.address);
  const classificationMutated = updateIdentityEntityType(identity);

  // Decode claim data and create IdentityClaimValue entities
  const topicScheme = getTopicSchemeFromIdentity(event.params.topic, identity);
  if (!topicScheme) {
    if (classificationMutated) {
      identity.save();
    }
    return;
  }

  const identityClaim = fetchIdentityClaim(identity, event.params.claimId);
  if (identityClaim.deployedInTransaction.equals(Bytes.empty())) {
    identityClaim.deployedInTransaction = event.transaction.hash;
  }
  identityClaim.issuer = fetchIdentity(event.params.issuer).id;
  identityClaim.uri = event.params.uri;
  identityClaim.signature = event.params.signature.toHexString();
  identityClaim.topicScheme = topicScheme.id;
  identityClaim.save();

  // Decode claim data and create IdentityClaimValue entities
  decodeClaimValues(identityClaim, topicScheme, event.params.data);

  // Update topic scheme statistics
  incrementClaimsIssued(topicScheme);
  // Update registry-level statistics
  incrementRegistryClaimsIssued(topicScheme);

  if (isCollateralClaim(identityClaim)) {
    updateCollateral(identityClaim);
  }
  if (isBasePriceClaim(identityClaim)) {
    updateBasePrice(identityClaim);

    // Update system stats for price change
    const token = fetchTokenByIdentity(identity);
    if (token) {
      const newPrice = getTokenBasePrice(identityClaim.id);
      const totalSystemValueInBaseCurrency = updateSystemStatsForPriceChange(
        token,
        BigDecimal.zero(),
        newPrice
      );

      // Update token type stats for price change
      updateTokenTypeStatsForPriceChange(
        totalSystemValueInBaseCurrency,
        token,
        BigDecimal.zero(),
        newPrice
      );

      // Update account stats for all token holders
      updateAccountStatsForAllTokenHolders(token, BigDecimal.zero(), newPrice);
    }
  }

  if (classificationMutated) {
    identity.save();
  }
}

export function handleClaimChanged(event: ClaimChanged): void {
  fetchEvent(event, "ClaimChanged");
  const identity = fetchIdentity(event.address);
  const classificationMutated = updateIdentityEntityType(identity);

  // Decode claim data and create IdentityClaimValue entities
  const topicScheme = getTopicSchemeFromIdentity(event.params.topic, identity);
  if (!topicScheme) {
    if (classificationMutated) {
      identity.save();
    }
    return;
  }
  const identityClaim = fetchIdentityClaim(identity, event.params.claimId);
  identityClaim.issuer = fetchIdentity(event.params.issuer).id;
  identityClaim.uri = event.params.uri;
  identityClaim.signature = event.params.signature.toHexString();
  identityClaim.topicScheme = topicScheme.id;
  identityClaim.save();

  // Get old price before updating claim
  const oldPrice = isBasePriceClaim(identityClaim)
    ? getTokenBasePrice(identityClaim.id)
    : BigDecimal.zero();

  decodeClaimValues(identityClaim, topicScheme, event.params.data);

  if (isCollateralClaim(identityClaim)) {
    updateCollateral(identityClaim);
  }
  if (isBasePriceClaim(identityClaim)) {
    updateBasePrice(identityClaim);

    const token = fetchTokenByIdentity(identity);
    // Update system stats for price change
    if (token) {
      const newPrice = getTokenBasePrice(identityClaim.id);
      const totalSystemValueInBaseCurrency = updateSystemStatsForPriceChange(
        token,
        oldPrice,
        newPrice
      );

      // Update token type stats for price change
      updateTokenTypeStatsForPriceChange(
        totalSystemValueInBaseCurrency,
        token,
        oldPrice,
        newPrice
      );

      // Update account stats for all token holders
      updateAccountStatsForAllTokenHolders(token, oldPrice, newPrice);
    }
  }

  if (classificationMutated) {
    identity.save();
  }
}

export function handleClaimRemoved(event: ClaimRemoved): void {
  fetchEvent(event, "ClaimRemoved");
  const identity = fetchIdentity(event.address);
  const classificationMutated = updateIdentityEntityType(identity);
  const identityClaim = fetchIdentityClaim(identity, event.params.claimId);

  const wasAlreadyRevoked = identityClaim.revoked;

  identityClaim.revoked = true;
  identityClaim.save();

  // Update topic scheme statistics
  const topicScheme = TopicScheme.load(identityClaim.topicScheme);
  if (topicScheme) {
    incrementClaimsRemoved(topicScheme, wasAlreadyRevoked);
    // Update registry-level statistics
    incrementRegistryClaimsRemoved(topicScheme, wasAlreadyRevoked);
  }

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
      const totalSystemValueInBaseCurrency = updateSystemStatsForPriceChange(
        token,
        oldPrice,
        BigDecimal.zero() // Price becomes 0 when claim is removed
      );

      // Update token type stats for price change
      updateTokenTypeStatsForPriceChange(
        totalSystemValueInBaseCurrency,
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

  if (classificationMutated) {
    identity.save();
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
  const identity = fetchIdentity(event.address);
  const classificationMutated = updateIdentityEntityType(identity);
  const identityKey = fetchIdentityKey(identity, event.params.key);
  identityKey.identity = identity.id;
  identityKey.type = getIdentityKeyType(event.params.keyType);
  identityKey.purpose = getIdentityKeyPurpose(event.params.purpose);
  identityKey.save();

  if (classificationMutated) {
    identity.save();
  }
}

export function handleKeyRemoved(event: KeyRemoved): void {
  fetchEvent(event, "KeyRemoved");
  const identity = fetchIdentity(event.address);
  const classificationMutated = updateIdentityEntityType(identity);
  const identityKey = fetchIdentityKey(identity, event.params.key);
  store.remove("IdentityKey", identityKey.id.toHexString());

  if (classificationMutated) {
    identity.save();
  }
}

export function handleClaimRevoked(event: ClaimRevoked): void {
  fetchEvent(event, "ClaimRevoked");
  const identity = fetchIdentity(event.address);
  const classificationMutated = updateIdentityEntityType(identity);
  const identityClaims = identity.claims.load();
  for (let i = 0; i < identityClaims.length; i++) {
    const identityClaim = identityClaims[i];
    const signatureHash = crypto
      .keccak256(Bytes.fromHexString(identityClaim.signature))
      .toHexString();
    if (signatureHash == event.params.signature.toHexString()) {
      identityClaim.revoked = true;
      identityClaim.save();

      // Update topic scheme statistics
      const topicScheme = TopicScheme.load(identityClaim.topicScheme);
      if (topicScheme) {
        incrementClaimsRevoked(topicScheme);
        // Update registry-level statistics
        incrementRegistryClaimsRevoked(topicScheme);
      }

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
          const totalSystemValueInBaseCurrency =
            updateSystemStatsForPriceChange(
              token,
              oldPrice,
              BigDecimal.zero() // Price becomes 0 when claim is removed
            );

          // Update token type stats for price change
          updateTokenTypeStatsForPriceChange(
            totalSystemValueInBaseCurrency,
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
      break;
    }
  }

  if (classificationMutated) {
    identity.save();
  }
}

function getTopicSchemeFromIdentity(
  topic: BigInt,
  identity: Identity
): TopicScheme | null {
  const identityFactoryId = identity.identityFactory;
  if (!identityFactoryId) {
    log.error(
      "Identity factory not found for identity: {}, cannot get topic scheme",
      [identity.id.toHexString()]
    );
    return null;
  }

  const identityFactory = fetchIdentityFactory(
    Address.fromBytes(identityFactoryId)
  );
  const system = fetchSystem(Address.fromBytes(identityFactory.system));
  const topicSchemeRegistryId = system.topicSchemeRegistry;
  if (!topicSchemeRegistryId) {
    log.error(
      "Topic scheme registry not found for system: {}, cannot get topic scheme",
      [system.id.toHexString()]
    );
    return null;
  }

  return fetchTopicScheme(topic, Address.fromBytes(topicSchemeRegistryId));
}
