import {
  Approved,
  ClaimAdded,
  ClaimChanged,
  ClaimRemoved,
  Executed,
  ExecutionFailed,
  ExecutionRequested,
  KeyAdded,
  KeyRemoved,
} from "../../generated/templates/Identity/Identity";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "./fetch/identity";
import { fetchIdentityClaim } from "./fetch/identity-claim";
import { decodeClaimValues } from "./utils/decode-claim";

export function handleApproved(event: Approved): void {
  fetchEvent(event, "Approved");
}

export function handleClaimAdded(event: ClaimAdded): void {
  fetchEvent(event, "ClaimAdded");
  const identity = fetchIdentity(event.address);
  const identityClaim = fetchIdentityClaim(identity, event.params.claimId);
  identityClaim.issuer = fetchAccount(event.params.issuer).id;
  identityClaim.uri = event.params.uri;
  identityClaim.save();

  // Decode claim data and create IdentityClaimValue entities
  decodeClaimValues(identityClaim, event.params.topic, event.params.data);
}

export function handleClaimChanged(event: ClaimChanged): void {
  fetchEvent(event, "ClaimChanged");
  const identity = fetchIdentity(event.address);
  const identityClaim = fetchIdentityClaim(identity, event.params.claimId);
  identityClaim.issuer = fetchAccount(event.params.issuer).id;
  identityClaim.uri = event.params.uri;
  identityClaim.save();

  // Decode claim data and create IdentityClaimValue entities
  decodeClaimValues(identityClaim, event.params.topic, event.params.data);
}

export function handleClaimRemoved(event: ClaimRemoved): void {
  fetchEvent(event, "ClaimRemoved");
  const identity = fetchIdentity(event.address);
  const identityClaim = fetchIdentityClaim(identity, event.params.claimId);
  identityClaim.revoked = true;
  identityClaim.save();
}

export function handleExecuted(event: Executed): void {
  fetchEvent(event, "Executed");
}

export function handleExecutionFailed(event: ExecutionFailed): void {
  fetchEvent(event, "ExecutionFailed");
}

export function handleExecutionRequested(event: ExecutionRequested): void {
  fetchEvent(event, "ExecutionRequested");
}

export function handleKeyAdded(event: KeyAdded): void {
  fetchEvent(event, "KeyAdded");
}

export function handleKeyRemoved(event: KeyRemoved): void {
  fetchEvent(event, "KeyRemoved");
}
