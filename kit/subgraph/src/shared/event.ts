import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Event, EventValue } from "../../generated/schema";
import { fetchAccount } from "../fetch/account";

export function processEvent(event: ethereum.Event, eventType: string): Event {
  const emitter = fetchAccount(event.address);
  const txSender = fetchAccount(event.transaction.from);

  const entry = new Event(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entry.eventName = eventType;
  entry.blockNumber = event.block.number;
  entry.blockTimestamp = event.block.timestamp;
  entry.txIndex = event.transaction.index;
  entry.transactionHash = event.transaction.hash;
  entry.emitter = emitter.id;
  entry.sender = txSender.id;

  const involvedAccounts = [txSender.id, emitter.id];

  for (let i = 0; i < event.parameters.length; i++) {
    const param = event.parameters[i];
    if (param.value.kind == ethereum.ValueKind.ADDRESS) {
      const address = fetchAccount(param.value.toAddress());
      if (
        param.name == "initiator" ||
        param.name == "registrar" ||
        param.name == "sender"
      ) {
        entry.sender = address.id;
      }
      involvedAccounts.push(address.id);
    }
  }

  entry.involved = involvedAccounts;
  entry.save();

  for (let i = 0; i < event.parameters.length; i++) {
    const param = event.parameters[i];
    const name = param.name;

    let value = "";
    if (param.value.kind == ethereum.ValueKind.ADDRESS) {
      value = param.value.toAddress().toHexString();
    } else if (param.value.kind == ethereum.ValueKind.BOOL) {
      value = param.value.toBoolean().toString();
    } else if (param.value.kind == ethereum.ValueKind.BYTES) {
      value = param.value.toBytes().toString();
    } else if (param.value.kind == ethereum.ValueKind.FIXED_BYTES) {
      value = param.value.toBytes().toHexString();
    } else if (param.value.kind == ethereum.ValueKind.INT) {
      value = param.value.toBigInt().toString();
    } else if (param.value.kind == ethereum.ValueKind.UINT) {
      value = param.value.toBigInt().toString();
    } else if (param.value.kind == ethereum.ValueKind.STRING) {
      value = param.value.toString();
    } else if (
      param.value.kind == ethereum.ValueKind.ARRAY ||
      param.value.kind == ethereum.ValueKind.FIXED_ARRAY
    ) {
      const arrayValue = param.value.toArray();
      const stringValues: string[] = [];
      for (let j = 0; j < arrayValue.length; j++) {
        const item = arrayValue[j];
        if (item.kind == ethereum.ValueKind.ADDRESS) {
          stringValues.push(item.toAddress().toHexString());
        } else if (item.kind == ethereum.ValueKind.BOOL) {
          stringValues.push(item.toBoolean().toString());
        } else if (item.kind == ethereum.ValueKind.BYTES) {
          stringValues.push(item.toBytes().toString());
        } else if (item.kind == ethereum.ValueKind.FIXED_BYTES) {
          stringValues.push(item.toBytes().toHexString());
        } else if (item.kind == ethereum.ValueKind.INT) {
          stringValues.push(item.toBigInt().toString());
        } else if (item.kind == ethereum.ValueKind.UINT) {
          stringValues.push(item.toBigInt().toString());
        } else if (item.kind == ethereum.ValueKind.STRING) {
          stringValues.push(item.toString());
        } else {
          stringValues.push(item.toString());
        }
      }
      value = "[" + stringValues.join(", ") + "]";
    } else {
      value = param.value.toString();
    }

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
