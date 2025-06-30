import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import { Token, TokenBalance } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";
import { decreaseAccountStatsBalanceCount } from "../../stats/account-stats";
import { setBigNumber } from "../../utils/bignumber";
import { fetchTokenBalance } from "../fetch/token-balance";

export function increaseTokenBalanceValue(
  token: Token,
  account: Address,
  value: BigInt,
  timestamp: BigInt
): void {
  const balance = fetchTokenBalance(token, fetchAccount(account));

  const newValue = balance.valueExact.plus(value);

  if (newValue.equals(BigInt.zero())) {
    removeTokenBalance(balance);
    return;
  }

  setBigNumber(balance, "value", newValue, token.decimals);
  updateAvailableAmount(balance, token.decimals);

  balance.lastUpdatedAt = timestamp;

  balance.save();
}

export function decreaseTokenBalanceValue(
  token: Token,
  account: Address,
  value: BigInt,
  timestamp: BigInt
): void {
  const balance = fetchTokenBalance(token, fetchAccount(account));

  const newValue = balance.valueExact.minus(value);

  if (newValue.equals(BigInt.zero())) {
    removeTokenBalance(balance);
    return;
  }

  setBigNumber(balance, "value", newValue, token.decimals);
  updateAvailableAmount(balance, token.decimals);

  balance.lastUpdatedAt = timestamp;

  balance.save();
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

  if (balance.valueExact.equals(BigInt.zero()) && !isFrozen) {
    removeTokenBalance(balance);
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

  if (oldBalance.valueExact.gt(BigInt.zero())) {
    const newBalance = fetchTokenBalance(token, fetchAccount(newAccount));

    setBigNumber(newBalance, "value", oldBalance.valueExact, token.decimals);
    setBigNumber(newBalance, "frozen", oldBalance.frozenExact, token.decimals);
    updateAvailableAmount(newBalance, token.decimals);

    newBalance.lastUpdatedAt = timestamp;

    newBalance.save();
  }

  removeTokenBalance(oldBalance);
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

function removeTokenBalance(tokenBalance: TokenBalance): void {
  store.remove("TokenBalance", tokenBalance.id.toHexString());
  decreaseAccountStatsBalanceCount(Address.fromBytes(tokenBalance.account));
}
