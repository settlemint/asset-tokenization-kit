import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  BatchClaimed,
  BatchVestingInitialized,
  Claimed,
  Initialized,
  OwnershipTransferred,
  TokensWithdrawn,
  VestingInitialized,
  VestingStrategyUpdated
} from "../generated/VestingAirdrop/VestingAirdrop"

export function createBatchClaimedEvent(
  claimant: Address,
  totalAmount: BigInt,
  indices: Array<BigInt>,
  amounts: Array<BigInt>
): BatchClaimed {
  let batchClaimedEvent = changetype<BatchClaimed>(newMockEvent())

  batchClaimedEvent.parameters = new Array()

  batchClaimedEvent.parameters.push(
    new ethereum.EventParam("claimant", ethereum.Value.fromAddress(claimant))
  )
  batchClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "totalAmount",
      ethereum.Value.fromUnsignedBigInt(totalAmount)
    )
  )
  batchClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "indices",
      ethereum.Value.fromUnsignedBigIntArray(indices)
    )
  )
  batchClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "amounts",
      ethereum.Value.fromUnsignedBigIntArray(amounts)
    )
  )

  return batchClaimedEvent
}

export function createBatchVestingInitializedEvent(
  account: Address,
  indices: Array<BigInt>,
  totalAmounts: Array<BigInt>
): BatchVestingInitialized {
  let batchVestingInitializedEvent =
    changetype<BatchVestingInitialized>(newMockEvent())

  batchVestingInitializedEvent.parameters = new Array()

  batchVestingInitializedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  batchVestingInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "indices",
      ethereum.Value.fromUnsignedBigIntArray(indices)
    )
  )
  batchVestingInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "totalAmounts",
      ethereum.Value.fromUnsignedBigIntArray(totalAmounts)
    )
  )

  return batchVestingInitializedEvent
}

export function createClaimedEvent(
  claimant: Address,
  amount: BigInt,
  index: BigInt
): Claimed {
  let claimedEvent = changetype<Claimed>(newMockEvent())

  claimedEvent.parameters = new Array()

  claimedEvent.parameters.push(
    new ethereum.EventParam("claimant", ethereum.Value.fromAddress(claimant))
  )
  claimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  claimedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )

  return claimedEvent
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

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createTokensWithdrawnEvent(
  to: Address,
  amount: BigInt
): TokensWithdrawn {
  let tokensWithdrawnEvent = changetype<TokensWithdrawn>(newMockEvent())

  tokensWithdrawnEvent.parameters = new Array()

  tokensWithdrawnEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  tokensWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return tokensWithdrawnEvent
}

export function createVestingInitializedEvent(
  account: Address,
  totalAmount: BigInt,
  index: BigInt
): VestingInitialized {
  let vestingInitializedEvent = changetype<VestingInitialized>(newMockEvent())

  vestingInitializedEvent.parameters = new Array()

  vestingInitializedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  vestingInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "totalAmount",
      ethereum.Value.fromUnsignedBigInt(totalAmount)
    )
  )
  vestingInitializedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )

  return vestingInitializedEvent
}

export function createVestingStrategyUpdatedEvent(
  oldStrategy: Address,
  newStrategy: Address
): VestingStrategyUpdated {
  let vestingStrategyUpdatedEvent =
    changetype<VestingStrategyUpdated>(newMockEvent())

  vestingStrategyUpdatedEvent.parameters = new Array()

  vestingStrategyUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "oldStrategy",
      ethereum.Value.fromAddress(oldStrategy)
    )
  )
  vestingStrategyUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newStrategy",
      ethereum.Value.fromAddress(newStrategy)
    )
  )

  return vestingStrategyUpdatedEvent
}
