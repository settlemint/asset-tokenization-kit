import { Address, log, store } from '@graphprotocol/graph-ts';
import {
  Account,
  BlockedAccount,
  Event_BondRedeemed,
  Event_Transfer,
  Event_UnderlyingAssetTransfer,
  Role,
} from '../generated/schema';
import {
  Approval as ApprovalEvent,
  BondMatured as BondMaturedEvent,
  BondRedeemed as BondRedeemedEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  Paused as PausedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  TokensFrozen as TokensFrozenEvent,
  TokensUnfrozen as TokensUnfrozenEvent,
  Transfer as TransferEvent,
  UnderlyingAssetTopUp as UnderlyingAssetTopUpEvent,
  UnderlyingAssetWithdrawn as UnderlyingAssetWithdrawnEvent,
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
import {
  recordAccountActivityData,
  recordAssetSupplyData,
  recordBondMetricsData,
  recordRoleActivityData,
  recordTransferData,
} from './utils/timeseries';

export function handleApproval(event: ApprovalEvent): void {}

export function handleBondMatured(event: BondMaturedEvent): void {
  let bond = fetchBond(event.address);
  bond.isMatured = true;
  bond.save();

  recordBondMetricsData(bond, event.block.timestamp);
}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handlePaused(event: PausedEvent): void {
  let bond = fetchBond(event.address);
  bond.paused = true;
  bond.save();

  recordBondMetricsData(bond, event.block.timestamp);
}

export function handleTokensFrozen(event: TokensFrozenEvent): void {
  let bond = fetchBond(event.address);
  recordBondMetricsData(bond, event.block.timestamp);
}

export function handleTokensUnfrozen(event: TokensUnfrozenEvent): void {
  let bond = fetchBond(event.address);
  recordBondMetricsData(bond, event.block.timestamp);
}

export function handleTransfer(event: TransferEvent): void {
  log.info('Transfer event received: {} {} {} {}', [
    event.address.toHexString(),
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);

  let bond = fetchBond(event.address);
  let from: Account | null = null;
  let to: Account | null = null;

  let eventTransfer = new Event_Transfer(eventId(event));
  eventTransfer.emitter = bond.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.asset = bond.id;
  eventTransfer.from = bond.id;
  eventTransfer.to = bond.id;
  eventTransfer.valueExact = event.params.value;
  eventTransfer.value = toDecimals(eventTransfer.valueExact, bond.decimals);

  if (event.params.from.equals(Address.zero())) {
    bond.totalSupplyExact = bond.totalSupplyExact.plus(eventTransfer.valueExact);
    bond.totalSupply = toDecimals(bond.totalSupplyExact, bond.decimals);
  } else {
    from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(balanceId(bond.id, from), bond.id, from.id, bond.decimals);
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, bond.decimals);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;

    // Record account activity for sender
    recordAccountActivityData(from, bond.id, fromBalance.valueExact, bond.decimals, false);
  }

  if (event.params.to.equals(Address.zero())) {
    bond.totalSupplyExact = bond.totalSupplyExact.minus(eventTransfer.valueExact);
    bond.totalSupply = toDecimals(bond.totalSupplyExact, bond.decimals);
  } else {
    to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(bond.id, to), bond.id, to.id, bond.decimals);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, bond.decimals);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;

    // Record account activity for receiver
    recordAccountActivityData(to, bond.id, toBalance.valueExact, bond.decimals, false);
  }

  eventTransfer.save();

  // Record transfer data
  recordTransferData(bond.id, eventTransfer.valueExact, bond.decimals, from, to);

  // Record supply data
  recordAssetSupplyData(bond.id, bond.totalSupplyExact, bond.decimals, 'Bond');

  // Record bond metrics
  recordBondMetricsData(bond, event.block.timestamp);
}

export function handleUnpaused(event: UnpausedEvent): void {
  let bond = fetchBond(event.address);
  bond.paused = false;
  bond.save();

  recordBondMetricsData(bond, event.block.timestamp);
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

  let account = fetchAccount(event.params.user);
  let balance = fetchBalance(balanceId(bond.id, account), bond.id, account.id, bond.decimals);

  // Record account activity with blocked status
  recordAccountActivityData(account, bond.id, balance.valueExact, bond.decimals, true);
}

export function handleUserUnblocked(event: UserUnblockedEvent): void {
  let bond = fetchBond(event.address);
  let id = bond.id.concat(event.params.user);
  store.remove('BlockedAccount', id.toHexString());

  let account = fetchAccount(event.params.user);
  let balance = fetchBalance(balanceId(bond.id, account), bond.id, account.id, bond.decimals);

  // Record account activity with unblocked status
  recordAccountActivityData(account, bond.id, balance.valueExact, bond.decimals, false);
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let bond = fetchBond(event.address);
  handleRoleGrantedEvent(event, bond.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(bond.id, role, account, true);
  }
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let bond = fetchBond(event.address);
  handleRoleRevokedEvent(event, bond.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(bond.id, role, account, false);
  }
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
  recordBondMetricsData(bond, event.block.timestamp);
}

export function handleUnderlyingAssetTopUp(event: UnderlyingAssetTopUpEvent): void {
  let bond = fetchBond(event.address);
  let account = fetchAccount(event.params.from);

  // Update underlying balance
  bond.underlyingBalance = bond.underlyingBalance.plus(event.params.amount);
  bond.save();

  // Create event record
  let eventTransfer = new Event_UnderlyingAssetTransfer(eventId(event));
  eventTransfer.emitter = bond.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.account = account.id;
  eventTransfer.amount = event.params.amount; // Positive amount for top-up
  eventTransfer.save();

  // Record bond metrics
  recordBondMetricsData(bond, event.block.timestamp);
}

export function handleUnderlyingAssetWithdrawn(event: UnderlyingAssetWithdrawnEvent): void {
  let bond = fetchBond(event.address);
  let account = fetchAccount(event.params.to);

  // Update underlying balance
  bond.underlyingBalance = bond.underlyingBalance.minus(event.params.amount);
  bond.save();

  // Create event record
  let eventTransfer = new Event_UnderlyingAssetTransfer(eventId(event));
  eventTransfer.emitter = bond.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.account = account.id;
  eventTransfer.amount = event.params.amount.neg(); // Negative amount for withdrawal
  eventTransfer.save();

  // Record bond metrics
  recordBondMetricsData(bond, event.block.timestamp);
}

export function handleBondRedeemed(event: BondRedeemedEvent): void {
  let bond = fetchBond(event.address);
  let holder = fetchAccount(event.params.holder);

  // Update total redeemed amount
  bond.redeemedAmount = bond.redeemedAmount.plus(event.params.bondAmount);
  // Update underlying balance
  bond.underlyingBalance = bond.underlyingBalance.minus(event.params.underlyingAmount);
  bond.save();

  // Create event record
  let eventRedeemed = new Event_BondRedeemed(eventId(event));
  eventRedeemed.emitter = bond.id;
  eventRedeemed.timestamp = event.block.timestamp;
  eventRedeemed.holder = holder.id;
  eventRedeemed.bondAmount = event.params.bondAmount;
  eventRedeemed.underlyingAmount = event.params.underlyingAmount;
  eventRedeemed.save();

  // Record bond metrics
  recordBondMetricsData(bond, event.block.timestamp);
}
