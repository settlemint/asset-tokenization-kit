import { Address, Bytes } from "@graphprotocol/graph-ts";
import { Identity } from "../../../generated/schema";
import { Identity as IdentityTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchIdentity(address: Address): Identity {
  let identity = Identity.load(address);

  if (!identity) {
    identity = new Identity(address);

    identity.deployedInTransaction = Bytes.empty();
    identity.identityFactory = Address.zero();
    identity.account = Address.zero();
    identity.isContract = false;

    identity.save();
    IdentityTemplate.create(address);

    // Ensure the identity contract address has a readable name
    fetchAccount(address);
    setAccountContractName(address, "Identity");
  }

  return identity;
}
