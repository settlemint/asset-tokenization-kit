import { Address, log, store } from '@graphprotocol/graph-ts';
import { Account, BlockedAccount, Event_Transfer, Role } from '../generated/schema';
import {
  Paused as PausedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
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
import { handleRoleAdminChangedEvent, handleRoleGrantedEvent, handleRoleRevokedEvent } from './utils/roles';
import {
  recordAccountActivityData,
  recordAssetSupplyData,
  recordEquityCategoryData,
  recordRoleActivityData,
  recordTransferData,
} from './utils/timeseries';

export function handleTransfer(event: TransferEvent): void {
  log.info('Transfer event received: {} {} {} {}', [
    event.address.toHexString(),
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);

  let equity = fetchEquity(event.address);
  let from: Account | null = null;
  let to: Account | null = null;

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
    from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(balanceId(equity.id, from), equity.id, from.id);
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;

    // Record account activity for sender
    recordAccountActivityData(from, equity.id, fromBalance.valueExact, false);
  }

  if (event.params.to.equals(Address.zero())) {
    equity.totalSupplyExact = equity.totalSupplyExact.minus(eventTransfer.valueExact);
    equity.totalSupply = toDecimals(equity.totalSupplyExact);
  } else {
    to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(equity.id, to), equity.id, to.id);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;

    // Record account activity for receiver
    recordAccountActivityData(to, equity.id, toBalance.valueExact, false);
  }

  eventTransfer.save();

  // Record transfer data
  recordTransferData(equity.id, eventTransfer.valueExact, from, to);

  // Record supply data
  recordAssetSupplyData(equity.id, equity.totalSupplyExact, 'Equity');

  // Record equity category data
  recordEquityCategoryData(equity);
}

export function handlePaused(event: PausedEvent): void {
  let equity = fetchEquity(event.address);
  equity.paused = true;
  equity.save();

  recordEquityCategoryData(equity);
}

export function handleUnpaused(event: UnpausedEvent): void {
  let equity = fetchEquity(event.address);
  equity.paused = false;
  equity.save();

  recordEquityCategoryData(equity);
}

export function handleUserBlocked(event: UserBlockedEvent): void {
  let equity = fetchEquity(event.address);
  let id = equity.id.concat(event.params.user);
  let blockedAccount = BlockedAccount.load(id);
  if (!blockedAccount) {
    blockedAccount = new BlockedAccount(id);
    blockedAccount.account = event.params.user;
    blockedAccount.asset = equity.id;
    blockedAccount.save();
  }

  let account = fetchAccount(event.params.user);
  let balance = fetchBalance(balanceId(equity.id, account), equity.id, account.id);

  // Record account activity with blocked status
  recordAccountActivityData(account, equity.id, balance.valueExact, true);

  // Record category data on state change
  recordEquityCategoryData(equity);
}

export function handleUserUnblocked(event: UserUnblockedEvent): void {
  let equity = fetchEquity(event.address);
  let id = equity.id.concat(event.params.user);
  store.remove('BlockedAccount', id.toHexString());

  let account = fetchAccount(event.params.user);
  let balance = fetchBalance(balanceId(equity.id, account), equity.id, account.id);

  // Record account activity with unblocked status
  recordAccountActivityData(account, equity.id, balance.valueExact, false);

  // Record category data on state change
  recordEquityCategoryData(equity);
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let equity = fetchEquity(event.address);
  handleRoleGrantedEvent(event, equity.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(equity.id, role, account, true);
  }

  // Record category data on state change
  recordEquityCategoryData(equity);
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let equity = fetchEquity(event.address);
  handleRoleRevokedEvent(event, equity.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(equity.id, role, account, false);
  }

  // Record category data on state change
  recordEquityCategoryData(equity);
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let equity = fetchEquity(event.address);
  handleRoleAdminChangedEvent(
    event,
    equity.id,
    event.params.role,
    event.params.newAdminRole,
    event.params.previousAdminRole
  );

  // Record category data on state change
  recordEquityCategoryData(equity);
}
