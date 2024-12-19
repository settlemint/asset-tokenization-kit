import { Address, log, store } from '@graphprotocol/graph-ts';
import { BlockedAccount, Event_Transfer } from '../generated/schema';
import {
  Approval as ApprovalEvent,
  BondMatured as BondMaturedEvent,
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
} from '../generated/templates/Bond/Bond';
import { fetchAccount } from './fetch/account';
import { fetchBalance } from './fetch/balance';
import { fetchBond } from './fetch/bond';
import { balanceId } from './utils/balance';
import { toDecimals } from './utils/decimals';
import { eventId } from './utils/events';
import { handleRoleAdminChangedEvent, handleRoleGrantedEvent, handleRoleRevokedEvent } from './utils/roles';

export function handleApproval(event: ApprovalEvent): void {}

export function handleBondMatured(event: BondMaturedEvent): void {
  let bond = fetchBond(event.address);
  bond.isMatured = true;
  bond.save();
}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handlePaused(event: PausedEvent): void {
  let bond = fetchBond(event.address);
  bond.paused = true;
  bond.save();
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

  let bond = fetchBond(event.address);

  let eventTransfer = new Event_Transfer(eventId(event));
  eventTransfer.emitter = bond.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.asset = bond.id;
  eventTransfer.from = bond.id;
  eventTransfer.to = bond.id;
  eventTransfer.valueExact = event.params.value;
  eventTransfer.value = toDecimals(eventTransfer.valueExact);

  if (event.params.from.equals(Address.zero())) {
    bond.totalSupplyExact = bond.totalSupplyExact.plus(eventTransfer.valueExact);
    bond.totalSupply = toDecimals(bond.totalSupplyExact);
  } else {
    let from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(balanceId(bond.id, from), bond.id, from.id);
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;
  }

  if (event.params.to.equals(Address.zero())) {
    bond.totalSupplyExact = bond.totalSupplyExact.minus(eventTransfer.valueExact);
    bond.totalSupply = toDecimals(bond.totalSupplyExact);
  } else {
    let to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(bond.id, to), bond.id, to.id);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;
  }
  eventTransfer.save();
}

export function handleUnpaused(event: UnpausedEvent): void {
  let bond = fetchBond(event.address);
  bond.paused = false;
  bond.save();
}

export function handleUserBlocked(event: UserBlockedEvent): void {
  let bond = fetchBond(event.address);
  let id = bond.id.concat(event.params.user);
  let blockedAccount = BlockedAccount.load(id);
  if (!blockedAccount) {
    blockedAccount = new BlockedAccount(id);
    blockedAccount.account = event.params.user;
    blockedAccount.asset = bond.id;
    blockedAccount.save();
  }
}

export function handleUserUnblocked(event: UserUnblockedEvent): void {
  let bond = fetchBond(event.address);
  let id = bond.id.concat(event.params.user);
  store.remove('BlockedAccount', id.toHexString());
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let bond = fetchBond(event.address);
  handleRoleGrantedEvent(event, bond.id, event.params.role, event.params.account, event.params.sender);
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let bond = fetchBond(event.address);
  handleRoleRevokedEvent(event, bond.id, event.params.role, event.params.account, event.params.sender);
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let bond = fetchBond(event.address);
  handleRoleAdminChangedEvent(
    event,
    bond.id,
    event.params.role,
    event.params.newAdminRole,
    event.params.previousAdminRole
  );
}
