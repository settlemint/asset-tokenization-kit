import { Address, log } from '@graphprotocol/graph-ts';
import { Account, Event_Transfer, Role } from '../generated/schema';
import {
  Approval as ApprovalEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Transfer as TransferEvent,
} from '../generated/templates/CryptoCurrency/CryptoCurrency';
import { fetchAccount } from './fetch/account';
import { fetchBalance } from './fetch/balance';
import { fetchCryptoCurrency } from './fetch/crypto-currency';
import { balanceId } from './utils/balance';
import { toDecimals } from './utils/decimals';
import { eventId } from './utils/events';
import { handleRoleAdminChangedEvent, handleRoleGrantedEvent, handleRoleRevokedEvent } from './utils/roles';
import {
  recordAccountActivityData,
  recordAssetSupplyData,
  recordRoleActivityData,
  recordTransferData,
} from './utils/timeseries';
import { handleAssetTransfer } from './utils/transfer';

export function handleApproval(event: ApprovalEvent): void {}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handleTransfer(event: TransferEvent): void {
  handleAssetTransfer(event, 'CryptoCurrency', fetchCryptoCurrency);
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let cryptoCurrency = fetchCryptoCurrency(event.address);
  handleRoleGrantedEvent(event, cryptoCurrency.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(cryptoCurrency.id, role, account, true);
  }
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let cryptoCurrency = fetchCryptoCurrency(event.address);
  handleRoleRevokedEvent(event, cryptoCurrency.id, event.params.role, event.params.account, event.params.sender);

  // Record role activity
  let account = fetchAccount(event.params.account);
  let role = Role.load(event.params.role);
  if (role) {
    recordRoleActivityData(cryptoCurrency.id, role, account, false);
  }
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let cryptoCurrency = fetchCryptoCurrency(event.address);
  handleRoleAdminChangedEvent(
    event,
    cryptoCurrency.id,
    event.params.role,
    event.params.newAdminRole,
    event.params.previousAdminRole
  );
}
