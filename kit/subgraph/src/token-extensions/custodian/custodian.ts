import {
  AddressFrozen,
  ForcedTransfer,
  RecoverySuccess,
  TokensFrozen,
  TokensUnfrozen,
} from "../../../generated/templates/Custodian/Custodian";
import { fetchEvent } from "../../event/fetch/event";
import {
  updateAccountStatsForBalanceChange,
  updateAccountStatsForTokensFrozen,
} from "../../stats/account-stats";
import { trackTokenStats } from "../../stats/token-stats";
import {
  decreaseTokenBalanceFrozen,
  decreaseTokenBalanceValue,
  freezeOrUnfreezeTokenBalance,
  increaseTokenBalanceFrozen,
  increaseTokenBalanceValue,
  moveTokenBalanceToNewAccount,
} from "../../token-balance/utils/token-balance-utils";
import { fetchToken } from "../../token/fetch/token";

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
  const eventEntry = fetchEvent(event, "ForcedTransfer");
  const token = fetchToken(event.address);

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

  const amountExact = event.params.amount;

  // Update account stats for sender (negative delta)
  updateAccountStatsForBalanceChange(
    event.params.from,
    token,
    amountExact.neg()
  );

  // Update account stats for receiver (positive delta)
  updateAccountStatsForBalanceChange(event.params.to, token, amountExact);

  // Update token stats for forced transfer
  trackTokenStats(token, eventEntry);
}

export function handleRecoverySuccess(event: RecoverySuccess): void {
  fetchEvent(event, "RecoverySuccess");
  const token = fetchToken(event.address);

  // Move token balance to new account
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

  updateAccountStatsForTokensFrozen(
    event.params.user,
    token,
    event.params.amount
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

  updateAccountStatsForTokensFrozen(
    event.params.user,
    token,
    event.params.amount.neg()
  );
}
