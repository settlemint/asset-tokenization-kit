import { Address, log, store } from '@graphprotocol/graph-ts';
import { BlockedAccount, Event_Transfer } from '../generated/schema';
import {
  Approval as ApprovalEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  Paused as PausedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  TokensFrozen as TokensFrozenEvent,
  TokensUnfrozen as TokensUnfrozenEvent,
  Transfer as TransferEvent,
  Unpaused as UnpausedEvent,
  UserBlocked as UserBlockedEvent,
  UserUnblocked as UserUnblockedEvent,
} from '../generated/templates/StableCoin/StableCoin';
import { fetchAccount } from './fetch/account';
import { fetchBalance } from './fetch/balance';
import { fetchStableCoin } from './fetch/stable-coin';
import { balanceId } from './utils/balance';
import { toDecimals } from './utils/decimals';
import { eventId } from './utils/events';
import { handleRoleAdminChangedEvent, handleRoleGrantedEvent, handleRoleRevokedEvent } from './utils/roles';

export function handleApproval(event: ApprovalEvent): void {}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handlePaused(event: PausedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  stableCoin.paused = true;
  stableCoin.save();
}

export function handleTokensFrozen(event: TokensFrozenEvent): void {}

export function handleTokensUnfrozen(event: TokensUnfrozenEvent): void {}

export function handleTransfer(event: TransferEvent): void {
  log.info('Transfer event received: {} {} {} {}', [
    event.address.toHexString(),
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);

  let stableCoin = fetchStableCoin(event.address);

  let eventTransfer = new Event_Transfer(eventId(event));
  eventTransfer.emitter = stableCoin.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.asset = stableCoin.id;
  eventTransfer.from = stableCoin.id;
  eventTransfer.to = stableCoin.id;
  eventTransfer.valueExact = event.params.value;
  eventTransfer.value = toDecimals(eventTransfer.valueExact);

  if (event.params.from.equals(Address.zero())) {
    stableCoin.totalSupplyExact = stableCoin.totalSupplyExact.plus(eventTransfer.valueExact);
    stableCoin.totalSupply = toDecimals(stableCoin.totalSupplyExact);
  } else {
    let from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(balanceId(stableCoin.id, from), stableCoin.id, from.id);
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;
  }

  if (event.params.to.equals(Address.zero())) {
    stableCoin.totalSupplyExact = stableCoin.totalSupplyExact.minus(eventTransfer.valueExact);
    stableCoin.totalSupply = toDecimals(stableCoin.totalSupplyExact);
  } else {
    let to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(stableCoin.id, to), stableCoin.id, to.id);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;
  }
  eventTransfer.save();
}

export function handleUnpaused(event: UnpausedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  stableCoin.paused = false;
  stableCoin.save();
}

export function handleUserBlocked(event: UserBlockedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  let id = stableCoin.id.concat(event.params.user);
  let blockedAccount = BlockedAccount.load(id);
  if (!blockedAccount) {
    blockedAccount = new BlockedAccount(id);
    blockedAccount.account = event.params.user;
    blockedAccount.asset = stableCoin.id;
    blockedAccount.save();
  }
}

export function handleUserUnblocked(event: UserUnblockedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  let id = stableCoin.id.concat(event.params.user);
  store.remove('BlockedAccount', id.toHexString());
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  handleRoleGrantedEvent(event, stableCoin.id, event.params.role, event.params.account, event.params.sender);
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  handleRoleRevokedEvent(event, stableCoin.id, event.params.role, event.params.account, event.params.sender);
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  handleRoleAdminChangedEvent(
    event,
    stableCoin.id,
    event.params.role,
    event.params.newAdminRole,
    event.params.previousAdminRole
  );
}
