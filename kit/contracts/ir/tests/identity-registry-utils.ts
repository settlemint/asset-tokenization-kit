import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  CountryUpdated,
  IdentityRegistered,
  IdentityRemoved,
  IdentityStorageSet,
  IdentityUpdated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TrustedIssuersRegistrySet
} from "../generated/IdentityRegistry/IdentityRegistry"

export function createCountryUpdatedEvent(
  sender: Address,
  _investorAddress: Address,
  _country: i32
): CountryUpdated {
  let countryUpdatedEvent = changetype<CountryUpdated>(newMockEvent())

  countryUpdatedEvent.parameters = new Array()

  countryUpdatedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  countryUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_investorAddress",
      ethereum.Value.fromAddress(_investorAddress)
    )
  )
  countryUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_country",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(_country))
    )
  )

  return countryUpdatedEvent
}

export function createIdentityRegisteredEvent(
  sender: Address,
  _investorAddress: Address,
  _identity: Address
): IdentityRegistered {
  let identityRegisteredEvent = changetype<IdentityRegistered>(newMockEvent())

  identityRegisteredEvent.parameters = new Array()

  identityRegisteredEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  identityRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "_investorAddress",
      ethereum.Value.fromAddress(_investorAddress)
    )
  )
  identityRegisteredEvent.parameters.push(
    new ethereum.EventParam("_identity", ethereum.Value.fromAddress(_identity))
  )

  return identityRegisteredEvent
}

export function createIdentityRemovedEvent(
  sender: Address,
  _investorAddress: Address,
  _identity: Address
): IdentityRemoved {
  let identityRemovedEvent = changetype<IdentityRemoved>(newMockEvent())

  identityRemovedEvent.parameters = new Array()

  identityRemovedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  identityRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "_investorAddress",
      ethereum.Value.fromAddress(_investorAddress)
    )
  )
  identityRemovedEvent.parameters.push(
    new ethereum.EventParam("_identity", ethereum.Value.fromAddress(_identity))
  )

  return identityRemovedEvent
}

export function createIdentityStorageSetEvent(
  sender: Address,
  _identityStorage: Address
): IdentityStorageSet {
  let identityStorageSetEvent = changetype<IdentityStorageSet>(newMockEvent())

  identityStorageSetEvent.parameters = new Array()

  identityStorageSetEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  identityStorageSetEvent.parameters.push(
    new ethereum.EventParam(
      "_identityStorage",
      ethereum.Value.fromAddress(_identityStorage)
    )
  )

  return identityStorageSetEvent
}

export function createIdentityUpdatedEvent(
  sender: Address,
  _oldIdentity: Address,
  _newIdentity: Address
): IdentityUpdated {
  let identityUpdatedEvent = changetype<IdentityUpdated>(newMockEvent())

  identityUpdatedEvent.parameters = new Array()

  identityUpdatedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  identityUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_oldIdentity",
      ethereum.Value.fromAddress(_oldIdentity)
    )
  )
  identityUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "_newIdentity",
      ethereum.Value.fromAddress(_newIdentity)
    )
  )

  return identityUpdatedEvent
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

export function createTrustedIssuersRegistrySetEvent(
  sender: Address,
  _trustedIssuersRegistry: Address
): TrustedIssuersRegistrySet {
  let trustedIssuersRegistrySetEvent =
    changetype<TrustedIssuersRegistrySet>(newMockEvent())

  trustedIssuersRegistrySetEvent.parameters = new Array()

  trustedIssuersRegistrySetEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  trustedIssuersRegistrySetEvent.parameters.push(
    new ethereum.EventParam(
      "_trustedIssuersRegistry",
      ethereum.Value.fromAddress(_trustedIssuersRegistry)
    )
  )

  return trustedIssuersRegistrySetEvent
}
