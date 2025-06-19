import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { VaultTransaction } from "../../../../../generated/schema";

export function fetchVaultTransaction(
  vaultAddress: Address,
  txIndex: BigInt
): VaultTransaction {
  let id = vaultAddress.concatI32(txIndex.toI32());
  let transaction = VaultTransaction.load(id);

  if (!transaction) {
    transaction = new VaultTransaction(id);
    transaction.vault = vaultAddress;
    transaction.txIndex = txIndex;
    transaction.value = BigDecimal.fromString("0");
    transaction.valueExact = BigInt.fromI32(0);
    transaction.data = Bytes.empty();
    transaction.comment = "";
    transaction.executed = false;
    transaction.confirmationsRequired = BigInt.fromI32(0);
    transaction.confirmationsCount = BigInt.fromI32(0);
    transaction.submittedAt = BigInt.fromI32(0);
    transaction.deployedInTransaction = Bytes.empty();
    transaction.save();
  }

  return transaction;
}
