import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SMARTComplianceModuleRegistered,
  SMARTDeploymentRegistered,
  SMARTDeploymentReset,
  SMARTTokenRegistryRegistered
} from "../generated/SMARTDeploymentRegistry/SMARTDeploymentRegistry"

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

export function createSMARTComplianceModuleRegisteredEvent(
  moduleAddress: Address,
  registrar: Address,
  timestamp: BigInt
): SMARTComplianceModuleRegistered {
  let smartComplianceModuleRegisteredEvent =
    changetype<SMARTComplianceModuleRegistered>(newMockEvent())

  smartComplianceModuleRegisteredEvent.parameters = new Array()

  smartComplianceModuleRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "moduleAddress",
      ethereum.Value.fromAddress(moduleAddress)
    )
  )
  smartComplianceModuleRegisteredEvent.parameters.push(
    new ethereum.EventParam("registrar", ethereum.Value.fromAddress(registrar))
  )
  smartComplianceModuleRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return smartComplianceModuleRegisteredEvent
}

export function createSMARTDeploymentRegisteredEvent(
  registrar: Address,
  timestamp: BigInt,
  complianceAddress: Address,
  identityRegistryStorageAddress: Address,
  identityFactoryAddress: Address,
  identityRegistryAddress: Address,
  trustedIssuersRegistryAddress: Address
): SMARTDeploymentRegistered {
  let smartDeploymentRegisteredEvent =
    changetype<SMARTDeploymentRegistered>(newMockEvent())

  smartDeploymentRegisteredEvent.parameters = new Array()

  smartDeploymentRegisteredEvent.parameters.push(
    new ethereum.EventParam("registrar", ethereum.Value.fromAddress(registrar))
  )
  smartDeploymentRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  smartDeploymentRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "complianceAddress",
      ethereum.Value.fromAddress(complianceAddress)
    )
  )
  smartDeploymentRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "identityRegistryStorageAddress",
      ethereum.Value.fromAddress(identityRegistryStorageAddress)
    )
  )
  smartDeploymentRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "identityFactoryAddress",
      ethereum.Value.fromAddress(identityFactoryAddress)
    )
  )
  smartDeploymentRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "identityRegistryAddress",
      ethereum.Value.fromAddress(identityRegistryAddress)
    )
  )
  smartDeploymentRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "trustedIssuersRegistryAddress",
      ethereum.Value.fromAddress(trustedIssuersRegistryAddress)
    )
  )

  return smartDeploymentRegisteredEvent
}

export function createSMARTDeploymentResetEvent(
  resetBy: Address,
  timestamp: BigInt
): SMARTDeploymentReset {
  let smartDeploymentResetEvent =
    changetype<SMARTDeploymentReset>(newMockEvent())

  smartDeploymentResetEvent.parameters = new Array()

  smartDeploymentResetEvent.parameters.push(
    new ethereum.EventParam("resetBy", ethereum.Value.fromAddress(resetBy))
  )
  smartDeploymentResetEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return smartDeploymentResetEvent
}

export function createSMARTTokenRegistryRegisteredEvent(
  typeName: string,
  registryTypeHash: Bytes,
  registryAddress: Address,
  registrar: Address,
  timestamp: BigInt
): SMARTTokenRegistryRegistered {
  let smartTokenRegistryRegisteredEvent =
    changetype<SMARTTokenRegistryRegistered>(newMockEvent())

  smartTokenRegistryRegisteredEvent.parameters = new Array()

  smartTokenRegistryRegisteredEvent.parameters.push(
    new ethereum.EventParam("typeName", ethereum.Value.fromString(typeName))
  )
  smartTokenRegistryRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "registryTypeHash",
      ethereum.Value.fromFixedBytes(registryTypeHash)
    )
  )
  smartTokenRegistryRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "registryAddress",
      ethereum.Value.fromAddress(registryAddress)
    )
  )
  smartTokenRegistryRegisteredEvent.parameters.push(
    new ethereum.EventParam("registrar", ethereum.Value.fromAddress(registrar))
  )
  smartTokenRegistryRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return smartTokenRegistryRegisteredEvent
}
