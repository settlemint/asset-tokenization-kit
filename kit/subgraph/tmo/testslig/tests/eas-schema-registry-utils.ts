import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address } from "@graphprotocol/graph-ts"
import { Registered } from "../generated/EASSchemaRegistry/EASSchemaRegistry"

export function createRegisteredEvent(
  uid: Bytes,
  registerer: Address,
  schema: ethereum.Tuple
): Registered {
  let registeredEvent = changetype<Registered>(newMockEvent())

  registeredEvent.parameters = new Array()

  registeredEvent.parameters.push(
    new ethereum.EventParam("uid", ethereum.Value.fromFixedBytes(uid))
  )
  registeredEvent.parameters.push(
    new ethereum.EventParam(
      "registerer",
      ethereum.Value.fromAddress(registerer)
    )
  )
  registeredEvent.parameters.push(
    new ethereum.EventParam("schema", ethereum.Value.fromTuple(schema))
  )

  return registeredEvent
}
