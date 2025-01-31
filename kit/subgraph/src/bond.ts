import { Address, log, store } from '@graphprotocol/graph-ts';
import {
  Account,
  BlockedAccount,
  Event_BondRedemption,
  Event_Transfer,
  Event_UnderlyingAssetMovement,
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
import { handleAssetTransfer } from './utils/transfer';

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
  handleAssetTransfer(event, 'Bond', fetchBond, recordBondMetricsData);
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
  let eventMovement = new Event_UnderlyingAssetMovement(eventId(event));
  eventMovement.emitter = bond.id;
  eventMovement.timestamp = event.block.timestamp;
  eventMovement.action = 'TOP_UP';
  eventMovement.account = account.id;
  eventMovement.amount = event.params.amount; // Positive amount for top-up
  eventMovement.save();

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
  let eventMovement = new Event_UnderlyingAssetMovement(eventId(event));
  eventMovement.emitter = bond.id;
  eventMovement.timestamp = event.block.timestamp;
  eventMovement.action = 'WITHDRAW';
  eventMovement.account = account.id;
  eventMovement.amount = event.params.amount.neg(); // Negative amount for withdrawal
  eventMovement.save();

  // Record bond metrics
  recordBondMetricsData(bond, event.block.timestamp);
}

export function handleBondRedeemed(event: BondRedeemedEvent): void {
  let bond = fetchBond(event.address);
  let holder = fetchAccount(event.params.holder);

  // Create event record
  let eventRedeemed = new Event_BondRedemption(eventId(event));
  eventRedeemed.emitter = bond.id;
  eventRedeemed.timestamp = event.block.timestamp;
  eventRedeemed.holder = holder.id;
  eventRedeemed.bondAmount = event.params.bondAmount;
  eventRedeemed.underlyingAmount = event.params.underlyingAmount;
  eventRedeemed.save();

  // Create movement record
  let eventMovement = new Event_UnderlyingAssetMovement(eventId(event));
  eventMovement.emitter = bond.id;
  eventMovement.timestamp = event.block.timestamp;
  eventMovement.action = 'REDEEM';
  eventMovement.account = holder.id;
  eventMovement.amount = event.params.underlyingAmount.neg(); // Negative amount for redeem
  eventMovement.save();

  // Update total redeemed amount
  bond.redeemedAmount = bond.redeemedAmount.plus(event.params.bondAmount);
  // Update underlying balance
  bond.underlyingBalance = bond.underlyingBalance.minus(event.params.underlyingAmount);
  bond.save();

  // Record bond metrics
  recordBondMetricsData(bond, event.block.timestamp);
}
