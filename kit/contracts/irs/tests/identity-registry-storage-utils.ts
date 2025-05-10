import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  CountryModified,
  DefaultAdminDelayChangeCanceled,
  DefaultAdminDelayChangeScheduled,
  DefaultAdminTransferCanceled,
  DefaultAdminTransferScheduled,
  IdentityModified,
  IdentityRegistryBound,
  IdentityRegistryUnbound,
  IdentityStored,
  IdentityUnstored,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Upgraded
} from "../generated/IdentityRegistryStorage/IdentityRegistryStorage"

export function createCountryModifiedEvent(
  _identityWallet: Address,
  _country: i32
): CountryModified {
  let countryModifiedEvent = changetype<CountryModified>(newMockEvent())

  countryModifiedEvent.parameters = new Array()

  countryModifiedEvent.parameters.push(
    new ethereum.EventParam(
      "_identityWallet",
      ethereum.Value.fromAddress(_identityWallet)
    )
  )
  countryModifiedEvent.parameters.push(
    new ethereum.EventParam(
      "_country",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(_country))
    )
  )

  return countryModifiedEvent
}

export function createDefaultAdminDelayChangeCanceledEvent(): DefaultAdminDelayChangeCanceled {
  let defaultAdminDelayChangeCanceledEvent =
    changetype<DefaultAdminDelayChangeCanceled>(newMockEvent())

  defaultAdminDelayChangeCanceledEvent.parameters = new Array()

  return defaultAdminDelayChangeCanceledEvent
}

export function createDefaultAdminDelayChangeScheduledEvent(
  newDelay: BigInt,
  effectSchedule: BigInt
): DefaultAdminDelayChangeScheduled {
  let defaultAdminDelayChangeScheduledEvent =
    changetype<DefaultAdminDelayChangeScheduled>(newMockEvent())

  defaultAdminDelayChangeScheduledEvent.parameters = new Array()

  defaultAdminDelayChangeScheduledEvent.parameters.push(
    new ethereum.EventParam(
      "newDelay",
      ethereum.Value.fromUnsignedBigInt(newDelay)
    )
  )
  defaultAdminDelayChangeScheduledEvent.parameters.push(
    new ethereum.EventParam(
      "effectSchedule",
      ethereum.Value.fromUnsignedBigInt(effectSchedule)
    )
  )

  return defaultAdminDelayChangeScheduledEvent
}

export function createDefaultAdminTransferCanceledEvent(): DefaultAdminTransferCanceled {
  let defaultAdminTransferCanceledEvent =
    changetype<DefaultAdminTransferCanceled>(newMockEvent())

  defaultAdminTransferCanceledEvent.parameters = new Array()

  return defaultAdminTransferCanceledEvent
}

export function createDefaultAdminTransferScheduledEvent(
  newAdmin: Address,
  acceptSchedule: BigInt
): DefaultAdminTransferScheduled {
  let defaultAdminTransferScheduledEvent =
    changetype<DefaultAdminTransferScheduled>(newMockEvent())

  defaultAdminTransferScheduledEvent.parameters = new Array()

  defaultAdminTransferScheduledEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )
  defaultAdminTransferScheduledEvent.parameters.push(
    new ethereum.EventParam(
      "acceptSchedule",
      ethereum.Value.fromUnsignedBigInt(acceptSchedule)
    )
  )

  return defaultAdminTransferScheduledEvent
}

export function createIdentityModifiedEvent(
  _oldIdentity: Address,
  _newIdentity: Address
): IdentityModified {
  let identityModifiedEvent = changetype<IdentityModified>(newMockEvent())

  identityModifiedEvent.parameters = new Array()

  identityModifiedEvent.parameters.push(
    new ethereum.EventParam(
      "_oldIdentity",
      ethereum.Value.fromAddress(_oldIdentity)
    )
  )
  identityModifiedEvent.parameters.push(
    new ethereum.EventParam(
      "_newIdentity",
      ethereum.Value.fromAddress(_newIdentity)
    )
  )

  return identityModifiedEvent
}

export function createIdentityRegistryBoundEvent(
  _identityRegistry: Address
): IdentityRegistryBound {
  let identityRegistryBoundEvent =
    changetype<IdentityRegistryBound>(newMockEvent())

  identityRegistryBoundEvent.parameters = new Array()

  identityRegistryBoundEvent.parameters.push(
    new ethereum.EventParam(
      "_identityRegistry",
      ethereum.Value.fromAddress(_identityRegistry)
    )
  )

  return identityRegistryBoundEvent
}

export function createIdentityRegistryUnboundEvent(
  _identityRegistry: Address
): IdentityRegistryUnbound {
  let identityRegistryUnboundEvent =
    changetype<IdentityRegistryUnbound>(newMockEvent())

  identityRegistryUnboundEvent.parameters = new Array()

  identityRegistryUnboundEvent.parameters.push(
    new ethereum.EventParam(
      "_identityRegistry",
      ethereum.Value.fromAddress(_identityRegistry)
    )
  )

  return identityRegistryUnboundEvent
}

export function createIdentityStoredEvent(
  _identityWallet: Address,
  _identity: Address
): IdentityStored {
  let identityStoredEvent = changetype<IdentityStored>(newMockEvent())

  identityStoredEvent.parameters = new Array()

  identityStoredEvent.parameters.push(
    new ethereum.EventParam(
      "_identityWallet",
      ethereum.Value.fromAddress(_identityWallet)
    )
  )
  identityStoredEvent.parameters.push(
    new ethereum.EventParam("_identity", ethereum.Value.fromAddress(_identity))
  )

  return identityStoredEvent
}

export function createIdentityUnstoredEvent(
  _identityWallet: Address,
  _identity: Address
): IdentityUnstored {
  let identityUnstoredEvent = changetype<IdentityUnstored>(newMockEvent())

  identityUnstoredEvent.parameters = new Array()

  identityUnstoredEvent.parameters.push(
    new ethereum.EventParam(
      "_identityWallet",
      ethereum.Value.fromAddress(_identityWallet)
    )
  )
  identityUnstoredEvent.parameters.push(
    new ethereum.EventParam("_identity", ethereum.Value.fromAddress(_identity))
  )

  return identityUnstoredEvent
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

export function createUpgradedEvent(implementation: Address): Upgraded {
  let upgradedEvent = changetype<Upgraded>(newMockEvent())

  upgradedEvent.parameters = new Array()

  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return upgradedEvent
}
