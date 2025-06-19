import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { BatchClaimed } from "../generated/schema"
import { BatchClaimed as BatchClaimedEvent } from "../generated/VestingAirdrop/VestingAirdrop"
import { handleBatchClaimed } from "../src/vesting-airdrop"
import { createBatchClaimedEvent } from "./vesting-airdrop-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let claimant = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let totalAmount = BigInt.fromI32(234)
    let indices = [BigInt.fromI32(234)]
    let amounts = [BigInt.fromI32(234)]
    let newBatchClaimedEvent = createBatchClaimedEvent(
      claimant,
      totalAmount,
      indices,
      amounts
    )
    handleBatchClaimed(newBatchClaimedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("BatchClaimed created and stored", () => {
    assert.entityCount("BatchClaimed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BatchClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "claimant",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "BatchClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "totalAmount",
      "234"
    )
    assert.fieldEquals(
      "BatchClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "indices",
      "[234]"
    )
    assert.fieldEquals(
      "BatchClaimed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amounts",
      "[234]"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
