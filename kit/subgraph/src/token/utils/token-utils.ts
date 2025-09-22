import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";
import {
  IdentityClaim,
  Token,
  TokenFactory,
  TokenFactoryRegistry,
} from "../../../generated/schema";
import { fetchIdentity } from "../../identity/fetch/identity";
import { fetchIdentityClaimValue } from "../../identity/fetch/identity-claim-value";
import { updateTokenStatsTotalValueInBaseCurrency } from "../../stats/token-stats";
import { setBigNumber } from "../../utils/bignumber";
import { toBigDecimal } from "../../utils/token-decimals";
import { fetchTokenByIdentity } from "../fetch/token";

export function increaseTokenSupply(token: Token, amount: BigInt): void {
  setBigNumber(
    token,
    "totalSupply",
    token.totalSupplyExact.plus(amount),
    token.decimals
  );

  token.save();

  // Update token stats
  updateTokenStatsTotalValueInBaseCurrency(token);
}

export function decreaseTokenSupply(token: Token, amount: BigInt): void {
  setBigNumber(
    token,
    "totalSupply",
    token.totalSupplyExact.minus(amount),
    token.decimals
  );

  token.save();

  // Update token stats
  updateTokenStatsTotalValueInBaseCurrency(token);
}

export function updateBasePrice(basePriceClaim: IdentityClaim): void {
  const identityAddress = Address.fromBytes(basePriceClaim.identity);

  const identity = fetchIdentity(identityAddress);
  const token = fetchTokenByIdentity(identity);
  if (!token) {
    log.warning(`No token found for identity {}`, [
      identityAddress.toHexString(),
    ]);
    return;
  }

  token.basePriceClaim = basePriceClaim.id;
  token.save();

  // Update token stats
  updateTokenStatsTotalValueInBaseCurrency(token);
}

export function getTokenType(tokenFactory: TokenFactory): string {
  if (tokenFactory.typeId == "ATKBondFactory") {
    return "bond";
  } else if (tokenFactory.typeId == "ATKDepositFactory") {
    return "deposit";
  } else if (tokenFactory.typeId == "ATKEquityFactory") {
    return "equity";
  } else if (tokenFactory.typeId == "ATKFundFactory") {
    return "fund";
  } else if (tokenFactory.typeId == "ATKStableCoinFactory") {
    return "stablecoin";
  } else {
    log.warning(`Unknown token factory type: {}`, [tokenFactory.typeId]);
    return "unknown";
  }
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

/**
 * Get the system address from a token
 * This is a helper function similar to the one in system-stats.ts
 */
export function getTokenSystemAddress(token: Token): Address {
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
