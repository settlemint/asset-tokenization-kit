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
import { fetchToken, fetchTokenByIdentity } from "../fetch/token";

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

  const basePriceInfo = getTokenBasePriceWithCurrencyCode(basePriceClaim.id);
  token.basePrice = basePriceInfo.value;
  token.basePriceCurrencyCode = basePriceInfo.currencyCode;

  const denominationAssetForBond = token.denominationAssetForBond.load();
  for (let i = 0; i < denominationAssetForBond.length; i++) {
    const bond = denominationAssetForBond[i];
    const bondToken = fetchToken(
      Address.fromBytes(denominationAssetForBond[i].id)
    );

    bondToken.basePrice = bond.faceValue.times(basePriceInfo.value);
    bondToken.basePriceCurrencyCode = basePriceInfo.currencyCode;
    bondToken.save();
  }

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

class TokenBasePrice {
  value: BigDecimal;
  currencyCode: string;
}

export function getTokenBasePrice(basePriceClaim: Bytes | null): BigDecimal {
  const basePriceInfo = getTokenBasePriceWithCurrencyCode(basePriceClaim);
  return basePriceInfo.value;
}

/**
 * Get base price for a token from its basePriceClaim
 */
export function getTokenBasePriceWithCurrencyCode(
  basePriceClaim: Bytes | null
): TokenBasePrice {
  if (!basePriceClaim) {
    return { value: BigDecimal.zero(), currencyCode: "" };
  }

  const claim = IdentityClaim.load(basePriceClaim);
  if (!claim) {
    return { value: BigDecimal.zero(), currencyCode: "" };
  }

  const basePriceClaimValue = fetchIdentityClaimValue(claim, "amount");
  const basePriceClaimDecimals = fetchIdentityClaimValue(claim, "decimals");
  const basePriceClaimCurrencyCode = fetchIdentityClaimValue(
    claim,
    "currencyCode"
  );

  if (!basePriceClaimValue || !basePriceClaimValue.value) {
    return {
      value: BigDecimal.zero(),
      currencyCode: basePriceClaimCurrencyCode
        ? basePriceClaimCurrencyCode.value
        : "",
    };
  }

  const basePrice = toBigDecimal(
    BigInt.fromString(basePriceClaimValue.value),
    I32.parseInt(basePriceClaimDecimals.value)
  );

  return {
    value: basePrice,
    currencyCode: basePriceClaimCurrencyCode
      ? basePriceClaimCurrencyCode.value
      : "",
  };
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
