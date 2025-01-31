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
import { handleAssetTransfer } from './utils/transfer';

export function handleTransfer(event: TransferEvent): void {
  handleAssetTransfer(event, 'Equity', fetchEquity, recordEquityCategoryData);
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
  let balance = fetchBalance(balanceId(equity.id, account), equity.id, account.id, equity.decimals);

  // Record account activity with blocked status
  recordAccountActivityData(account, equity.id, balance.valueExact, equity.decimals, true);

  // Record category data on state change
  recordEquityCategoryData(equity);
}

export function handleUserUnblocked(event: UserUnblockedEvent): void {
  let equity = fetchEquity(event.address);
  let id = equity.id.concat(event.params.user);
  store.remove('BlockedAccount', id.toHexString());

  let account = fetchAccount(event.params.user);
  let balance = fetchBalance(balanceId(equity.id, account), equity.id, account.id, equity.decimals);

  // Record account activity with unblocked status
  recordAccountActivityData(account, equity.id, balance.valueExact, equity.decimals, false);

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
