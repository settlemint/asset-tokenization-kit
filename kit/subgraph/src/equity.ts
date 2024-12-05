import { Address, log } from '@graphprotocol/graph-ts';
import { Event_Transfer } from '../generated/schema';
import {
  Approval as ApprovalEvent,
  DelegateChanged as DelegateChangedEvent,
  DelegateVotesChanged as DelegateVotesChangedEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  TokensFrozen as TokensFrozenEvent,
  TokensUnfrozen as TokensUnfrozenEvent,
  Transfer as TransferEvent,
  Unpaused as UnpausedEvent,
  UserBlocked as UserBlockedEvent,
  UserUnblocked as UserUnblockedEvent,
} from '../generated/templates/Equity/Equity';
import { fetchAccount } from './fetch/account';
import { fetchBalance } from './fetch/balance';
import { fetchEquity } from './fetch/equity';
import { balanceId } from './utils/balance';
import { toDecimals } from './utils/decimals';
import { eventId } from './utils/events';

export function handleApproval(event: ApprovalEvent): void {}

export function handleDelegateChanged(event: DelegateChangedEvent): void {}

export function handleDelegateVotesChanged(event: DelegateVotesChangedEvent): void {}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {}

export function handlePaused(event: PausedEvent): void {}

export function handleTokensFrozen(event: TokensFrozenEvent): void {}

export function handleTokensUnfrozen(event: TokensUnfrozenEvent): void {}

export function handleTransfer(event: TransferEvent): void {
  log.info('Transfer event received: {} {} {} {}', [
    event.address.toHexString(),
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);

  let equity = fetchEquity(event.address);

  let eventTransfer = new Event_Transfer(eventId(event));
  eventTransfer.emitter = equity.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.asset = equity.id;
  eventTransfer.from = equity.id;
  eventTransfer.to = equity.id;
  eventTransfer.valueExact = event.params.value;
  eventTransfer.value = toDecimals(eventTransfer.valueExact);

  if (event.params.from.equals(Address.zero())) {
    equity.totalSupplyExact = equity.totalSupplyExact.plus(eventTransfer.valueExact);
    equity.totalSupply = toDecimals(equity.totalSupplyExact);
  } else {
    let from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(balanceId(equity.id, from), equity.id, from.id);
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;
  }

  if (event.params.to.equals(Address.zero())) {
    equity.totalSupplyExact = equity.totalSupplyExact.minus(eventTransfer.valueExact);
    equity.totalSupply = toDecimals(equity.totalSupplyExact);
  } else {
    let to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(equity.id, to), equity.id, to.id);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;
  }
  eventTransfer.save();
}

export function handleUnpaused(event: UnpausedEvent): void {}

export function handleUserBlocked(event: UserBlockedEvent): void {}

export function handleUserUnblocked(event: UserUnblockedEvent): void {}
