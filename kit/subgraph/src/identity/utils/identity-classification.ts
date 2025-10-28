import { Address } from "@graphprotocol/graph-ts";
import { Account, Identity, Token, Vault } from "../../../generated/schema";

export function updateIdentityEntityType(identity: Identity): boolean {
  if (!identity.isContract) {
    if (identity.entityType != "wallet") {
      identity.entityType = "wallet";
      return true;
    }
    return false;
  }

  // Prefer canonical entities so token/vault identities remain accurate when contract names change.
  const token = Token.load(identity.account);
  if (token) {
    if (identity.entityType != "token") {
      identity.entityType = "token";
      return true;
    }
    return false;
  }

  const vault = Vault.load(identity.account);
  if (vault) {
    if (identity.entityType != "vault") {
      identity.entityType = "vault";
      return true;
    }
    return false;
  }

  if (identity.entityType != "contract") {
    identity.entityType = "contract";
    return true;
  }

  return false;
}

export function refreshIdentityClassificationForAccount(
  address: Address
): void {
  const account = Account.load(address);
  if (!account) {
    return;
  }

  const identities = account.identities.load();
  if (identities.length === 0) {
    return;
  }

  for (let i = 0; i < identities.length; i++) {
    const identity = identities[i];
    if (updateIdentityEntityType(identity)) {
      identity.save();
    }
  }
}
