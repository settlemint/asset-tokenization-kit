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
  createActivityLogEntry(event, EventType.XvPSettlementApproved, []);
}

export function handleXvPSettlementApprovalRevoked(
  event: XvPSettlementApprovalRevoked
): void {
  createActivityLogEntry(event, EventType.XvPSettlementApprovalRevoked, []);
  const approval = fetchApproval(event.address, event.transaction.from);
  approval.save();
}

export function handleXvPSettlementClaimed(event: XvPSettlementClaimed): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  createActivityLogEntry(event, EventType.XvPSettlementClaimed, []);

  xvpSettlement.claimed = true;
  xvpSettlement.save();
}

export function handleXvPSettlementCancelled(
  event: XvPSettlementCancelled
): void {
  let xvpSettlement = fetchXvPSettlement(event.address);
  createActivityLogEntry(event, EventType.XvPSettlementCancelled, []);

  xvpSettlement.cancelled = true;
  xvpSettlement.save();
}
