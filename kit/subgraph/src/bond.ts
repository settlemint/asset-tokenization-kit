import {
  Approval as ApprovalEvent,
  BondMatured as BondMaturedEvent,
  EIP712DomainChanged as EIP712DomainChangedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Paused as PausedEvent,
  TokensFrozen as TokensFrozenEvent,
  TokensUnfrozen as TokensUnfrozenEvent,
  Transfer as TransferEvent,
  Unpaused as UnpausedEvent,
  UserBlocked as UserBlockedEvent,
  UserUnblocked as UserUnblockedEvent,
} from '../generated/templates/Bond/Bond';

export function handleApproval(event: ApprovalEvent): void {}

export function handleBondMatured(event: BondMaturedEvent): void {}

export function handleEIP712DomainChanged(event: EIP712DomainChangedEvent): void {}

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {}

export function handlePaused(event: PausedEvent): void {}

export function handleTokensFrozen(event: TokensFrozenEvent): void {}

export function handleTokensUnfrozen(event: TokensUnfrozenEvent): void {}

export function handleTransfer(event: TransferEvent): void {}

export function handleUnpaused(event: UnpausedEvent): void {}

export function handleUserBlocked(event: UserBlockedEvent): void {}

export function handleUserUnblocked(event: UserUnblockedEvent): void {}
