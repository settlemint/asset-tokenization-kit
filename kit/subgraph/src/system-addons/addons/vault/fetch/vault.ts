import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Vault } from "../../../../../generated/schema";
import { fetchAccessControl } from "../../../../access-control/fetch/accesscontrol";
import { fetchAccount } from "../../../../account/fetch/account";
import { setAccountContractName } from "../../../../account/utils/account-contract-name";
import { refreshIdentityClassificationForAccount } from "../../../../identity/utils/identity-classification";

export function fetchVault(address: Address): Vault {
  let vault = Vault.load(address);

  if (!vault) {
    vault = new Vault(address);
    vault.accessControl = fetchAccessControl(address).id;
    vault.account = fetchAccount(address).id;
    vault.createdAt = BigInt.fromI32(0);
    vault.required = BigInt.fromI32(0);
    vault.signers = [];
    vault.balance = BigDecimal.fromString("0");
    vault.balanceExact = BigInt.fromI32(0);
    vault.deployedInTransaction = Bytes.empty();
    vault.weightedSignaturesEnabled = false;
    vault.save();
    setAccountContractName(address, "Vault");
    refreshIdentityClassificationForAccount(address);
  }

  return vault;
}
