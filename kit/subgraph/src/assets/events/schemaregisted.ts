import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { SchemaRegistered } from "../../../generated/schema";
import { EventName } from "../../utils/enums";

export function schemaRegisteredEvent(
  id: Bytes,
  timestamp: BigInt,
  sender: Bytes,
  uid: Bytes,
  resolver: Bytes,
  revocable: boolean,
  schema: string
): SchemaRegistered {
  const schemaRegisteredEvent = new SchemaRegistered(id);
  schemaRegisteredEvent.eventName = EventName.SchemaRegistered;
  schemaRegisteredEvent.timestamp = timestamp;
  schemaRegisteredEvent.sender = sender;
  schemaRegisteredEvent.uid = uid;
  schemaRegisteredEvent.resolver = resolver;
  schemaRegisteredEvent.revocable = revocable;
  schemaRegisteredEvent.schema = schema;
  schemaRegisteredEvent.save();
  return schemaRegisteredEvent;
}
