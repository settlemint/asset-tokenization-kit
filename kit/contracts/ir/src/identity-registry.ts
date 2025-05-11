import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  IdentityRegistry,
  CountryUpdated,
  DefaultAdminDelayChangeCanceled,
  DefaultAdminDelayChangeScheduled,
  DefaultAdminTransferCanceled,
  DefaultAdminTransferScheduled,
  IdentityRegistered,
  IdentityRemoved,
  IdentityStorageSet,
  IdentityUpdated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TrustedIssuersRegistrySet,
  Upgraded
} from "../generated/IdentityRegistry/IdentityRegistry"
import { ExampleEntity } from "../generated/schema"

export function handleCountryUpdated(event: CountryUpdated): void {
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
  entity.initiator = event.params.initiator
  entity._investorAddress = event.params._investorAddress

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
  // - contract.REGISTRAR_ROLE(...)
  // - contract.UPGRADE_INTERFACE_VERSION(...)
  // - contract.contains(...)
  // - contract.defaultAdmin(...)
  // - contract.defaultAdminDelay(...)
  // - contract.defaultAdminDelayIncreaseWait(...)
  // - contract.getRoleAdmin(...)
  // - contract.hasRole(...)
  // - contract.identity(...)
  // - contract.identityStorage(...)
  // - contract.investorCountry(...)
  // - contract.isTrustedForwarder(...)
  // - contract.isVerified(...)
  // - contract.issuersRegistry(...)
  // - contract.owner(...)
  // - contract.pendingDefaultAdmin(...)
  // - contract.pendingDefaultAdminDelay(...)
  // - contract.proxiableUUID(...)
  // - contract.supportsInterface(...)
  // - contract.trustedForwarder(...)
}

export function handleDefaultAdminDelayChangeCanceled(
  event: DefaultAdminDelayChangeCanceled
): void {}

export function handleDefaultAdminDelayChangeScheduled(
  event: DefaultAdminDelayChangeScheduled
): void {}

export function handleDefaultAdminTransferCanceled(
  event: DefaultAdminTransferCanceled
): void {}

export function handleDefaultAdminTransferScheduled(
  event: DefaultAdminTransferScheduled
): void {}

export function handleIdentityRegistered(event: IdentityRegistered): void {}

export function handleIdentityRemoved(event: IdentityRemoved): void {}

export function handleIdentityStorageSet(event: IdentityStorageSet): void {}

export function handleIdentityUpdated(event: IdentityUpdated): void {}

export function handleInitialized(event: Initialized): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleTrustedIssuersRegistrySet(
  event: TrustedIssuersRegistrySet
): void {}

export function handleUpgraded(event: Upgraded): void {}
