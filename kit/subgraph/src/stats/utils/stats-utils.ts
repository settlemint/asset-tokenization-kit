import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  IdentityClaim,
  Token,
  TokenFactory,
  TokenFactoryRegistry,
} from "../../../generated/schema";
import { fetchIdentityClaimValue } from "../../identity/fetch/identity-claim-value";
import { toBigDecimal } from "../../utils/token-decimals";

/**
 * Get the system address from a token
 * This is a helper function similar to the one in system-stats.ts
 */
export function getSystemAddress(token: Token): Address {
  if (!token.tokenFactory) {
    return Address.zero();
  }

  const tokenFactory = TokenFactory.load(token.tokenFactory!);
  if (!tokenFactory) {
    return Address.zero();
  }

  if (!tokenFactory.tokenFactoryRegistry) {
    return Address.zero();
  }

  const tokenFactoryRegistry = TokenFactoryRegistry.load(
    tokenFactory.tokenFactoryRegistry!
  );
  if (!tokenFactoryRegistry) {
    return Address.zero();
  }

  return Address.fromBytes(tokenFactoryRegistry.system);
}

/**
 * Get base price for a token from its basePriceClaim
 */
export function getTokenBasePrice(basePriceClaim: Bytes | null): BigDecimal {
  if (!basePriceClaim) {
    return BigDecimal.zero();
  }

  const claim = IdentityClaim.load(basePriceClaim);
  if (!claim) {
    return BigDecimal.zero();
  }

  const basePriceClaimValue = fetchIdentityClaimValue(claim, "amount");
  const basePriceClaimDecimals = fetchIdentityClaimValue(claim, "decimals");

  if (!basePriceClaimValue || !basePriceClaimValue.value) {
    return BigDecimal.zero();
  }

  return toBigDecimal(
    BigInt.fromString(basePriceClaimValue.value),
    I32.parseInt(basePriceClaimDecimals.value)
  );
}
