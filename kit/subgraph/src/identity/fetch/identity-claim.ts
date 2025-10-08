import { Address, Bytes } from "@graphprotocol/graph-ts";
import { Identity, IdentityClaim } from "../../../generated/schema";

export function fetchIdentityClaim(
  identity: Identity,
  address: Bytes
): IdentityClaim {
  const id = identity.id.concat(address);
  let identityClaim = IdentityClaim.load(id);

  if (!identityClaim) {
    identityClaim = new IdentityClaim(id);
    identityClaim.issuer = Address.zero();
    identityClaim.identity = identity.id;
    identityClaim.name = "";
    identityClaim.revoked = false;
    identityClaim.deployedInTransaction = Bytes.empty();
    identityClaim.signature = Bytes.empty().toHexString();
    identityClaim.topicScheme = Bytes.empty();

    identityClaim.save();
  }

  return identityClaim;
}
