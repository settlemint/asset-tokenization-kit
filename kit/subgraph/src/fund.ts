import { Address, log, store } from '@graphprotocol/graph-ts';
import { Account, BlockedAccount, Event_Transfer, Role } from '../generated/schema';
import {
  Approval as ApprovalEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  ManagementFeeCollected as ManagementFeeCollectedEvent,
  Paused as PausedEvent,
  PerformanceFeeCollected as PerformanceFeeCollectedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  TokenWithdrawn as TokenWithdrawnEvent,
  TokensFrozen as TokensFrozenEvent,
  TokensUnfrozen as TokensUnfrozenEvent,
  Transfer as TransferEvent,
  Unpaused as UnpausedEvent,
  UserBlocked as UserBlockedEvent,
  UserUnblocked as UserUnblockedEvent,
} from '../generated/templates/Fund/Fund';
import { fetchAccount } from './fetch/account';
import { fetchBalance } from './fetch/balance';
import { fetchFund } from './fetch/fund';
import { balanceId } from './utils/balance';
import { toDecimals } from './utils/decimals';
import { eventId } from './utils/events';
import { handleRoleAdminChangedEvent, handleRoleGrantedEvent, handleRoleRevokedEvent } from './utils/roles';
import {
  recordAccountActivityData,
  recordAssetSupplyData,
  recordFundMetricsData,
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

  let fund = fetchFund(event.address);
  let from: Account | null = null;
  let to: Account | null = null;

  let eventTransfer = new Event_Transfer(eventId(event));
  eventTransfer.emitter = fund.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.asset = fund.id;
  eventTransfer.from = event.params.from;
  eventTransfer.to = event.params.to;
  eventTransfer.valueExact = event.params.value;
  eventTransfer.value = toDecimals(eventTransfer.valueExact, fund.decimals);

  if (event.params.from.equals(Address.zero())) {
    fund.totalSupplyExact = fund.totalSupplyExact.plus(eventTransfer.valueExact);
    fund.totalSupply = toDecimals(fund.totalSupplyExact, fund.decimals);
  } else {
    from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(balanceId(fund.id, from), fund.id, from.id, fund.decimals);
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, fund.decimals);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;

    // Record account activity for sender
    recordAccountActivityData(from, fund.id, fromBalance.valueExact, fund.decimals, false);
  }

  if (event.params.to.equals(Address.zero())) {
    fund.totalSupplyExact = fund.totalSupplyExact.minus(eventTransfer.valueExact);
    fund.totalSupply = toDecimals(fund.totalSupplyExact, fund.decimals);
  } else {
    to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(fund.id, to), fund.id, to.id, fund.decimals);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, fund.decimals);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;

    // Record account activity for receiver
    recordAccountActivityData(to, fund.id, toBalance.valueExact, fund.decimals, false);
  }

  eventTransfer.save();
  fund.save();
  // Record transfer data
  recordTransferData(fund.id, eventTransfer.valueExact, fund.decimals, from, to);

  // Record supply data
  recordAssetSupplyData(fund.id, fund.totalSupplyExact, fund.decimals, 'Fund');
}

export function handlePaused(event: PausedEvent): void {
  let fund = fetchFund(event.address);
  fund.paused = true;
  fund.save();
}

export function handleUnpaused(event: UnpausedEvent): void {
  let fund = fetchFund(event.address);
  fund.paused = false;
  fund.save();
}

export function handleUserBlocked(event: UserBlockedEvent): void {
  let fund = fetchFund(event.address);
  let id = fund.id.concat(event.params.user);
  let blockedAccount = BlockedAccount.load(id);
  if (!blockedAccount) {
    blockedAccount = new BlockedAccount(id);
    blockedAccount.account = event.params.user;
    blockedAccount.asset = fund.id;
    blockedAccount.save();
  }

  let account = fetchAccount(event.params.user);
  let balance = fetchBalance(balanceId(fund.id, account), fund.id, account.id, fund.decimals);

  // Record account activity with blocked status
  recordAccountActivityData(account, fund.id, balance.valueExact, fund.decimals, true);
}

export function handleUserUnblocked(event: UserUnblockedEvent): void {
  let fund = fetchFund(event.address);
  let id = fund.id.concat(event.params.user);
  store.remove('BlockedAccount', id.toHexString());

  let account = fetchAccount(event.params.user);
  let balance = fetchBalance(balanceId(fund.id, account), fund.id, account.id, fund.decimals);

  // Record account activity with unblocked status
  recordAccountActivityData(account, fund.id, balance.valueExact, fund.decimals, false);
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let fund = fetchFund(event.address);
  handleRoleGrantedEvent(event, fund.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(fund.id, role, account, true);
  }
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let fund = fetchFund(event.address);
  handleRoleRevokedEvent(event, fund.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(fund.id, role, account, false);
  }
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let fund = fetchFund(event.address);
  handleRoleAdminChangedEvent(
    event,
    fund.id,
    event.params.role,
    event.params.newAdminRole,
    event.params.previousAdminRole
  );
}

export function handleManagementFeeCollected(event: ManagementFeeCollectedEvent): void {
  log.info('ManagementFeeCollected event received: {} {}', [
    event.params.amount.toString(),
    event.params.timestamp.toString(),
  ]);

  let fund = fetchFund(event.address);

  // Record fund metrics data
  recordFundMetricsData(fund, event.params.amount, event.params.timestamp);
}

export function handlePerformanceFeeCollected(event: PerformanceFeeCollectedEvent): void {
  log.info('PerformanceFeeCollected event received: {} {}', [
    event.params.amount.toString(),
    event.params.timestamp.toString(),
  ]);

  let fund = fetchFund(event.address);

  // Record fund metrics data
  recordFundMetricsData(fund, event.params.amount, event.params.timestamp);
}

export function handleTokenWithdrawn(event: TokenWithdrawnEvent): void {
  log.info('TokenWithdrawn event received: {} {} {}', [
    event.params.token.toHexString(),
    event.params.to.toHexString(),
    event.params.amount.toString(),
  ]);

  let fund = fetchFund(event.address);
  let account = fetchAccount(event.params.to);

  // Record account activity
  recordAccountActivityData(account, fund.id, event.params.amount, fund.decimals, false);

  // Record fund metrics
  recordFundMetricsData(fund, event.params.amount, event.block.timestamp);
}

export function handleApproval(event: ApprovalEvent): void {}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handleTokensFrozen(event: TokensFrozenEvent): void {
  let fund = fetchFund(event.address);
  recordFundMetricsData(fund, event.params.amount, event.block.timestamp);
}

export function handleTokensUnfrozen(event: TokensUnfrozenEvent): void {
  let fund = fetchFund(event.address);
  recordFundMetricsData(fund, event.params.amount, event.block.timestamp);
}
