import { Address, log, store } from '@graphprotocol/graph-ts';
import { Account, BlockedAccount, Event_Transfer, Role } from '../generated/schema';
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
import {
  recordAccountActivityData,
  recordAssetSupplyData,
  recordRoleActivityData,
  recordStableCoinMetricsData,
  recordTransferData,
} from './utils/timeseries';

export function handleApproval(event: ApprovalEvent): void {}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handlePaused(event: PausedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  stableCoin.paused = true;
  stableCoin.save();

  recordStableCoinMetricsData(stableCoin);
}

export function handleTokensFrozen(event: TokensFrozenEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  recordStableCoinMetricsData(stableCoin);
}

export function handleTokensUnfrozen(event: TokensUnfrozenEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  recordStableCoinMetricsData(stableCoin);
}

export function handleTransfer(event: TransferEvent): void {
  log.info('Transfer event received: {} {} {} {}', [
    event.address.toHexString(),
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);

  let stableCoin = fetchStableCoin(event.address);
  let from: Account | null = null;
  let to: Account | null = null;

  let eventTransfer = new Event_Transfer(eventId(event));
  eventTransfer.emitter = stableCoin.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.asset = stableCoin.id;
  eventTransfer.from = stableCoin.id;
  eventTransfer.to = stableCoin.id;
  eventTransfer.valueExact = event.params.value;
  eventTransfer.value = toDecimals(eventTransfer.valueExact, stableCoin.decimals);

  if (event.params.from.equals(Address.zero())) {
    stableCoin.totalSupplyExact = stableCoin.totalSupplyExact.plus(eventTransfer.valueExact);
    stableCoin.totalSupply = toDecimals(stableCoin.totalSupplyExact);
  } else {
    from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(balanceId(stableCoin.id, from), stableCoin.id, from.id);
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;

    // Record account activity for sender
    recordAccountActivityData(from, stableCoin.id, fromBalance.valueExact, false);
  }

  if (event.params.to.equals(Address.zero())) {
    stableCoin.totalSupplyExact = stableCoin.totalSupplyExact.minus(eventTransfer.valueExact);
    stableCoin.totalSupply = toDecimals(stableCoin.totalSupplyExact);
  } else {
    to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(stableCoin.id, to), stableCoin.id, to.id);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;

    // Record account activity for receiver
    recordAccountActivityData(to, stableCoin.id, toBalance.valueExact, false);
  }

  eventTransfer.save();
  stableCoin.save();

  // Record transfer data
  recordTransferData(stableCoin.id, eventTransfer.valueExact, from, to);

  // Record supply data
  recordAssetSupplyData(stableCoin.id, stableCoin.totalSupplyExact, 'StableCoin');

  // Record stablecoin metrics
  recordStableCoinMetricsData(stableCoin);
}

export function handleUnpaused(event: UnpausedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  stableCoin.paused = false;
  stableCoin.save();

  recordStableCoinMetricsData(stableCoin);
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

  let account = fetchAccount(event.params.user);
  let balance = fetchBalance(balanceId(stableCoin.id, account), stableCoin.id, account.id);

  // Record account activity with blocked status
  recordAccountActivityData(account, stableCoin.id, balance.valueExact, true);

  // Record metrics on state change
  recordStableCoinMetricsData(stableCoin);
}

export function handleUserUnblocked(event: UserUnblockedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  let id = stableCoin.id.concat(event.params.user);
  store.remove('BlockedAccount', id.toHexString());

  let account = fetchAccount(event.params.user);
  let balance = fetchBalance(balanceId(stableCoin.id, account), stableCoin.id, account.id);

  // Record account activity with unblocked status
  recordAccountActivityData(account, stableCoin.id, balance.valueExact, false);

  // Record metrics on state change
  recordStableCoinMetricsData(stableCoin);
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  handleRoleGrantedEvent(event, stableCoin.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(stableCoin.id, role, account, true);
  }
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let stableCoin = fetchStableCoin(event.address);
  handleRoleRevokedEvent(event, stableCoin.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(stableCoin.id, role, account, false);
  }
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

  // Record metrics on state change
  recordStableCoinMetricsData(stableCoin);
}
