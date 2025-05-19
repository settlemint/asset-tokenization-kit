import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Identity,
  Approved,
  ClaimAdded,
  ClaimChanged,
  ClaimRemoved,
  Executed,
  ExecutionFailed,
  ExecutionRequested,
  Initialized,
  KeyAdded,
  KeyRemoved
} from "../generated/Identity/Identity"
import { ExampleEntity } from "../generated/schema"

export function handleApproved(event: Approved): void {
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
  entity.executionId = event.params.executionId
  entity.approved = event.params.approved

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
  // - contract.addClaim(...)
  // - contract.addKey(...)
  // - contract.approve(...)
  // - contract.getClaim(...)
  // - contract.getClaimIdsByTopic(...)
  // - contract.getKey(...)
  // - contract.getKeyPurposes(...)
  // - contract.getKeysByPurpose(...)
  // - contract.getRecoveredAddress(...)
  // - contract.isClaimValid(...)
  // - contract.keyHasPurpose(...)
  // - contract.removeClaim(...)
  // - contract.removeKey(...)
  // - contract.supportsInterface(...)
  // - contract.version(...)
}

export function handleClaimAdded(event: ClaimAdded): void {}

export function handleClaimChanged(event: ClaimChanged): void {}

export function handleClaimRemoved(event: ClaimRemoved): void {}

export function handleExecuted(event: Executed): void {}

export function handleExecutionFailed(event: ExecutionFailed): void {}

export function handleExecutionRequested(event: ExecutionRequested): void {}

export function handleInitialized(event: Initialized): void {}

export function handleKeyAdded(event: KeyAdded): void {}

export function handleKeyRemoved(event: KeyRemoved): void {}
