import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { VaultTransactionConfirmation } from "../../../../../generated/schema";
import { fetchAccount } from "../../../../account/fetch/account";
import { fetchVaultTransaction } from "./vault-transaction";

export function fetchVaultTransactionConfirmation(
  vaultAddress: Address,
  txIndex: BigInt,
  signerAddress: Address
): VaultTransactionConfirmation {
  const id = vaultAddress
    .toHexString()
    .concat("-")
    .concat(txIndex.toString())
    .concat("-")
    .concat(signerAddress.toHexString());

  let confirmation = VaultTransactionConfirmation.load(Bytes.fromHexString(id));

  if (!confirmation) {
    confirmation = new VaultTransactionConfirmation(Bytes.fromHexString(id));
    confirmation.transaction = fetchVaultTransaction(vaultAddress, txIndex).id;
    confirmation.signer = fetchAccount(signerAddress).id;
    confirmation.confirmed = false;
    confirmation.deployedInTransaction = Bytes.empty();
  }

  return confirmation;
}
