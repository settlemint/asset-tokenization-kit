import {
  Approved,
  ClaimAdded,
  ClaimChanged,
  ClaimRemoved,
  Executed,
  ExecutionFailed,
  ExecutionRequested,
  Initialized,
  KeyAdded,
  KeyRemoved,
} from "../../generated/templates/TokenIdentity/TokenIdentity";
import { processEvent } from "../shared/event/event";

export function handleApproved(event: Approved): void {
  processEvent(event, "Approved");
}

export function handleClaimAdded(event: ClaimAdded): void {
  processEvent(event, "ClaimAdded");
}

export function handleClaimChanged(event: ClaimChanged): void {
  processEvent(event, "ClaimChanged");
}

export function handleClaimRemoved(event: ClaimRemoved): void {
  processEvent(event, "ClaimRemoved");
}

export function handleExecuted(event: Executed): void {
  processEvent(event, "Executed");
}

export function handleExecutionFailed(event: ExecutionFailed): void {
  processEvent(event, "ExecutionFailed");
}

export function handleExecutionRequested(event: ExecutionRequested): void {
  processEvent(event, "ExecutionRequested");
}

export function handleInitialized(event: Initialized): void {
  processEvent(event, "Initialized");
}

export function handleKeyAdded(event: KeyAdded): void {
  processEvent(event, "KeyAdded");
}

export function handleKeyRemoved(event: KeyRemoved): void {
  processEvent(event, "KeyRemoved");
}
