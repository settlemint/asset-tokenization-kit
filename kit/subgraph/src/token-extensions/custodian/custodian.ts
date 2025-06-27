import type {
  AddressFrozen,
  RecoverySuccess,
  TokensFrozen,
  TokensUnfrozen,
} from '../../../generated/templates/Custodian/Custodian';
import { fetchEvent } from '../../event/fetch/event';
import { fetchToken } from '../../token/fetch/token';
import {
  decreaseTokenBalanceFrozen,
  freezeOrUnfreezeTokenBalance,
  increaseTokenBalanceFrozen,
  moveTokenBalanceToNewAccount,
} from '../../token-balance/utils/token-balance-utils';

export function handleAddressFrozen(event: AddressFrozen): void {
  fetchEvent(event, 'AddressFrozen');
  const token = fetchToken(event.address);
  freezeOrUnfreezeTokenBalance(
    token,
    event.params.userAddress,
    event.params.isFrozen,
    event.block.timestamp
  );
}

export function handleRecoverySuccess(event: RecoverySuccess): void {
  fetchEvent(event, 'RecoverySuccess');
  const token = fetchToken(event.address);
  moveTokenBalanceToNewAccount(
    token,
    event.params.lostWallet,
    event.params.newWallet,
    event.block.timestamp
  );
}

export function handleTokensFrozen(event: TokensFrozen): void {
  fetchEvent(event, 'TokensFrozen');
  const token = fetchToken(event.address);
  increaseTokenBalanceFrozen(
    token,
    event.params.user,
    event.params.amount,
    event.block.timestamp
  );
}

export function handleTokensUnfrozen(event: TokensUnfrozen): void {
  fetchEvent(event, 'TokensUnfrozen');
  const token = fetchToken(event.address);
  decreaseTokenBalanceFrozen(
    token,
    event.params.user,
    event.params.amount,
    event.block.timestamp
  );
}
