import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts";
import { VaultSigner } from "../../../../../generated/schema";
import { fetchAccount } from "../../../../account/fetch/account";

export function fetchVaultSigner(
  vaultAddress: Address,
  signerAddress: Address
): VaultSigner {
  const id = vaultAddress
    .toHexString()
    .concat("-")
    .concat(signerAddress.toHexString());

  let vaultSigner = VaultSigner.load(Bytes.fromHexString(id));

  if (!vaultSigner) {
    vaultSigner = new VaultSigner(Bytes.fromHexString(id));
    vaultSigner.vault = vaultAddress;
    vaultSigner.signer = fetchAccount(signerAddress).id;
    vaultSigner.weight = BigInt.fromI32(0);
    vaultSigner.deployedInTransaction = Bytes.empty();
  }

  return vaultSigner;
}
