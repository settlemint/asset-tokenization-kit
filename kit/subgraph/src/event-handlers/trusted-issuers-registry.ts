import {
  ClaimTopicsUpdated,
  TrustedIssuerAdded,
  TrustedIssuerRemoved,
} from "../../generated/templates/TrustedIssuersRegistry/TrustedIssuersRegistry";
import { processEvent } from "../shared/event";

export function handleClaimTopicsUpdated(event: ClaimTopicsUpdated): void {
  processEvent(event, "ClaimTopicsUpdated");
}

export function handleTrustedIssuerAdded(event: TrustedIssuerAdded): void {
  processEvent(event, "TrustedIssuerAdded");
}

export function handleTrustedIssuerRemoved(event: TrustedIssuerRemoved): void {
  processEvent(event, "TrustedIssuerRemoved");
}
