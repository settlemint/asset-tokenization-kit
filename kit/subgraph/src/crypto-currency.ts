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

export function handleApproval(event: ApprovalEvent): void {}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handleTransfer(event: TransferEvent): void {
  log.info('Transfer event received: {} {} {} {}', [
    event.address.toHexString(),
    event.params.from.toHexString(),
    event.params.to.toHexString(),
    event.params.value.toString(),
  ]);

  let cryptoCurrency = fetchCryptoCurrency(event.address);
  let from: Account | null = null;
  let to: Account | null = null;

  let eventTransfer = new Event_Transfer(eventId(event));
  eventTransfer.emitter = cryptoCurrency.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.asset = cryptoCurrency.id;
  eventTransfer.from = cryptoCurrency.id;
  eventTransfer.to = cryptoCurrency.id;
  eventTransfer.valueExact = event.params.value;
  eventTransfer.value = toDecimals(eventTransfer.valueExact, cryptoCurrency.decimals);

  if (event.params.from.equals(Address.zero())) {
    cryptoCurrency.totalSupplyExact = cryptoCurrency.totalSupplyExact.plus(eventTransfer.valueExact);
    cryptoCurrency.totalSupply = toDecimals(cryptoCurrency.totalSupplyExact, cryptoCurrency.decimals);
  } else {
    from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(
      balanceId(cryptoCurrency.id, from),
      cryptoCurrency.id,
      from.id,
      cryptoCurrency.decimals
    );
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact, cryptoCurrency.decimals);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;

    // Record account activity for sender
    recordAccountActivityData(from, cryptoCurrency.id, fromBalance.valueExact, cryptoCurrency.decimals, false);
  }

  if (event.params.to.equals(Address.zero())) {
    cryptoCurrency.totalSupplyExact = cryptoCurrency.totalSupplyExact.minus(eventTransfer.valueExact);
    cryptoCurrency.totalSupply = toDecimals(cryptoCurrency.totalSupplyExact, cryptoCurrency.decimals);
  } else {
    to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(cryptoCurrency.id, to), cryptoCurrency.id, to.id, cryptoCurrency.decimals);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact, cryptoCurrency.decimals);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;

    // Record account activity for receiver
    recordAccountActivityData(to, cryptoCurrency.id, toBalance.valueExact, cryptoCurrency.decimals, false);
  }

  eventTransfer.save();

  // Record transfer data
  recordTransferData(cryptoCurrency.id, eventTransfer.valueExact, cryptoCurrency.decimals, from, to);

  // Record supply data
  recordAssetSupplyData(cryptoCurrency.id, cryptoCurrency.totalSupplyExact, cryptoCurrency.decimals, 'CryptoCurrency');
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
