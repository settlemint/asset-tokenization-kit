import {
  Approval as ApprovalEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
} from '../generated/templates/CryptoCurrency/CryptoCurrency';

export function handleApproval(event: ApprovalEvent): void {}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {}

export function handleTransfer(event: TransferEvent): void {}
