import { Address, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { Event, EventValue } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";
import { fetchIdentity } from "../../identity/fetch/identity";

export function convertEthereumValue(value: ethereum.Value): string {
  if (value.kind == ethereum.ValueKind.ADDRESS) {
    return value.toAddress().toHexString();
  } else if (value.kind == ethereum.ValueKind.BOOL) {
    return value.toBoolean().toString();
  } else if (value.kind == ethereum.ValueKind.BYTES) {
    return value.toBytes().toString();
  } else if (value.kind == ethereum.ValueKind.FIXED_BYTES) {
    return value.toBytes().toHexString();
  } else if (value.kind == ethereum.ValueKind.INT) {
    return value.toBigInt().toString();
  } else if (value.kind == ethereum.ValueKind.UINT) {
    return value.toBigInt().toString();
  } else if (value.kind == ethereum.ValueKind.STRING) {
    return value.toString();
  } else if (
    value.kind == ethereum.ValueKind.ARRAY ||
    value.kind == ethereum.ValueKind.FIXED_ARRAY
  ) {
    const arrayValue = value.toArray();
    const stringValues: string[] = [];
    for (let j = 0; j < arrayValue.length; j++) {
      stringValues.push(convertEthereumValue(arrayValue[j]));
    }
    return "[" + stringValues.join(", ") + "]";
  } else {
    return value.toString();
  }
}

export function fetchEvent(event: ethereum.Event, eventType: string): Event {
  const id = event.transaction.hash
    .concatI32(event.logIndex.toI32())
    .concat(Bytes.fromUTF8(eventType));
  let eventEntity = Event.load(id);

  log.info("Handling event '{}' with id '{}'", [eventType, id.toHexString()]);

  if (eventEntity) {
    return eventEntity;
  }

  const emitterIdentity = fetchIdentity(event.address);
  const account = emitterIdentity.account.load();
  const emitter =
    account && account.length > 0
      ? fetchAccount(Address.fromBytes(account[0].id))
      : null;
  const txSender = fetchAccount(event.transaction.from);

  const entry = new Event(id);
  entry.eventName = eventType;
  entry.blockNumber = event.block.number;
  entry.blockTimestamp = event.block.timestamp;
  entry.txIndex = event.transaction.index;
  entry.transactionHash = event.transaction.hash;
  if (emitter) {
    log.info(
      "Emitter mapped for event '{}' with emitter '{}' and identity '{}'",
      [eventType, emitter.id.toHexString(), emitterIdentity.id.toHexString()]
    );
    entry.emitter = emitter.id;
  } else {
    log.warning("No emitter found for event '{}' with identity '{}'", [
      eventType,
      emitterIdentity.id.toHexString(),
    ]);
    entry.emitter = txSender.id;
  }
  entry.sender = txSender.id;

  const involvedAccounts: Bytes[] = [txSender.id];
  if (emitter) {
    involvedAccounts.push(emitter.id);
  }

  for (let i = 0; i < event.parameters.length; i++) {
    const param = event.parameters[i];
    if (param.value.kind == ethereum.ValueKind.ADDRESS) {
      const isEmitterIdentity =
        param.value.toAddress().toHexString() == event.address.toHexString();
      if (isEmitterIdentity) {
        log.info("Skipping emitter identity for event '{}' with id '{}'", [
          eventType,
          id.toHexString(),
        ]);
        continue;
      }
      const address = fetchAccount(param.value.toAddress());
      if (param.name == "sender") {
        entry.sender = address.id;
      }

      // Check if address is already in the array to avoid duplicates
      let alreadyExists = false;
      for (let j = 0; j < involvedAccounts.length; j++) {
        if (involvedAccounts[j].equals(address.id)) {
          alreadyExists = true;
          break;
        }
      }

      if (!alreadyExists) {
        involvedAccounts.push(address.id);
      }
    }
  }

  entry.involved = involvedAccounts;
  entry.save();

  for (let i = 0; i < event.parameters.length; i++) {
    const param = event.parameters[i];
    const name = param.name;
    const value = convertEthereumValue(param.value);

    const entryValue = new EventValue(
      event.transaction.hash
        .concatI32(event.logIndex.toI32())
        .concat(Bytes.fromUTF8(name))
    );
    entryValue.name = name;
    entryValue.value = value;
    entryValue.entry = entry.id;
    entryValue.save();
  }

  return entry;
}
