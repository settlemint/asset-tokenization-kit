import { Address, log } from '@graphprotocol/graph-ts';
import { Event_Transfer } from '../generated/schema';
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

  let eventTransfer = new Event_Transfer(eventId(event));
  eventTransfer.emitter = cryptoCurrency.id;
  eventTransfer.timestamp = event.block.timestamp;
  eventTransfer.asset = cryptoCurrency.id;
  eventTransfer.from = cryptoCurrency.id;
  eventTransfer.to = cryptoCurrency.id;
  eventTransfer.valueExact = event.params.value;
  eventTransfer.value = toDecimals(eventTransfer.valueExact);

  if (event.params.from.equals(Address.zero())) {
    cryptoCurrency.totalSupplyExact = cryptoCurrency.totalSupplyExact.plus(eventTransfer.valueExact);
    cryptoCurrency.totalSupply = toDecimals(cryptoCurrency.totalSupplyExact);
  } else {
    let from = fetchAccount(event.params.from);
    let fromBalance = fetchBalance(balanceId(cryptoCurrency.id, from), cryptoCurrency.id, from.id);
    fromBalance.valueExact = fromBalance.valueExact.minus(eventTransfer.valueExact);
    fromBalance.value = toDecimals(fromBalance.valueExact);
    fromBalance.save();

    eventTransfer.from = from.id;
    eventTransfer.fromBalance = fromBalance.id;
  }

  if (event.params.to.equals(Address.zero())) {
    cryptoCurrency.totalSupplyExact = cryptoCurrency.totalSupplyExact.minus(eventTransfer.valueExact);
    cryptoCurrency.totalSupply = toDecimals(cryptoCurrency.totalSupplyExact);
  } else {
    let to = fetchAccount(event.params.to);
    let toBalance = fetchBalance(balanceId(cryptoCurrency.id, to), cryptoCurrency.id, to.id);
    toBalance.valueExact = toBalance.valueExact.plus(eventTransfer.valueExact);
    toBalance.value = toDecimals(toBalance.valueExact);
    toBalance.save();

    eventTransfer.to = to.id;
    eventTransfer.toBalance = toBalance.id;
  }
  eventTransfer.save();
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let cryptoCurrency = fetchCryptoCurrency(event.address);
  handleRoleGrantedEvent(event, cryptoCurrency.id, event.params.role, event.params.account, event.params.sender);
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let cryptoCurrency = fetchCryptoCurrency(event.address);
  handleRoleRevokedEvent(event, cryptoCurrency.id, event.params.role, event.params.account, event.params.sender);
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
