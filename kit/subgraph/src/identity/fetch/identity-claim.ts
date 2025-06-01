import { Bytes } from "@graphprotocol/graph-ts";
import { Identity, IdentityClaim } from "../../../../generated/schema";

export function fetchIdentityClaim(
  identity: Identity,
  address: Bytes,
): IdentityClaim {
  const id = identity.id.concat(address);
  let identityClaim = IdentityClaim.load(id);

  if (!identityClaim) {
    identityClaim = new IdentityClaim(id);
    identityClaim.identity = identity.id;
    identityClaim.name = "";
    identityClaim.revoked = false;
    identityClaim.save();
  }

  return identityClaim;
}
