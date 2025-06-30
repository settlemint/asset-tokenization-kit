import {
  AddressFrozen,
  ForcedTransfer,
  RecoverySuccess,
  TokensFrozen,
  TokensUnfrozen,
} from "../../../generated/templates/Custodian/Custodian";
import { BigInt } from "@graphprotocol/graph-ts";
import { fetchEvent } from "../../event/fetch/event";
import { updateAccountStatsForBalanceChange } from "../../stats/account-stats";
import {
  decreaseTokenBalanceFrozen,
  decreaseTokenBalanceValue,
  freezeOrUnfreezeTokenBalance,
  increaseTokenBalanceFrozen,
  increaseTokenBalanceValue,
  moveTokenBalanceToNewAccount,
} from "../../token-balance/utils/token-balance-utils";
import { fetchToken } from "../../token/fetch/token";
import { toBigDecimal } from "../../utils/token-decimals";
import { fetchTokenBalance } from "../../token-balance/fetch/token-balance";
import { fetchAccount } from "../../account/fetch/account";

export function handleAddressFrozen(event: AddressFrozen): void {
  fetchEvent(event, "AddressFrozen");
  const token = fetchToken(event.address);
  freezeOrUnfreezeTokenBalance(
    token,
    event.params.userAddress,
    event.params.isFrozen,
    event.block.timestamp
  );
}

export function handleForcedTransfer(event: ForcedTransfer): void {
  fetchEvent(event, "ForcedTransfer");
  const token = fetchToken(event.address);
  
  // Get balance states before the forced transfer
  const fromAccount = fetchAccount(event.params.from);
  const toAccount = fetchAccount(event.params.to);
  const fromBalanceBefore = fetchTokenBalance(token, fromAccount);
  const toBalanceBefore = fetchTokenBalance(token, toAccount);
  
  const fromHadBalanceBefore = fromBalanceBefore.valueExact.gt(BigInt.zero()) ? 1 : 0;
  const toHadBalanceBefore = toBalanceBefore.valueExact.gt(BigInt.zero()) ? 1 : 0;
  
  // Execute the forced transfer (same as regular transfer)
  decreaseTokenBalanceValue(
    token,
    event.params.from,
    event.params.amount,
    event.block.timestamp
  );
  increaseTokenBalanceValue(
    token,
    event.params.to,
    event.params.amount,
    event.block.timestamp
  );
  
  // Get balance states after the forced transfer
  const fromBalanceAfter = fetchTokenBalance(token, fromAccount);
  const fromHasBalanceAfter = fromBalanceAfter.valueExact.gt(BigInt.zero()) ? 1 : 0;
  const toHasBalanceAfter = 1; // After receiving transfer, always has balance
  
  // Calculate amount delta
  const amountDelta = toBigDecimal(event.params.amount, token.decimals);
  
  // Update account stats for sender (negative delta)
  updateAccountStatsForBalanceChange(
    event.params.from,
    token,
    amountDelta.neg(),
    fromHadBalanceBefore,
    fromHasBalanceAfter,
    event.block.timestamp
  );
  
  // Update account stats for receiver (positive delta)
  updateAccountStatsForBalanceChange(
    event.params.to,
    token,
    amountDelta,
    toHadBalanceBefore,
    toHasBalanceAfter,
    event.block.timestamp
  );
}

export function handleRecoverySuccess(event: RecoverySuccess): void {
  fetchEvent(event, "RecoverySuccess");
  const token = fetchToken(event.address);
  moveTokenBalanceToNewAccount(
    token,
    event.params.lostWallet,
    event.params.newWallet,
    event.block.timestamp
  );
}

export function handleTokensFrozen(event: TokensFrozen): void {
  fetchEvent(event, "TokensFrozen");
  const token = fetchToken(event.address);
  increaseTokenBalanceFrozen(
    token,
    event.params.user,
    event.params.amount,
    event.block.timestamp
  );
}

export function handleTokensUnfrozen(event: TokensUnfrozen): void {
  fetchEvent(event, "TokensUnfrozen");
  const token = fetchToken(event.address);
  decreaseTokenBalanceFrozen(
    token,
    event.params.user,
    event.params.amount,
    event.block.timestamp
  );
}
