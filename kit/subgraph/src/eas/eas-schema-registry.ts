import { log } from "@graphprotocol/graph-ts";
import { Registered as RegisteredEvent } from "../../generated/EASSchemaRegistry/EASSchemaRegistry";
import { Schema } from "../../generated/schema";
import { schemaRegisteredEvent } from "../assets/events/schemaregisted";
import { fetchAccount } from "../fetch/account";
import { eventId } from "../utils/events";

export function handleRegistered(event: RegisteredEvent): void {
  const registerer = fetchAccount(event.params.registerer);

  log.info(
    "EAS schema registered: uid={}, resolver={}, revocable={}, schema={}",
    [
      event.params.uid.toHexString(),
      event.params.schema.resolver.toHexString(),
      event.params.schema.revocable.toString(),
      event.params.schema.schema,
    ]
  );

  schemaRegisteredEvent(
    eventId(event),
    event.block.timestamp,
    registerer.id,
    event.params.uid,
    event.params.schema.resolver,
    event.params.schema.revocable,
    event.params.schema.schema
  );

  let schema = Schema.load(event.params.uid);
  if (!schema) {
    schema = new Schema(event.params.uid);
    schema.resolver = event.params.schema.resolver;
    schema.revocable = event.params.schema.revocable;
    schema.schema = event.params.schema.schema;
    schema.save();
  }
}
