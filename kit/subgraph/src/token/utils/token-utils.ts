import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { IdentityClaim, Token, TokenFactory } from "../../../generated/schema";
import { fetchIdentity } from "../../identity/fetch/identity";
import { setBigNumber } from "../../utils/bignumber";
import { fetchTokenByIdentity } from "../fetch/token";

export function increaseTokenSupply(token: Token, amount: BigInt): void {
  setBigNumber(
    token,
    "totalSupply",
    token.totalSupplyExact.plus(amount),
    token.decimals
  );

  token.save();
}

export function decreaseTokenSupply(token: Token, amount: BigInt): void {
  setBigNumber(
    token,
    "totalSupply",
    token.totalSupplyExact.minus(amount),
    token.decimals
  );

  token.save();
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
