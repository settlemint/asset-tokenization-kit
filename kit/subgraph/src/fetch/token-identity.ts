import { Address } from "@graphprotocol/graph-ts";
import { TokenIdentity } from "../../generated/schema";
import { TokenIdentity as TokenIdentityTemplate } from "../../generated/templates";

export function fetchTokenIdentity(address: Address): TokenIdentity {
  let tokenIdentity = TokenIdentity.load(address);

  if (!tokenIdentity) {
    tokenIdentity = new TokenIdentity(address);
    tokenIdentity.save();
    TokenIdentityTemplate.create(address);
  }

  return tokenIdentity;
}
