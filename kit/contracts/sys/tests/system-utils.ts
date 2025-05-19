import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Bootstrapped,
  ComplianceImplementationUpdated,
  EtherWithdrawn,
  IdentityFactoryImplementationUpdated,
  IdentityImplementationUpdated,
  IdentityRegistryImplementationUpdated,
  IdentityRegistryStorageImplementationUpdated,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenIdentityImplementationUpdated,
  TrustedIssuersRegistryImplementationUpdated
} from "../generated/System/System"

export function createBootstrappedEvent(
  complianceProxy: Address,
  identityRegistryProxy: Address,
  identityRegistryStorageProxy: Address,
  trustedIssuersRegistryProxy: Address,
  identityFactoryProxy: Address
): Bootstrapped {
  let bootstrappedEvent = changetype<Bootstrapped>(newMockEvent())

  bootstrappedEvent.parameters = new Array()

  bootstrappedEvent.parameters.push(
    new ethereum.EventParam(
      "complianceProxy",
      ethereum.Value.fromAddress(complianceProxy)
    )
  )
  bootstrappedEvent.parameters.push(
    new ethereum.EventParam(
      "identityRegistryProxy",
      ethereum.Value.fromAddress(identityRegistryProxy)
    )
  )
  bootstrappedEvent.parameters.push(
    new ethereum.EventParam(
      "identityRegistryStorageProxy",
      ethereum.Value.fromAddress(identityRegistryStorageProxy)
    )
  )
  bootstrappedEvent.parameters.push(
    new ethereum.EventParam(
      "trustedIssuersRegistryProxy",
      ethereum.Value.fromAddress(trustedIssuersRegistryProxy)
    )
  )
  bootstrappedEvent.parameters.push(
    new ethereum.EventParam(
      "identityFactoryProxy",
      ethereum.Value.fromAddress(identityFactoryProxy)
    )
  )

  return bootstrappedEvent
}

export function createComplianceImplementationUpdatedEvent(
  newImplementation: Address
): ComplianceImplementationUpdated {
  let complianceImplementationUpdatedEvent =
    changetype<ComplianceImplementationUpdated>(newMockEvent())

  complianceImplementationUpdatedEvent.parameters = new Array()

  complianceImplementationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return complianceImplementationUpdatedEvent
}

export function createEtherWithdrawnEvent(
  to: Address,
  amount: BigInt
): EtherWithdrawn {
  let etherWithdrawnEvent = changetype<EtherWithdrawn>(newMockEvent())

  etherWithdrawnEvent.parameters = new Array()

  etherWithdrawnEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  etherWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return etherWithdrawnEvent
}

export function createIdentityFactoryImplementationUpdatedEvent(
  newImplementation: Address
): IdentityFactoryImplementationUpdated {
  let identityFactoryImplementationUpdatedEvent =
    changetype<IdentityFactoryImplementationUpdated>(newMockEvent())

  identityFactoryImplementationUpdatedEvent.parameters = new Array()

  identityFactoryImplementationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return identityFactoryImplementationUpdatedEvent
}

export function createIdentityImplementationUpdatedEvent(
  newImplementation: Address
): IdentityImplementationUpdated {
  let identityImplementationUpdatedEvent =
    changetype<IdentityImplementationUpdated>(newMockEvent())

  identityImplementationUpdatedEvent.parameters = new Array()

  identityImplementationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return identityImplementationUpdatedEvent
}

export function createIdentityRegistryImplementationUpdatedEvent(
  newImplementation: Address
): IdentityRegistryImplementationUpdated {
  let identityRegistryImplementationUpdatedEvent =
    changetype<IdentityRegistryImplementationUpdated>(newMockEvent())

  identityRegistryImplementationUpdatedEvent.parameters = new Array()

  identityRegistryImplementationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return identityRegistryImplementationUpdatedEvent
}

export function createIdentityRegistryStorageImplementationUpdatedEvent(
  newImplementation: Address
): IdentityRegistryStorageImplementationUpdated {
  let identityRegistryStorageImplementationUpdatedEvent =
    changetype<IdentityRegistryStorageImplementationUpdated>(newMockEvent())

  identityRegistryStorageImplementationUpdatedEvent.parameters = new Array()

  identityRegistryStorageImplementationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return identityRegistryStorageImplementationUpdatedEvent
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

export function createTokenIdentityImplementationUpdatedEvent(
  newImplementation: Address
): TokenIdentityImplementationUpdated {
  let tokenIdentityImplementationUpdatedEvent =
    changetype<TokenIdentityImplementationUpdated>(newMockEvent())

  tokenIdentityImplementationUpdatedEvent.parameters = new Array()

  tokenIdentityImplementationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return tokenIdentityImplementationUpdatedEvent
}

export function createTrustedIssuersRegistryImplementationUpdatedEvent(
  newImplementation: Address
): TrustedIssuersRegistryImplementationUpdated {
  let trustedIssuersRegistryImplementationUpdatedEvent =
    changetype<TrustedIssuersRegistryImplementationUpdated>(newMockEvent())

  trustedIssuersRegistryImplementationUpdatedEvent.parameters = new Array()

  trustedIssuersRegistryImplementationUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newImplementation",
      ethereum.Value.fromAddress(newImplementation)
    )
  )

  return trustedIssuersRegistryImplementationUpdatedEvent
}
