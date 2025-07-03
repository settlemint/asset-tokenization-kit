import {
  Address,
  BigInt,
  store,
  type BigDecimal,
} from "@graphprotocol/graph-ts";
import { Token, TokenBalance } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";
import { decreaseAccountStatsBalanceCount } from "../../stats/account-stats";
import { updateTokenDistributionStats } from "../../stats/token-distribution-stats";
import { decreaseTokenStatsBalanceCount } from "../../stats/token-stats";
import { setBigNumber } from "../../utils/bignumber";
import { toBigDecimal } from "../../utils/token-decimals";
import { fetchTokenBalance } from "../fetch/token-balance";

export function increaseTokenBalanceValue(
  token: Token,
  account: Address,
  value: BigInt,
  timestamp: BigInt
): void {
  const balance = fetchTokenBalance(token, fetchAccount(account));

  // Store old balance for distribution stats
  const oldBalance = toBigDecimal(balance.valueExact, token.decimals);

  const newValue = balance.valueExact.plus(value);

  if (newValue.le(BigInt.zero())) {
    removeTokenBalance(balance, oldBalance);
    return;
  }

  setBigNumber(balance, "value", newValue, token.decimals);
  updateAvailableAmount(balance, token.decimals);

  balance.lastUpdatedAt = timestamp;

  balance.save();

  // Update distribution stats with old and new balance
  const newBalance = toBigDecimal(newValue, token.decimals);
  updateTokenDistributionStats(token, oldBalance, newBalance);
}

export function decreaseTokenBalanceValue(
  token: Token,
  account: Address,
  value: BigInt,
  timestamp: BigInt
): void {
  const balance = fetchTokenBalance(token, fetchAccount(account));

  // Store old balance for distribution stats
  const oldBalance = toBigDecimal(balance.valueExact, token.decimals);

  const newValue = balance.valueExact.minus(value);

  if (newValue.le(BigInt.zero())) {
    removeTokenBalance(balance, oldBalance);
    return;
  }

  setBigNumber(balance, "value", newValue, token.decimals);
  updateAvailableAmount(balance, token.decimals);

  balance.lastUpdatedAt = timestamp;

  balance.save();

  // Update distribution stats with old and new balance
  const newBalance = toBigDecimal(newValue, token.decimals);
  updateTokenDistributionStats(token, oldBalance, newBalance);
}

export function increaseTokenBalanceFrozen(
  token: Token,
  account: Address,
  amount: BigInt,
  timestamp: BigInt
): void {
  const balance = fetchTokenBalance(token, fetchAccount(account));

  setBigNumber(
    balance,
    "frozen",
    balance.frozenExact.plus(amount),
    token.decimals
  );
  updateAvailableAmount(balance, token.decimals);

  balance.lastUpdatedAt = timestamp;

  balance.save();
}

export function decreaseTokenBalanceFrozen(
  token: Token,
  account: Address,
  amount: BigInt,
  timestamp: BigInt
): void {
  const balance = fetchTokenBalance(token, fetchAccount(account));

  setBigNumber(
    balance,
    "frozen",
    balance.frozenExact.minus(amount),
    token.decimals
  );
  updateAvailableAmount(balance, token.decimals);

  balance.lastUpdatedAt = timestamp;

  balance.save();
}

export function freezeOrUnfreezeTokenBalance(
  token: Token,
  account: Address,
  isFrozen: boolean,
  timestamp: BigInt
): void {
  const balance = fetchTokenBalance(token, fetchAccount(account));

  if (balance.valueExact.le(BigInt.zero()) && !isFrozen) {
    const oldBalanceValue = toBigDecimal(balance.valueExact, token.decimals);
    removeTokenBalance(balance, oldBalanceValue);
    return;
  }

  balance.isFrozen = isFrozen;
  updateAvailableAmount(balance, token.decimals);

  balance.lastUpdatedAt = timestamp;

  balance.save();
}

export function moveTokenBalanceToNewAccount(
  token: Token,
  oldAccount: Address,
  newAccount: Address,
  timestamp: BigInt
): void {
  const oldBalance = fetchTokenBalance(token, fetchAccount(oldAccount));

  if (oldBalance.valueExact.le(BigInt.zero()) && !oldBalance.isFrozen) {
    const oldBalanceValue = toBigDecimal(oldBalance.valueExact, token.decimals);
    removeTokenBalance(oldBalance, oldBalanceValue);
    return;
  }

  const newBalance = fetchTokenBalance(token, fetchAccount(newAccount));

  setBigNumber(newBalance, "value", oldBalance.valueExact, token.decimals);
  setBigNumber(newBalance, "frozen", oldBalance.frozenExact, token.decimals);
  updateAvailableAmount(newBalance, token.decimals);

  newBalance.isFrozen = oldBalance.isFrozen;
  newBalance.lastUpdatedAt = timestamp;

  newBalance.save();

  const oldBalanceValue = toBigDecimal(oldBalance.valueExact, token.decimals);
  removeTokenBalance(oldBalance, oldBalanceValue);
}

function updateAvailableAmount(
  tokenBalance: TokenBalance,
  decimals: number
): void {
  if (tokenBalance.isFrozen) {
    setBigNumber(tokenBalance, "available", BigInt.zero(), decimals);
  } else {
    setBigNumber(
      tokenBalance,
      "available",
      tokenBalance.valueExact.minus(tokenBalance.frozenExact),
      decimals
    );
  }
}

function removeTokenBalance(
  tokenBalance: TokenBalance,
  oldBalance: BigDecimal
): void {
  // Update distribution stats before removing (balance goes to zero)
  const token = Token.load(tokenBalance.token)!;
  updateTokenDistributionStats(
    token,
    oldBalance,
    toBigDecimal(BigInt.zero(), token.decimals)
  );

  store.remove("TokenBalance", tokenBalance.id.toHexString());
  decreaseAccountStatsBalanceCount(Address.fromBytes(tokenBalance.account));
  decreaseTokenStatsBalanceCount(Address.fromBytes(tokenBalance.token));
}
