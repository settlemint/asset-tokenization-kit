import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  System,
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
import { ExampleEntity } from "../generated/schema"

export function handleBootstrapped(event: Bootstrapped): void {
  // Entities can be loaded from the store using an ID; this ID
  // needs to be unique across all entities of the same type
  const id = event.transaction.hash.concat(
    Bytes.fromByteArray(Bytes.fromBigInt(event.logIndex))
  )
  let entity = ExampleEntity.load(id)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(id)

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.complianceProxy = event.params.complianceProxy
  entity.identityRegistryProxy = event.params.identityRegistryProxy

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.DEFAULT_ADMIN_ROLE(...)
  // - contract.complianceImplementation(...)
  // - contract.complianceProxy(...)
  // - contract.getRoleAdmin(...)
  // - contract.hasRole(...)
  // - contract.identityFactoryImplementation(...)
  // - contract.identityFactoryProxy(...)
  // - contract.identityImplementation(...)
  // - contract.identityRegistryImplementation(...)
  // - contract.identityRegistryProxy(...)
  // - contract.identityRegistryStorageImplementation(...)
  // - contract.identityRegistryStorageProxy(...)
  // - contract.isTrustedForwarder(...)
  // - contract.supportsInterface(...)
  // - contract.tokenIdentityImplementation(...)
  // - contract.trustedForwarder(...)
  // - contract.trustedIssuersRegistryImplementation(...)
  // - contract.trustedIssuersRegistryProxy(...)
}

export function handleComplianceImplementationUpdated(
  event: ComplianceImplementationUpdated
): void {}

export function handleEtherWithdrawn(event: EtherWithdrawn): void {}

export function handleIdentityFactoryImplementationUpdated(
  event: IdentityFactoryImplementationUpdated
): void {}

export function handleIdentityImplementationUpdated(
  event: IdentityImplementationUpdated
): void {}

export function handleIdentityRegistryImplementationUpdated(
  event: IdentityRegistryImplementationUpdated
): void {}

export function handleIdentityRegistryStorageImplementationUpdated(
  event: IdentityRegistryStorageImplementationUpdated
): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleTokenIdentityImplementationUpdated(
  event: TokenIdentityImplementationUpdated
): void {}

export function handleTrustedIssuersRegistryImplementationUpdated(
  event: TrustedIssuersRegistryImplementationUpdated
): void {}
