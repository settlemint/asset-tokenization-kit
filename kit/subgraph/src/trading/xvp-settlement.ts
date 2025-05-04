import {
  XvPSettlementApprovalRevoked,
  XvPSettlementApproved,
  XvPSettlementCancelled,
  XvPSettlementClaimed,
} from "../../generated/templates/XvPSettlement/XvPSettlement";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { fetchApproval, fetchXvPSettlement } from "./fetch/xvp-settlement";

export function handleXvPSettlementApproved(
  event: XvPSettlementApproved
): void {
  createActivityLogEntry(
    event,
    EventType.XvPSettlementApproved,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );
}

export function handleXvPSettlementApprovalRevoked(
  event: XvPSettlementApprovalRevoked
): void {
  createActivityLogEntry(
    event,
    EventType.XvPSettlementApprovalRevoked,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );
  const approval = fetchApproval(event.address, event.transaction.from);
  approval.save();
}

export function handleXvPSettlementClaimed(event: XvPSettlementClaimed): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  createActivityLogEntry(
    event,
    EventType.XvPSettlementClaimed,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );

  xvpSettlement.claimed = true;
  xvpSettlement.save();
}

export function handleXvPSettlementCancelled(
  event: XvPSettlementCancelled
): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  createActivityLogEntry(
    event,
    EventType.XvPSettlementCancelled,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    []
  );

  xvpSettlement.cancelled = true;
  xvpSettlement.save();
}
