import { Bytes } from '@graphprotocol/graph-ts';
import {
  type IdentityClaim,
  IdentityClaimValue,
} from '../../../generated/schema';

export function fetchIdentityClaimValue(
  claim: IdentityClaim,
  key: string
): IdentityClaimValue {
  const id = claim.id.concat(Bytes.fromUTF8(key));
  let identityClaimValue = IdentityClaimValue.load(id);

  if (!identityClaimValue) {
    identityClaimValue = new IdentityClaimValue(id);
    identityClaimValue.claim = claim.id;
    identityClaimValue.key = key;
    identityClaimValue.value = '';
  }

  return identityClaimValue;
}
