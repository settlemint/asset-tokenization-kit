import { Bytes } from "@graphprotocol/graph-ts";
import { Identity, IdentityKey } from "../../../generated/schema";

export function fetchIdentityKey(identity: Identity, key: Bytes): IdentityKey {
  const id = identity.id.concat(key);
  let identityKey = IdentityKey.load(id);
  if (!identityKey) {
    identityKey = new IdentityKey(id);
    identityKey.identity = identity.id;
    identityKey.key = key;
    identityKey.purpose = "unknown";
    identityKey.type = "unknown";
    identityKey.deployedInTransaction = Bytes.empty();
    identityKey.save();
  }
  return identityKey;
}
