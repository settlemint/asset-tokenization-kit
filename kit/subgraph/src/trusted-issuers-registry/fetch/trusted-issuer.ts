import { Address, Bytes } from "@graphprotocol/graph-ts";
import { TrustedIssuer } from "../../../generated/schema";

export function fetchTrustedIssuer(address: Address): TrustedIssuer {
  let trustedIssuer = TrustedIssuer.load(address);

  if (!trustedIssuer) {
    trustedIssuer = new TrustedIssuer(address);
    trustedIssuer.deployedInTransaction = Bytes.empty();
    trustedIssuer.registry = Address.zero();
    trustedIssuer.claimTopics = [];
    trustedIssuer.save();
  }

  return trustedIssuer;
}
