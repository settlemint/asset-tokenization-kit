import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ConfirmTransaction } from "../generated/schema"
import { ConfirmTransaction as ConfirmTransactionEvent } from "../generated/Vault/Vault"
import { handleConfirmTransaction } from "../src/vault"
import { createConfirmTransactionEvent } from "./vault-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let owner = Address.fromString("0x0000000000000000000000000000000000000001")
    let txIndex = BigInt.fromI32(234)
    let newConfirmTransactionEvent = createConfirmTransactionEvent(
      owner,
      txIndex
    )
    handleConfirmTransaction(newConfirmTransactionEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ConfirmTransaction created and stored", () => {
    assert.entityCount("ConfirmTransaction", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ConfirmTransaction",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "owner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ConfirmTransaction",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "txIndex",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
