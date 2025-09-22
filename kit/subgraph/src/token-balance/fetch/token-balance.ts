import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account, Token, TokenBalance } from "../../../generated/schema";
import { increaseAccountStatsBalanceCount } from "../../stats/account-stats";
import { increaseTokenStatsBalanceCount } from "../../stats/token-stats";
import { setBigNumber } from "../../utils/bignumber";

export function fetchTokenBalance(
  token: Token,
  account: Account
): TokenBalance {
  const id = token.id.concat(account.id);

  let tokenBalance = TokenBalance.load(id);

  if (!tokenBalance) {
    tokenBalance = new TokenBalance(id);
    tokenBalance.token = token.id;
    tokenBalance.account = account.id;
    tokenBalance.lastUpdatedAt = BigInt.zero();
    tokenBalance.isFrozen = false;
    setBigNumber(tokenBalance, "value", BigInt.zero(), token.decimals);
    setBigNumber(tokenBalance, "frozen", BigInt.zero(), token.decimals);
    setBigNumber(tokenBalance, "available", BigInt.zero(), token.decimals);
    tokenBalance.save();

    // Increase account stats balance count
    increaseAccountStatsBalanceCount(Address.fromBytes(account.id), token);

    // Increase token stats balance count
    increaseTokenStatsBalanceCount(Address.fromBytes(token.id));
  }

  return tokenBalance;
}
