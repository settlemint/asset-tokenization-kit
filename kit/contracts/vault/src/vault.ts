import {
  ConfirmTransaction as ConfirmTransactionEvent,
  Deposit as DepositEvent,
  ExecuteTransaction as ExecuteTransactionEvent,
  Paused as PausedEvent,
  RequirementChanged as RequirementChangedEvent,
  RevokeConfirmation as RevokeConfirmationEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  SubmitContractCallTransaction as SubmitContractCallTransactionEvent,
  SubmitERC20TransferTransaction as SubmitERC20TransferTransactionEvent,
  SubmitTransaction as SubmitTransactionEvent,
  TransactionExecutionFailed as TransactionExecutionFailedEvent,
  Unpaused as UnpausedEvent
} from "../generated/Vault/Vault"
import {
  ConfirmTransaction,
  Deposit,
  ExecuteTransaction,
  Paused,
  RequirementChanged,
  RevokeConfirmation,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SubmitContractCallTransaction,
  SubmitERC20TransferTransaction,
  SubmitTransaction,
  TransactionExecutionFailed,
  Unpaused
} from "../generated/schema"

export function handleConfirmTransaction(event: ConfirmTransactionEvent): void {
  let entity = new ConfirmTransaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.txIndex = event.params.txIndex

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDeposit(event: DepositEvent): void {
  let entity = new Deposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.value = event.params.value
  entity.balance = event.params.balance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleExecuteTransaction(event: ExecuteTransactionEvent): void {
  let entity = new ExecuteTransaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.executor = event.params.executor
  entity.txIndex = event.params.txIndex

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRequirementChanged(event: RequirementChangedEvent): void {
  let entity = new RequirementChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.required = event.params.required

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRevokeConfirmation(event: RevokeConfirmationEvent): void {
  let entity = new RevokeConfirmation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.txIndex = event.params.txIndex

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubmitContractCallTransaction(
  event: SubmitContractCallTransactionEvent
): void {
  let entity = new SubmitContractCallTransaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.txIndex = event.params.txIndex
  entity.target = event.params.target
  entity.value = event.params.value
  entity.selector = event.params.selector
  entity.abiEncodedArguments = event.params.abiEncodedArguments
  entity.comment = event.params.comment

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubmitERC20TransferTransaction(
  event: SubmitERC20TransferTransactionEvent
): void {
  let entity = new SubmitERC20TransferTransaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.txIndex = event.params.txIndex
  entity.token = event.params.token
  entity.to = event.params.to
  entity.amount = event.params.amount
  entity.comment = event.params.comment

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubmitTransaction(event: SubmitTransactionEvent): void {
  let entity = new SubmitTransaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.txIndex = event.params.txIndex
  entity.to = event.params.to
  entity.value = event.params.value
  entity.data = event.params.data
  entity.comment = event.params.comment

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransactionExecutionFailed(
  event: TransactionExecutionFailedEvent
): void {
  let entity = new TransactionExecutionFailed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.txIndex = event.params.txIndex
  entity.to = event.params.to
  entity.data = event.params.data

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
