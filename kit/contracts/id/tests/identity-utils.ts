import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Bytes, Address } from "@graphprotocol/graph-ts"
import {
  Approved,
  ClaimAdded,
  ClaimChanged,
  ClaimRemoved,
  Executed,
  ExecutionFailed,
  ExecutionRequested,
  Initialized,
  KeyAdded,
  KeyRemoved
} from "../generated/Identity/Identity"

export function createApprovedEvent(
  executionId: BigInt,
  approved: boolean
): Approved {
  let approvedEvent = changetype<Approved>(newMockEvent())

  approvedEvent.parameters = new Array()

  approvedEvent.parameters.push(
    new ethereum.EventParam(
      "executionId",
      ethereum.Value.fromUnsignedBigInt(executionId)
    )
  )
  approvedEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvedEvent
}

export function createClaimAddedEvent(
  claimId: Bytes,
  topic: BigInt,
  scheme: BigInt,
  issuer: Address,
  signature: Bytes,
  data: Bytes,
  uri: string
): ClaimAdded {
  let claimAddedEvent = changetype<ClaimAdded>(newMockEvent())

  claimAddedEvent.parameters = new Array()

  claimAddedEvent.parameters.push(
    new ethereum.EventParam("claimId", ethereum.Value.fromFixedBytes(claimId))
  )
  claimAddedEvent.parameters.push(
    new ethereum.EventParam("topic", ethereum.Value.fromUnsignedBigInt(topic))
  )
  claimAddedEvent.parameters.push(
    new ethereum.EventParam("scheme", ethereum.Value.fromUnsignedBigInt(scheme))
  )
  claimAddedEvent.parameters.push(
    new ethereum.EventParam("issuer", ethereum.Value.fromAddress(issuer))
  )
  claimAddedEvent.parameters.push(
    new ethereum.EventParam("signature", ethereum.Value.fromBytes(signature))
  )
  claimAddedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )
  claimAddedEvent.parameters.push(
    new ethereum.EventParam("uri", ethereum.Value.fromString(uri))
  )

  return claimAddedEvent
}

export function createClaimChangedEvent(
  claimId: Bytes,
  topic: BigInt,
  scheme: BigInt,
  issuer: Address,
  signature: Bytes,
  data: Bytes,
  uri: string
): ClaimChanged {
  let claimChangedEvent = changetype<ClaimChanged>(newMockEvent())

  claimChangedEvent.parameters = new Array()

  claimChangedEvent.parameters.push(
    new ethereum.EventParam("claimId", ethereum.Value.fromFixedBytes(claimId))
  )
  claimChangedEvent.parameters.push(
    new ethereum.EventParam("topic", ethereum.Value.fromUnsignedBigInt(topic))
  )
  claimChangedEvent.parameters.push(
    new ethereum.EventParam("scheme", ethereum.Value.fromUnsignedBigInt(scheme))
  )
  claimChangedEvent.parameters.push(
    new ethereum.EventParam("issuer", ethereum.Value.fromAddress(issuer))
  )
  claimChangedEvent.parameters.push(
    new ethereum.EventParam("signature", ethereum.Value.fromBytes(signature))
  )
  claimChangedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )
  claimChangedEvent.parameters.push(
    new ethereum.EventParam("uri", ethereum.Value.fromString(uri))
  )

  return claimChangedEvent
}

export function createClaimRemovedEvent(
  claimId: Bytes,
  topic: BigInt,
  scheme: BigInt,
  issuer: Address,
  signature: Bytes,
  data: Bytes,
  uri: string
): ClaimRemoved {
  let claimRemovedEvent = changetype<ClaimRemoved>(newMockEvent())

  claimRemovedEvent.parameters = new Array()

  claimRemovedEvent.parameters.push(
    new ethereum.EventParam("claimId", ethereum.Value.fromFixedBytes(claimId))
  )
  claimRemovedEvent.parameters.push(
    new ethereum.EventParam("topic", ethereum.Value.fromUnsignedBigInt(topic))
  )
  claimRemovedEvent.parameters.push(
    new ethereum.EventParam("scheme", ethereum.Value.fromUnsignedBigInt(scheme))
  )
  claimRemovedEvent.parameters.push(
    new ethereum.EventParam("issuer", ethereum.Value.fromAddress(issuer))
  )
  claimRemovedEvent.parameters.push(
    new ethereum.EventParam("signature", ethereum.Value.fromBytes(signature))
  )
  claimRemovedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )
  claimRemovedEvent.parameters.push(
    new ethereum.EventParam("uri", ethereum.Value.fromString(uri))
  )

  return claimRemovedEvent
}

export function createExecutedEvent(
  executionId: BigInt,
  to: Address,
  value: BigInt,
  data: Bytes
): Executed {
  let executedEvent = changetype<Executed>(newMockEvent())

  executedEvent.parameters = new Array()

  executedEvent.parameters.push(
    new ethereum.EventParam(
      "executionId",
      ethereum.Value.fromUnsignedBigInt(executionId)
    )
  )
  executedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  executedEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )
  executedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )

  return executedEvent
}

export function createExecutionFailedEvent(
  executionId: BigInt,
  to: Address,
  value: BigInt,
  data: Bytes
): ExecutionFailed {
  let executionFailedEvent = changetype<ExecutionFailed>(newMockEvent())

  executionFailedEvent.parameters = new Array()

  executionFailedEvent.parameters.push(
    new ethereum.EventParam(
      "executionId",
      ethereum.Value.fromUnsignedBigInt(executionId)
    )
  )
  executionFailedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  executionFailedEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )
  executionFailedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )

  return executionFailedEvent
}

export function createExecutionRequestedEvent(
  executionId: BigInt,
  to: Address,
  value: BigInt,
  data: Bytes
): ExecutionRequested {
  let executionRequestedEvent = changetype<ExecutionRequested>(newMockEvent())

  executionRequestedEvent.parameters = new Array()

  executionRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "executionId",
      ethereum.Value.fromUnsignedBigInt(executionId)
    )
  )
  executionRequestedEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  executionRequestedEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )
  executionRequestedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromBytes(data))
  )

  return executionRequestedEvent
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createKeyAddedEvent(
  key: Bytes,
  purpose: BigInt,
  keyType: BigInt
): KeyAdded {
  let keyAddedEvent = changetype<KeyAdded>(newMockEvent())

  keyAddedEvent.parameters = new Array()

  keyAddedEvent.parameters.push(
    new ethereum.EventParam("key", ethereum.Value.fromFixedBytes(key))
  )
  keyAddedEvent.parameters.push(
    new ethereum.EventParam(
      "purpose",
      ethereum.Value.fromUnsignedBigInt(purpose)
    )
  )
  keyAddedEvent.parameters.push(
    new ethereum.EventParam(
      "keyType",
      ethereum.Value.fromUnsignedBigInt(keyType)
    )
  )

  return keyAddedEvent
}

export function createKeyRemovedEvent(
  key: Bytes,
  purpose: BigInt,
  keyType: BigInt
): KeyRemoved {
  let keyRemovedEvent = changetype<KeyRemoved>(newMockEvent())

  keyRemovedEvent.parameters = new Array()

  keyRemovedEvent.parameters.push(
    new ethereum.EventParam("key", ethereum.Value.fromFixedBytes(key))
  )
  keyRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "purpose",
      ethereum.Value.fromUnsignedBigInt(purpose)
    )
  )
  keyRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "keyType",
      ethereum.Value.fromUnsignedBigInt(keyType)
    )
  )

  return keyRemovedEvent
}
