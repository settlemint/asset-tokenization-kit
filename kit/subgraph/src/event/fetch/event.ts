import { Address, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import {
  Account,
  Event,
  EventValue,
  Identity,
} from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";
import { trackEventStats } from "../../stats/event-stats";

export function convertEthereumValue(value: ethereum.Value): string {
  if (value.kind == ethereum.ValueKind.ADDRESS) {
    return value.toAddress().toHexString();
  } else if (value.kind == ethereum.ValueKind.BOOL) {
    return value.toBoolean().toString();
  } else if (
    value.kind == ethereum.ValueKind.BYTES ||
    value.kind == ethereum.ValueKind.FIXED_BYTES
  ) {
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

  const emitter = getAccount(event.address);
  const txSender = fetchAccount(event.transaction.from);

  const entry = new Event(id);
  entry.eventName = eventType;
  entry.blockNumber = event.block.number;
  entry.blockTimestamp = event.block.timestamp;
  entry.txIndex = event.transaction.index;
  entry.transactionHash = event.transaction.hash;
  entry.emitter = emitter.id;
  entry.sender = txSender.id;

  const involvedAccounts: Bytes[] = [txSender.id, emitter.id];

  for (let i = 0; i < event.parameters.length; i++) {
    const param = event.parameters[i];
    if (param.value.kind == ethereum.ValueKind.ADDRESS) {
      const paramAddress = param.value.toAddress();
      if (paramAddress == Address.zero()) {
        continue;
      }
      const address = getAccount(paramAddress);
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

  // Track event statistics
  trackEventStats(emitter.id, eventType);

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

function getAccount(address: Address): Account {
  let accountAddress = address;
  // First check if the address is an existing identity
  const identity = Identity.load(address);
  if (identity) {
    accountAddress = Address.fromBytes(identity.account);
  }
  return fetchAccount(accountAddress);
}
