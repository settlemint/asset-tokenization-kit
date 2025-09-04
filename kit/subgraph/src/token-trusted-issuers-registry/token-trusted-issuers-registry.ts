import {
  ClaimTopicsUpdated as ClaimTopicsUpdatedEvent,
  TrustedIssuerAdded as TrustedIssuerAddedEvent,
  TrustedIssuerRemoved as TrustedIssuerRemovedEvent,
} from "../../generated/templates/TokenTrustedIssuersRegistry/TokenTrustedIssuersRegistry";
import { fetchEvent } from "../event/fetch/event";

export function handleTrustedIssuerAdded(event: TrustedIssuerAddedEvent): void {
  fetchEvent(event, "TrustedIssuerAdded");
}

export function handleTrustedIssuerRemoved(
  event: TrustedIssuerRemovedEvent
): void {
  fetchEvent(event, "TrustedIssuerRemoved");
}

export function handleClaimTopicsUpdated(event: ClaimTopicsUpdatedEvent): void {
  fetchEvent(event, "ClaimTopicsUpdated");
}
