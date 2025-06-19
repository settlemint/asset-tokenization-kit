import {
  BatchClaimed as BatchClaimedEvent,
  BatchVestingInitialized as BatchVestingInitializedEvent,
  Claimed as ClaimedEvent,
  Initialized as InitializedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  TokensWithdrawn as TokensWithdrawnEvent,
  VestingInitialized as VestingInitializedEvent,
  VestingStrategyUpdated as VestingStrategyUpdatedEvent,
} from "../generated/VestingAirdrop/VestingAirdrop"
import {
  BatchClaimed,
  BatchVestingInitialized,
  Claimed,
  Initialized,
  OwnershipTransferred,
  TokensWithdrawn,
  VestingInitialized,
  VestingStrategyUpdated,
} from "../generated/schema"

export function handleBatchClaimed(event: BatchClaimedEvent): void {
  let entity = new BatchClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.claimant = event.params.claimant
  entity.totalAmount = event.params.totalAmount
  entity.indices = event.params.indices
  entity.amounts = event.params.amounts

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBatchVestingInitialized(
  event: BatchVestingInitializedEvent,
): void {
  let entity = new BatchVestingInitialized(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.account = event.params.account
  entity.indices = event.params.indices
  entity.totalAmounts = event.params.totalAmounts

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleClaimed(event: ClaimedEvent): void {
  let entity = new Claimed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.claimant = event.params.claimant
  entity.amount = event.params.amount
  entity.index = event.params.index

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent,
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokensWithdrawn(event: TokensWithdrawnEvent): void {
  let entity = new TokensWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.to = event.params.to
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVestingInitialized(event: VestingInitializedEvent): void {
  let entity = new VestingInitialized(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.account = event.params.account
  entity.totalAmount = event.params.totalAmount
  entity.index = event.params.index

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVestingStrategyUpdated(
  event: VestingStrategyUpdatedEvent,
): void {
  let entity = new VestingStrategyUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.oldStrategy = event.params.oldStrategy
  entity.newStrategy = event.params.newStrategy

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
