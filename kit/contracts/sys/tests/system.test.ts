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
import { Bootstrapped } from "../generated/System/System"
import { handleBootstrapped } from "../src/system"
import { createBootstrappedEvent } from "./system-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let complianceProxy = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let identityRegistryProxy = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let identityRegistryStorageProxy = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let trustedIssuersRegistryProxy = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let identityFactoryProxy = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newBootstrappedEvent = createBootstrappedEvent(
      complianceProxy,
      identityRegistryProxy,
      identityRegistryStorageProxy,
      trustedIssuersRegistryProxy,
      identityFactoryProxy
    )
    handleBootstrapped(newBootstrappedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("ExampleEntity created and stored", () => {
    assert.entityCount("ExampleEntity", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "complianceProxy",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "identityRegistryProxy",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "identityRegistryStorageProxy",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "trustedIssuersRegistryProxy",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "identityFactoryProxy",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
