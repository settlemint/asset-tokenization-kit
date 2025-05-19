import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  IdentityFactory,
  IdentityCreated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TokenIdentityCreated
} from "../generated/IdentityFactory/IdentityFactory"
import { ExampleEntity } from "../generated/schema"

export function handleIdentityCreated(event: IdentityCreated): void {
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
  entity.sender = event.params.sender
  entity.identity = event.params.identity

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
  // - contract.TOKEN_SALT_PREFIX(...)
  // - contract.WALLET_SALT_PREFIX(...)
  // - contract.calculateTokenIdentityAddress(...)
  // - contract.calculateWalletIdentityAddress(...)
  // - contract.createIdentity(...)
  // - contract.createTokenIdentity(...)
  // - contract.getIdentity(...)
  // - contract.getRoleAdmin(...)
  // - contract.getRoleMember(...)
  // - contract.getRoleMemberCount(...)
  // - contract.getRoleMembers(...)
  // - contract.getSystem(...)
  // - contract.getTokenIdentity(...)
  // - contract.hasRole(...)
  // - contract.isTrustedForwarder(...)
  // - contract.supportsInterface(...)
  // - contract.trustedForwarder(...)
}

export function handleInitialized(event: Initialized): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleTokenIdentityCreated(event: TokenIdentityCreated): void {}
