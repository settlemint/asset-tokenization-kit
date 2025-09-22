import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import { Token, TokenBalance } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";
import { decreaseAccountStatsBalanceCount } from "../../stats/account-stats";
import { updateTokenDistributionStats } from "../../stats/token-distribution-stats";
import { decreaseTokenStatsBalanceCount } from "../../stats/token-stats";
import { updateBondStatsForDenominationAssetBalanceChange } from "../../stats/utils/bond-stats-utils";
import { setBigNumber } from "../../utils/bignumber";
import { fetchTokenBalance } from "../fetch/token-balance";

export function increaseTokenBalanceValue(
  token: Token,
  account: Address,
  value: BigInt,
  timestamp: BigInt
): void {
  const balance = fetchTokenBalance(token, fetchAccount(account));
  const oldValue = balance.valueExact;
  const newValue = balance.valueExact.plus(value);

  if (newValue.le(BigInt.zero())) {
    removeTokenBalance(balance);
    return;
  }

  setBigNumber(balance, "value", newValue, token.decimals);
  updateAvailableAmount(balance, token.decimals);

  balance.lastUpdatedAt = timestamp;

  balance.save();

  // Update distribution stats with old and new balance
  updateTokenDistributionStats(
    token,
    fetchAccount(account),
    oldValue,
    newValue
  );

  // Check if this balance change affects any bond token's denomination asset balance
  updateBondStatsForDenominationAssetBalanceChange(token, account);
}

export function decreaseTokenBalanceValue(
  token: Token,
  account: Address,
  value: BigInt,
  timestamp: BigInt
): void {
  const balance = fetchTokenBalance(token, fetchAccount(account));
  const oldValue = balance.valueExact;
  const newValue = balance.valueExact.minus(value);

  if (newValue.le(BigInt.zero())) {
    removeTokenBalance(balance);
    return;
  }

  setBigNumber(balance, "value", newValue, token.decimals);
  updateAvailableAmount(balance, token.decimals);

  balance.lastUpdatedAt = timestamp;

  balance.save();

  // Update distribution stats with old and new balance
  updateTokenDistributionStats(
    token,
    fetchAccount(account),
    oldValue,
    newValue
  );

  // Check if this balance change affects any bond token's denomination asset balance
  updateBondStatsForDenominationAssetBalanceChange(token, account);
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
  oldAccountAddress: Address,
  newAccountAddress: Address,
  timestamp: BigInt
): void {
  const oldAccount = fetchAccount(oldAccountAddress);
  const newAccount = fetchAccount(newAccountAddress);

  const oldBalance = fetchTokenBalance(token, oldAccount);

  if (oldBalance.valueExact.le(BigInt.zero()) && !oldBalance.isFrozen) {
    removeTokenBalance(oldBalance);
    return;
  }

  const newBalance = fetchTokenBalance(token, newAccount);

  setBigNumber(newBalance, "value", oldBalance.valueExact, token.decimals);
  setBigNumber(newBalance, "frozen", oldBalance.frozenExact, token.decimals);
  updateAvailableAmount(newBalance, token.decimals);

  newBalance.isFrozen = oldBalance.isFrozen;
  newBalance.lastUpdatedAt = timestamp;

  newBalance.save();

  removeTokenBalance(oldBalance);

  // Update distribution stats with old and new balance
  updateTokenDistributionStats(
    token,
    newAccount,
    BigInt.zero(),
    newBalance.valueExact
  );
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
  // Update distribution stats before removing (balance goes to zero)
  const token = Token.load(tokenBalance.token)!;
  const account = fetchAccount(Address.fromBytes(tokenBalance.account));
  updateTokenDistributionStats(
    token,
    account,
    tokenBalance.valueExact,
    BigInt.zero()
  );

  store.remove("TokenBalance", tokenBalance.id.toHexString());
  decreaseAccountStatsBalanceCount(
    Address.fromBytes(tokenBalance.account),
    token
  );
  decreaseTokenStatsBalanceCount(Address.fromBytes(tokenBalance.token));
}
