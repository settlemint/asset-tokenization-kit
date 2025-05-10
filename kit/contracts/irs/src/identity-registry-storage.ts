import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  IdentityRegistryStorage,
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
import { ExampleEntity } from "../generated/schema"

export function handleCountryModified(event: CountryModified): void {
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
  entity._identityWallet = event.params._identityWallet
  entity._country = event.params._country

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
  // - contract.STORAGE_MODIFIER_ROLE(...)
  // - contract.UPGRADE_INTERFACE_VERSION(...)
  // - contract.defaultAdmin(...)
  // - contract.defaultAdminDelay(...)
  // - contract.defaultAdminDelayIncreaseWait(...)
  // - contract.getIdentityWallets(...)
  // - contract.getRoleAdmin(...)
  // - contract.hasRole(...)
  // - contract.isTrustedForwarder(...)
  // - contract.linkedIdentityRegistries(...)
  // - contract.owner(...)
  // - contract.pendingDefaultAdmin(...)
  // - contract.pendingDefaultAdminDelay(...)
  // - contract.proxiableUUID(...)
  // - contract.storedIdentity(...)
  // - contract.storedInvestorCountry(...)
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

export function handleIdentityModified(event: IdentityModified): void {}

export function handleIdentityRegistryBound(
  event: IdentityRegistryBound
): void {}

export function handleIdentityRegistryUnbound(
  event: IdentityRegistryUnbound
): void {}

export function handleIdentityStored(event: IdentityStored): void {}

export function handleIdentityUnstored(event: IdentityUnstored): void {}

export function handleInitialized(event: Initialized): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleUpgraded(event: Upgraded): void {}
