import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Vault } from "../../../../generated/schema";

export function transactionId(vault: Vault, txIndex: BigInt): Bytes {
  return vault.id.concatI32(txIndex.toI32());
}
