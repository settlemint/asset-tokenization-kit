import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  ClaimTopicsUpdated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TrustedIssuerAdded,
  TrustedIssuerRemoved
} from "../generated/TrustedIssuersRegistry/TrustedIssuersRegistry"

export function createClaimTopicsUpdatedEvent(
  sender: Address,
  _issuer: Address,
  _claimTopics: Array<BigInt>
): ClaimTopicsUpdated {
  let claimTopicsUpdatedEvent = changetype<ClaimTopicsUpdated>(newMockEvent())

  claimTopicsUpdatedEvent.parameters = new Array()

  claimTopicsUpdatedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  claimTopicsUpdatedEvent.parameters.push(
    new ethereum.EventParam("_issuer", ethereum.Value.fromAddress(_issuer))
  )
  claimTopicsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_claimTopics",
      ethereum.Value.fromUnsignedBigIntArray(_claimTopics)
    )
  )

  return claimTopicsUpdatedEvent
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

export function createTrustedIssuerAddedEvent(
  sender: Address,
  _issuer: Address,
  _claimTopics: Array<BigInt>
): TrustedIssuerAdded {
  let trustedIssuerAddedEvent = changetype<TrustedIssuerAdded>(newMockEvent())

  trustedIssuerAddedEvent.parameters = new Array()

  trustedIssuerAddedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  trustedIssuerAddedEvent.parameters.push(
    new ethereum.EventParam("_issuer", ethereum.Value.fromAddress(_issuer))
  )
  trustedIssuerAddedEvent.parameters.push(
    new ethereum.EventParam(
      "_claimTopics",
      ethereum.Value.fromUnsignedBigIntArray(_claimTopics)
    )
  )

  return trustedIssuerAddedEvent
}

export function createTrustedIssuerRemovedEvent(
  sender: Address,
  _issuer: Address
): TrustedIssuerRemoved {
  let trustedIssuerRemovedEvent =
    changetype<TrustedIssuerRemoved>(newMockEvent())

  trustedIssuerRemovedEvent.parameters = new Array()

  trustedIssuerRemovedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  trustedIssuerRemovedEvent.parameters.push(
    new ethereum.EventParam("_issuer", ethereum.Value.fromAddress(_issuer))
  )

  return trustedIssuerRemovedEvent
}
