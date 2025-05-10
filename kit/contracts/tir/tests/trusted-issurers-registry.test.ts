import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ExampleEntity } from "../generated/schema"
import { ClaimTopicsUpdated } from "../generated/TrustedIssurersRegistry/TrustedIssurersRegistry"
import { handleClaimTopicsUpdated } from "../src/trusted-issurers-registry"
import { createClaimTopicsUpdatedEvent } from "./trusted-issurers-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let initiator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _issuer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _claimTopics = [BigInt.fromI32(234)]
    let newClaimTopicsUpdatedEvent = createClaimTopicsUpdatedEvent(
      initiator,
      _issuer,
      _claimTopics
    )
    handleClaimTopicsUpdated(newClaimTopicsUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ExampleEntity created and stored", () => {
    assert.entityCount("ExampleEntity", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "initiator",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "_issuer",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "_claimTopics",
      "[234]"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
