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
    identity.supportedInterfaces = new Array<Bytes>();
    identity.entityType = "wallet";

    identity.save();
    IdentityTemplate.create(address);

    // Ensure the identity contract address has a readable name
    fetchAccount(address);
    setAccountContractName(address, "Identity");
    return identity;
  }

  let mutated = false;

  if (identity.get("supportedInterfaces") == null) {
    identity.supportedInterfaces = new Array<Bytes>();
    mutated = true;
  }

  if (identity.get("entityType") == null) {
    identity.entityType = identity.isContract ? "contract" : "wallet";
    mutated = true;
  }

  if (mutated) {
    identity.save();
  }

  return identity;
}
