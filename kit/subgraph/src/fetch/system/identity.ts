import { Address } from "@graphprotocol/graph-ts";
import { Identity } from "../../../generated/schema";
import { fetchAccount } from "../account";

export function fetchIdentity(address: Address, wallet: Address): Identity {
  let identity = Identity.load(address);

  if (!identity) {
    identity = new Identity(address);

    const walletAccount = fetchAccount(wallet);
    const addressAccount = fetchAccount(address);
    identity.asAccount = addressAccount.id;
    identity.wallet = walletAccount.id;
    identity.save();

    walletAccount.identity = identity.id;
    walletAccount.save();
  }

  return identity;
}
