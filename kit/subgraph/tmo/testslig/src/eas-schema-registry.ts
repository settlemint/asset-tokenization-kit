import { Registered as RegisteredEvent } from "../generated/EASSchemaRegistry/EASSchemaRegistry"
import { Registered } from "../generated/schema"

export function handleRegistered(event: RegisteredEvent): void {
  let entity = new Registered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.uid = event.params.uid
  entity.registerer = event.params.registerer
  entity.schema_uid = event.params.schema.uid
  entity.schema_resolver = event.params.schema.resolver
  entity.schema_revocable = event.params.schema.revocable
  entity.schema_schema = event.params.schema.schema

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
