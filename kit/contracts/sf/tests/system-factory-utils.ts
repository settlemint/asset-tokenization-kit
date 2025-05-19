import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { SMARTSystemCreated } from "../generated/SystemFactory/SystemFactory"

export function createSMARTSystemCreatedEvent(
  systemAddress: Address,
  initialAdmin: Address
): SMARTSystemCreated {
  let smartSystemCreatedEvent = changetype<SMARTSystemCreated>(newMockEvent())

  smartSystemCreatedEvent.parameters = new Array()

  smartSystemCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "systemAddress",
      ethereum.Value.fromAddress(systemAddress)
    )
  )
  smartSystemCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "initialAdmin",
      ethereum.Value.fromAddress(initialAdmin)
    )
  )

  return smartSystemCreatedEvent
}
