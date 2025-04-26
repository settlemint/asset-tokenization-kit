import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
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
} from "../generated/Vault/Vault"

export function createConfirmTransactionEvent(
  owner: Address,
  txIndex: BigInt
): ConfirmTransaction {
  let confirmTransactionEvent = changetype<ConfirmTransaction>(newMockEvent())

  confirmTransactionEvent.parameters = new Array()

  confirmTransactionEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  confirmTransactionEvent.parameters.push(
    new ethereum.EventParam(
      "txIndex",
      ethereum.Value.fromUnsignedBigInt(txIndex)
    )
  )

  return confirmTransactionEvent
}

export function createDepositEvent(
  sender: Address,
  value: BigInt,
  balance: BigInt
): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent())

  depositEvent.parameters = new Array()

  depositEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam(
      "balance",
      ethereum.Value.fromUnsignedBigInt(balance)
    )
  )

  return depositEvent
}

export function createExecuteTransactionEvent(
  executor: Address,
  txIndex: BigInt
): ExecuteTransaction {
  let executeTransactionEvent = changetype<ExecuteTransaction>(newMockEvent())

  executeTransactionEvent.parameters = new Array()

  executeTransactionEvent.parameters.push(
    new ethereum.EventParam("executor", ethereum.Value.fromAddress(executor))
  )
  executeTransactionEvent.parameters.push(
    new ethereum.EventParam(
      "txIndex",
      ethereum.Value.fromUnsignedBigInt(txIndex)
    )
  )

  return executeTransactionEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createRequirementChangedEvent(
  required: BigInt
): RequirementChanged {
  let requirementChangedEvent = changetype<RequirementChanged>(newMockEvent())

  requirementChangedEvent.parameters = new Array()

  requirementChangedEvent.parameters.push(
    new ethereum.EventParam(
      "required",
      ethereum.Value.fromUnsignedBigInt(required)
    )
  )

  return requirementChangedEvent
}

export function createRevokeConfirmationEvent(
  owner: Address,
  txIndex: BigInt
): RevokeConfirmation {
  let revokeConfirmationEvent = changetype<RevokeConfirmation>(newMockEvent())

  revokeConfirmationEvent.parameters = new Array()

  revokeConfirmationEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  revokeConfirmationEvent.parameters.push(
    new ethereum.EventParam(
      "txIndex",
      ethereum.Value.fromUnsignedBigInt(txIndex)
    )
  )

  return revokeConfirmationEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createSubmitContractCallTransactionEvent(
  owner: Address,
  txIndex: BigInt,
  target: Address,
  value: BigInt,
  selector: Bytes,
  abiEncodedArguments: Bytes,
  comment: string
): SubmitContractCallTransaction {
  let submitContractCallTransactionEvent =
    changetype<SubmitContractCallTransaction>(newMockEvent())

  submitContractCallTransactionEvent.parameters = new Array()

  submitContractCallTransactionEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  submitContractCallTransactionEvent.parameters.push(
    new ethereum.EventParam(
      "txIndex",
      ethereum.Value.fromUnsignedBigInt(txIndex)
    )
  )
  submitContractCallTransactionEvent.parameters.push(
    new ethereum.EventParam("target", ethereum.Value.fromAddress(target))
  )
  submitContractCallTransactionEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )
  submitContractCallTransactionEvent.parameters.push(
    new ethereum.EventParam("selector", ethereum.Value.fromFixedBytes(selector))
  )
  submitContractCallTransactionEvent.parameters.push(
    new ethereum.EventParam(
      "abiEncodedArguments",
      ethereum.Value.fromBytes(abiEncodedArguments)
    )
  )
  submitContractCallTransactionEvent.parameters.push(
    new ethereum.EventParam("comment", ethereum.Value.fromString(comment))
  )

  return submitContractCallTransactionEvent
}

export function createSubmitERC20TransferTransactionEvent(
  owner: Address,
  txIndex: BigInt,
  token: Address,
  to: Address,
  amount: BigInt,
  comment: string
): SubmitERC20TransferTransaction {
  let submitErc20TransferTransactionEvent =
    changetype<SubmitERC20TransferTransaction>(newMockEvent())

  submitErc20TransferTransactionEvent.parameters = new Array()

  submitErc20TransferTransactionEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  submitErc20TransferTransactionEvent.parameters.push(
    new ethereum.EventParam(
      "txIndex",
      ethereum.Value.fromUnsignedBigInt(txIndex)
    )
  )
  submitErc20TransferTransactionEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  submitErc20TransferTransactionEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  submitErc20TransferTransactionEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  submitErc20TransferTransactionEvent.parameters.push(
    new ethereum.EventParam("comment", ethereum.Value.fromString(comment))
  )

  return submitErc20TransferTransactionEvent
}

export function createSubmitTransactionEvent(
  owner: Address,
  txIndex: BigInt,
  to: Address,
  value: BigInt,
  data: Bytes,
  comment: string
): SubmitTransaction {
  let submitTransactionEvent = changetype<SubmitTransaction>(newMockEvent())

  submitTransactionEvent.parameters = new Array()

  submitTransactionEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  submitTransactionEvent.parameters.push(
    new ethereum.EventParam(
      "txIndex",
      ethereum.Value.fromUnsignedBigInt(txIndex)
    )
  )
  submitTransactionEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  submitTransactionEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )
  submitTransactionEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )
  submitTransactionEvent.parameters.push(
    new ethereum.EventParam("comment", ethereum.Value.fromString(comment))
  )

  return submitTransactionEvent
}

export function createTransactionExecutionFailedEvent(
  txIndex: BigInt,
  to: Address,
  data: Bytes
): TransactionExecutionFailed {
  let transactionExecutionFailedEvent =
    changetype<TransactionExecutionFailed>(newMockEvent())

  transactionExecutionFailedEvent.parameters = new Array()

  transactionExecutionFailedEvent.parameters.push(
    new ethereum.EventParam(
      "txIndex",
      ethereum.Value.fromUnsignedBigInt(txIndex)
    )
  )
  transactionExecutionFailedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transactionExecutionFailedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )

  return transactionExecutionFailedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
