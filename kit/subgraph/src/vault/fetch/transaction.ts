import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Vault } from "../../../generated/schema";

export function transactionId(vault: Vault, txIndex: BigInt): Bytes {
  return Bytes.fromUTF8(
    vault.id.toHex().concat("-").concat(txIndex.toString())
  );
}
