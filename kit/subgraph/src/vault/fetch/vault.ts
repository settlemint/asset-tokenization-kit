import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Vault } from "../../../generated/schema";
import { Vault as VaultContract } from "../../../generated/templates/Vault/Vault";
import { fetchAccount } from "../../fetch/account";

export function fetchVault(address: Address, timestamp: BigInt): Vault {
  let vault = Vault.load(address);

  if (!vault) {
    vault = new Vault(address);

    let endpoint = VaultContract.bind(address);
    let signers = endpoint.try_signers();
    let required = endpoint.try_required();
    let paused = endpoint.try_paused();

    let signersArray: Bytes[] = [];
    for (let i = 0; i < signers.value.length; i++) {
      const signer = fetchAccount(signers.value[i]);
      signersArray.push(signer.id);
    }

    vault.signers = signersArray;
    vault.requiredSigners = required.reverted ? BigInt.zero() : required.value;
    vault.totalSigners = BigInt.fromI32(signersArray.length);
    vault.paused = paused.reverted ? false : paused.value;
    vault.deployedOn = timestamp ? timestamp : BigInt.zero();
    vault.lastActivity = timestamp ? timestamp : BigInt.zero();
    vault.asAccount = fetchAccount(address).id;

    vault.save();
  }

  return vault;
}
