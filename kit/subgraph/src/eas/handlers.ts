import { BigInt } from "@graphprotocol/graph-ts";
import {
  Attested as AttestedEvent,
  EAS,
  Revoked as RevokedEvent,
} from "../../generated/EAS/EAS";
import {
  Registered as RegisteredEvent
} from "../../generated/SchemaRegistry/SchemaRegistry";
import { Attestation, Schema } from "../../generated/schema";

export function handleAttested(event: AttestedEvent): void {
  let attestationId = event.params.uid.toHexString();
  let attestation = Attestation.load(attestationId);

  if (attestation == null) {
    attestation = new Attestation(attestationId);
  }

  let easContract = EAS.bind(event.address);
  // The schemaUID from the event is named schemaUID in the event, but schema in getAttestation call result.
  // The event params for Attested are: recipient, attester, uid, schemaUID
  // The Attestation struct from getAttestation has: uid, schema, time, expirationTime, revocationTime, refUID, recipient, attester, revocable, data
  let attestationDataFromContract = easContract.getAttestation(event.params.uid);

  attestation.schema = event.params.schemaUID.toHexString(); // Corrected: schemaUID from event is the schema ID
  attestation.attester = event.params.attester;
  attestation.recipient = event.params.recipient;

  attestation.time = attestationDataFromContract.time;
  attestation.expirationTime = attestationDataFromContract.expirationTime;
  attestation.revocationTime = attestationDataFromContract.revocationTime;
  attestation.refUID = attestationDataFromContract.refUID;
  attestation.revocable = attestationDataFromContract.revocable;
  attestation.data = attestationDataFromContract.data;
  attestation.value = BigInt.fromI32(0); // Placeholder as discussed, value is not in core Attestation struct

  attestation.transactionHash = event.transaction.hash;
  attestation.blockNumber = event.block.number;
  attestation.blockTimestamp = event.block.timestamp;

  attestation.save();

  let schema = Schema.load(event.params.schemaUID.toHexString()); // Corrected: schemaUID from event
  if (schema != null) {
    schema.attestationCount = schema.attestationCount.plus(BigInt.fromI32(1));
    schema.save();
  }
}

export function handleRevoked(event: RevokedEvent): void {
  let attestationId = event.params.uid.toHexString();
  let attestation = Attestation.load(attestationId);

  if (attestation != null) {
    let easContract = EAS.bind(event.address);
    let attestationDataFromContract = easContract.getAttestation(event.params.uid);

    attestation.revocationTime = attestationDataFromContract.revocationTime;
    attestation.save();
  }
}

export function handleRegisteredSchema(event: RegisteredEvent): void {
  let schemaId = event.params.uid.toHexString(); // uid is the schema ID from Registered event
  let schema = Schema.load(schemaId);

  if (schema == null) {
    schema = new Schema(schemaId);
  }

  schema.registerer = event.params.registerer;

  // The event now directly provides the SchemaRecord tuple
  // Access fields from event.params.schema (this is the RegisteredSchemaStruct)
  let schemaTuple = event.params.schema;

  schema.resolver = schemaTuple.resolver;
  schema.revocable = schemaTuple.revocable;
  schema.schemaString = schemaTuple.schema; // This 'schema' is the schema string from the tuple
  schema.registeredTimestamp = event.block.timestamp;
  schema.attestationCount = BigInt.fromI32(0);

  schema.save();
}