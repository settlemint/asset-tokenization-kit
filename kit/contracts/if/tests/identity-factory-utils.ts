import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  IdentityCreated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenIdentityCreated
} from "../generated/IdentityFactory/IdentityFactory"

export function createIdentityCreatedEvent(
  sender: Address,
  identity: Address,
  wallet: Address
): IdentityCreated {
  let identityCreatedEvent = changetype<IdentityCreated>(newMockEvent())

  identityCreatedEvent.parameters = new Array()

  identityCreatedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  identityCreatedEvent.parameters.push(
    new ethereum.EventParam("identity", ethereum.Value.fromAddress(identity))
  )
  identityCreatedEvent.parameters.push(
    new ethereum.EventParam("wallet", ethereum.Value.fromAddress(wallet))
  )

  return identityCreatedEvent
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

export function createTokenIdentityCreatedEvent(
  sender: Address,
  identity: Address,
  token: Address
): TokenIdentityCreated {
  let tokenIdentityCreatedEvent =
    changetype<TokenIdentityCreated>(newMockEvent())

  tokenIdentityCreatedEvent.parameters = new Array()

  tokenIdentityCreatedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  tokenIdentityCreatedEvent.parameters.push(
    new ethereum.EventParam("identity", ethereum.Value.fromAddress(identity))
  )
  tokenIdentityCreatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return tokenIdentityCreatedEvent
}
