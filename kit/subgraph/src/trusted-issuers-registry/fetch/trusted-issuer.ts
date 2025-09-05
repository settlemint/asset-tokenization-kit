import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TrustedIssuer } from "../../../generated/schema";
import { fetchIdentity } from "../../identity/fetch/identity";

export function fetchTrustedIssuer(address: Address): TrustedIssuer {
  let trustedIssuer = TrustedIssuer.load(address);

  if (!trustedIssuer) {
    const identity = fetchIdentity(address);
    trustedIssuer = new TrustedIssuer(address);
    trustedIssuer.deployedInTransaction = Bytes.empty();
    trustedIssuer.registry = Address.zero();
    trustedIssuer.claimTopics = [];
    trustedIssuer.account = identity.account;
    trustedIssuer.addedAt = BigInt.zero();
    trustedIssuer.revokedAt = BigInt.zero();
    trustedIssuer.save();
  }

  return trustedIssuer;
}
