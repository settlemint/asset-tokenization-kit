import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  TrustedIssuersRegistry,
  ClaimTopicsUpdated,
  Initialized,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  TrustedIssuerAdded,
  TrustedIssuerRemoved
} from "../generated/TrustedIssuersRegistry/TrustedIssuersRegistry"
import { ExampleEntity } from "../generated/schema"

export function handleClaimTopicsUpdated(event: ClaimTopicsUpdated): void {
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
  entity._issuer = event.params._issuer

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
  // - contract.getRoleAdmin(...)
  // - contract.getRoleMember(...)
  // - contract.getRoleMemberCount(...)
  // - contract.getRoleMembers(...)
  // - contract.getTrustedIssuerClaimTopics(...)
  // - contract.getTrustedIssuers(...)
  // - contract.getTrustedIssuersForClaimTopic(...)
  // - contract.hasClaimTopic(...)
  // - contract.hasRole(...)
  // - contract.isTrustedForwarder(...)
  // - contract.isTrustedIssuer(...)
  // - contract.supportsInterface(...)
  // - contract.trustedForwarder(...)
}

export function handleInitialized(event: Initialized): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}

export function handleTrustedIssuerAdded(event: TrustedIssuerAdded): void {}

export function handleTrustedIssuerRemoved(event: TrustedIssuerRemoved): void {}
